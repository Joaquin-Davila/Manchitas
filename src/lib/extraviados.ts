import { subirFoto } from './almacenamiento'
import { clienteRemoto, haySupabase } from './supabase'

// Mascotas extraviadas, sus avistamientos y su foro. Todo vive en Supabase. El estado y los foros
// los cambia el servidor (cerrar_extravio y la automatización); el cliente nunca los escribe.

export type EstadoExtraviado = 'activo' | 'localizado' | 'cerrado'
export type Especie = 'perro' | 'gato'

export const NOMBRE_ESTADO_EXTRAVIADO: Record<EstadoExtraviado, string> = {
  activo: 'Extraviada',
  localizado: 'Localizada',
  cerrado: 'Reporte cerrado',
}

export type Extraviado = {
  id: string
  tutor: string
  /** El reporte es de la persona con sesión. */
  esMio: boolean
  mascotaId?: string
  nombre: string
  especie: Especie
  raza: string
  descripcion: string
  foto?: string
  /** AAAA-MM-DD */
  fecha: string
  /** Zona aproximada; nunca un domicilio. */
  zona: string
  contactoWhatsapp: boolean
  estado: EstadoExtraviado
  /** Días desde el extravío (el día del reporte es el 0). */
  dias: number
  foroId?: string
  foroEstado?: 'abierto' | 'cerrado'
  totalMensajes: number
  demo: boolean
}

export type Mensaje = {
  id: string
  autor: string
  tipo: 'avistamiento' | 'comentario'
  texto: string
  zona: string
  foto?: string
  creadoEn: string
  demo: boolean
  /** Lo escribió la persona con sesión. */
  mio: boolean
}

type Fila = {
  id: string
  tutor_id: string | null
  tutor_nombre: string
  mascota_id: string | null
  nombre: string
  especie: string
  raza: string
  descripcion: string
  foto: string | null
  fecha_extravio: string
  zona: string
  contacto_whatsapp: boolean
  estado: string
  dias: number
  foro_id: string | null
  foro_estado: string | null
  total_mensajes: number
  es_demo: boolean
}

/** Las fotos pueden ser de la app ("/img/...") o rutas del bucket público `mascotas-fotos`. */
export function urlFotoExtraviado(ruta: string | null | undefined): string | undefined {
  if (!ruta) return undefined
  if (ruta.startsWith('/') || ruta.startsWith('http')) return ruta
  return clienteRemoto().storage.from('mascotas-fotos').getPublicUrl(ruta).data.publicUrl
}

function aExtraviado(f: Fila, usuarioId?: string): Extraviado {
  return {
    id: f.id,
    tutor: f.tutor_nombre,
    esMio: !!usuarioId && f.tutor_id === usuarioId,
    mascotaId: f.mascota_id ?? undefined,
    nombre: f.nombre,
    especie: f.especie as Especie,
    raza: f.raza,
    descripcion: f.descripcion,
    foto: urlFotoExtraviado(f.foto),
    fecha: f.fecha_extravio,
    zona: f.zona,
    contactoWhatsapp: f.contacto_whatsapp,
    estado: f.estado as EstadoExtraviado,
    dias: f.dias,
    foroId: f.foro_id ?? undefined,
    foroEstado: (f.foro_estado as 'abierto' | 'cerrado' | null) ?? undefined,
    totalMensajes: f.total_mensajes,
    demo: f.es_demo,
  }
}

export async function listarExtraviados(usuarioId?: string): Promise<Extraviado[]> {
  if (!haySupabase) return []
  const { data, error } = await clienteRemoto()
    .from('extraviados_resumen')
    .select('*')
    .order('creado_en', { ascending: false })
  if (error) throw new Error('No pudimos cargar las mascotas extraviadas. Revisa tu conexión.')
  // Las activas primero (de la más reciente a la más antigua) y después las localizadas o cerradas.
  return (data as Fila[])
    .map((f) => aExtraviado(f, usuarioId))
    .sort((a, b) => Number(b.estado === 'activo') - Number(a.estado === 'activo'))
}

export async function obtenerExtraviado(id: string, usuarioId?: string): Promise<Extraviado | null> {
  if (!haySupabase) return null
  const { data, error } = await clienteRemoto().from('extraviados_resumen').select('*').eq('id', id).maybeSingle()
  if (error && error.code !== '22P02') throw new Error('No pudimos cargar este reporte. Revisa tu conexión.')
  return data ? aExtraviado(data as Fila, usuarioId) : null
}

export async function mensajesDe(id: string, usuarioId?: string): Promise<Mensaje[]> {
  if (!haySupabase) return []
  const { data, error } = await clienteRemoto()
    .from('extravio_mensajes')
    .select('id, autor_id, autor_nombre, tipo, texto, zona, foto, es_demo, creado_en')
    .eq('extraviado_id', id)
    .order('creado_en', { ascending: false })
  if (error) throw new Error('No pudimos cargar los avistamientos. Revisa tu conexión.')
  return data.map((m) => ({
    id: m.id,
    autor: m.autor_nombre,
    tipo: m.tipo as Mensaje['tipo'],
    texto: m.texto,
    zona: m.zona,
    foto: urlFotoExtraviado(m.foto),
    creadoEn: m.creado_en,
    demo: m.es_demo,
    mio: !!usuarioId && m.autor_id === usuarioId,
  }))
}

export type DatosNuevoExtraviado = {
  mascotaId?: string
  nombre: string
  especie: Especie
  raza: string
  descripcion: string
  /** Ruta de una foto que ya está en el bucket (la de la mascota registrada). */
  fotoRuta?: string
  /** Foto nueva como data URL (ya reducida). */
  fotoNueva?: string
  fechaExtravio: string
  zona: string
  contactoWhatsapp: boolean
}

function mensajeDe(error: { message: string; code?: string }, porDefecto: string): string {
  if (error.message.includes('limite_excedido')) return 'Hiciste demasiados intentos. Espera un rato e inténtalo de nuevo.'
  if (error.message.includes('fecha_invalida')) return 'La fecha del extravío debe ser de los últimos 30 días y no puede ser futura.'
  if (error.code === '42501') return 'No tienes permiso para hacer esto.'
  return porDefecto
}

export async function crearExtraviado(usuarioId: string, d: DatosNuevoExtraviado): Promise<string> {
  const foto = d.fotoNueva ? await subirFoto('mascotas-fotos', usuarioId, d.fotoNueva) : d.fotoRuta
  const { data, error } = await clienteRemoto()
    .from('extraviados')
    .insert({
      mascota_id: d.mascotaId ?? null,
      nombre: d.nombre.trim(),
      especie: d.especie,
      raza: d.raza.trim(),
      descripcion: d.descripcion.trim(),
      foto: foto ?? null,
      fecha_extravio: d.fechaExtravio,
      zona: d.zona.trim(),
      contacto_whatsapp: d.contactoWhatsapp,
    })
    .select('id')
    .single()
  if (error) throw new Error(mensajeDe(error, 'No pudimos publicar tu reporte. Revisa los datos e inténtalo de nuevo.'))
  return data.id as string
}

export async function publicarMensaje(
  usuarioId: string,
  extraviadoId: string,
  m: { tipo: Mensaje['tipo']; texto: string; zona: string; fotoNueva?: string },
): Promise<void> {
  const foto = m.fotoNueva ? await subirFoto('mascotas-fotos', usuarioId, m.fotoNueva) : null
  const { error } = await clienteRemoto().from('extravio_mensajes').insert({
    extraviado_id: extraviadoId,
    tipo: m.tipo,
    texto: m.texto.trim(),
    zona: m.tipo === 'avistamiento' ? m.zona.trim() : '',
    foto,
  })
  if (error) throw new Error(mensajeDe(error, 'No pudimos publicar tu mensaje. Inténtalo de nuevo.'))
}

export async function borrarMensaje(id: string): Promise<void> {
  const { error } = await clienteRemoto().from('extravio_mensajes').delete().eq('id', id)
  if (error) throw new Error('No pudimos borrar el mensaje. Inténtalo de nuevo.')
}

/** Marca el reporte como localizado (true) o lo cierra sin haberla encontrado (false). */
export async function cerrarExtravio(id: string, localizado: boolean): Promise<void> {
  const { error } = await clienteRemoto().rpc('cerrar_extravio', { p_id: id, p_localizado: localizado })
  if (error) throw new Error('No pudimos actualizar el reporte. Inténtalo de nuevo.')
}

export async function actualizarExtraviado(id: string, cambios: { descripcion: string; zona: string; contactoWhatsapp: boolean }): Promise<void> {
  const { error } = await clienteRemoto()
    .from('extraviados')
    .update({ descripcion: cambios.descripcion.trim(), zona: cambios.zona.trim(), contacto_whatsapp: cambios.contactoWhatsapp })
    .eq('id', id)
  if (error) throw new Error('No pudimos guardar los cambios. Inténtalo de nuevo.')
}

/** Enlace de WhatsApp del tutor, solo si autorizó el contacto en este reporte. */
export async function whatsappExtravio(id: string): Promise<string | null> {
  const { data, error } = await clienteRemoto().rpc('extravio_whatsapp', { p_id: id })
  if (error) return null
  return (data as string | null) ?? null
}
