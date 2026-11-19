import { clienteRemoto, haySupabase } from './supabase'

// Directorio de establecimientos (veterinarias, clínicas, tiendas...), sus promociones y reseñas.
// Todo viene de Supabase y es de solo lectura, salvo las reseñas propias (crear y borrar). Sin
// Supabase (modo local) no hay directorio: las lecturas devuelven listas vacías.

export type TipoEstablecimiento = 'veterinaria' | 'clinica_24h' | 'tienda' | 'estetica' | 'albergue' | 'punto_campanas'

export const NOMBRE_TIPO: Record<TipoEstablecimiento, string> = {
  veterinaria: 'Veterinaria',
  clinica_24h: 'Clínica 24 h',
  tienda: 'Tienda de mascotas',
  estetica: 'Estética canina',
  albergue: 'Albergue',
  punto_campanas: 'Punto de campañas',
}

export type Establecimiento = {
  id: string
  nombre: string
  tipo: TipoEstablecimiento
  descripcion: string
  zona: string
  lat?: number
  lng?: number
  horario: string
  servicios: string[]
  abierto24h: boolean
  foto?: string
  /** Promedio de 1 a 5 (0 si todavía no tiene reseñas). */
  calificacion: number
  totalResenas: number
  demo: boolean
}

export type Promocion = {
  id: string
  establecimientoId: string
  establecimiento?: { nombre: string; zona: string }
  titulo: string
  descripcion: string
  beneficio: string
  condiciones: string
  /** Último día de vigencia, AAAA-MM-DD. */
  hasta: string
  demo: boolean
}

export type Resena = {
  id: string
  autor: string
  puntuacion: number
  comentario: string
  /** Un moderador confirmó que la persona fue clienta del establecimiento. */
  verificada: boolean
  respuesta?: string
  respuestaEn?: string
  creadoEn: string
  demo: boolean
  /** La escribió la persona con sesión: puede borrarla. */
  propia: boolean
}

type FilaEstablecimiento = {
  id: string
  nombre: string
  tipo: string
  descripcion: string
  zona: string
  lat: number | null
  lng: number | null
  horario: string
  servicios: string[]
  abierto_24h: boolean
  foto: string | null
  calificacion: number | string
  total_resenas: number
  es_demo: boolean
}

function aEstablecimiento(f: FilaEstablecimiento): Establecimiento {
  return {
    id: f.id,
    nombre: f.nombre,
    tipo: f.tipo as TipoEstablecimiento,
    descripcion: f.descripcion,
    zona: f.zona,
    lat: f.lat ?? undefined,
    lng: f.lng ?? undefined,
    horario: f.horario,
    servicios: f.servicios ?? [],
    abierto24h: f.abierto_24h,
    foto: f.foto ?? undefined,
    calificacion: Number(f.calificacion),
    totalResenas: f.total_resenas,
    demo: f.es_demo,
  }
}

export async function listarEstablecimientos(): Promise<Establecimiento[]> {
  if (!haySupabase) return []
  const { data, error } = await clienteRemoto().from('establecimientos_resumen').select('*').order('nombre')
  if (error) throw new Error('No pudimos cargar las veterinarias. Revisa tu conexión.')
  return (data as FilaEstablecimiento[]).map(aEstablecimiento)
}

export async function obtenerEstablecimiento(id: string): Promise<Establecimiento | null> {
  if (!haySupabase) return null
  const { data, error } = await clienteRemoto().from('establecimientos_resumen').select('*').eq('id', id).maybeSingle()
  // 22P02: el id de la URL no es un uuid válido; se trata como "no existe".
  if (error && error.code !== '22P02') throw new Error('No pudimos cargar este lugar. Revisa tu conexión.')
  return data ? aEstablecimiento(data as FilaEstablecimiento) : null
}

type FilaPromocion = {
  id: string
  establecimiento_id: string
  titulo: string
  descripcion: string
  beneficio: string
  condiciones: string
  vigente_hasta: string
  es_demo: boolean
  establecimiento?: { nombre: string; zona: string } | { nombre: string; zona: string }[] | null
}

const unico = <T,>(x: T | T[] | null | undefined): T | undefined => (Array.isArray(x) ? x[0] : (x ?? undefined))

function aPromocion(f: FilaPromocion): Promocion {
  return {
    id: f.id,
    establecimientoId: f.establecimiento_id,
    establecimiento: unico(f.establecimiento),
    titulo: f.titulo,
    descripcion: f.descripcion,
    beneficio: f.beneficio,
    condiciones: f.condiciones,
    hasta: f.vigente_hasta,
    demo: f.es_demo,
  }
}

const COLUMNAS_PROMO =
  'id, establecimiento_id, titulo, descripcion, beneficio, condiciones, vigente_hasta, es_demo, establecimiento:establecimientos(nombre, zona)'

/** Promociones vigentes de todos los establecimientos (las más próximas a vencer, primero). */
export async function promocionesVigentes(limite = 6): Promise<Promocion[]> {
  if (!haySupabase) return []
  const { data, error } = await clienteRemoto()
    .from('promociones')
    .select(COLUMNAS_PROMO)
    .order('vigente_hasta', { ascending: true })
    .limit(limite)
  if (error) throw new Error('No pudimos cargar las promociones.')
  return (data as unknown as FilaPromocion[]).map(aPromocion)
}

export async function promocionesDe(establecimientoId: string): Promise<Promocion[]> {
  if (!haySupabase) return []
  const { data, error } = await clienteRemoto()
    .from('promociones')
    .select(COLUMNAS_PROMO)
    .eq('establecimiento_id', establecimientoId)
    .order('vigente_hasta', { ascending: true })
  if (error) throw new Error('No pudimos cargar las promociones.')
  return (data as unknown as FilaPromocion[]).map(aPromocion)
}

export async function resenasDe(establecimientoId: string, usuarioId?: string): Promise<Resena[]> {
  if (!haySupabase) return []
  const { data, error } = await clienteRemoto()
    .from('resenas')
    .select('id, autor_id, autor_nombre, puntuacion, comentario, verificada, respuesta, respuesta_en, es_demo, creado_en')
    .eq('establecimiento_id', establecimientoId)
    .order('creado_en', { ascending: false })
  if (error) throw new Error('No pudimos cargar las reseñas. Revisa tu conexión.')
  return data.map((r) => ({
    id: r.id,
    autor: r.autor_nombre,
    puntuacion: r.puntuacion,
    comentario: r.comentario,
    verificada: r.verificada,
    respuesta: r.respuesta ?? undefined,
    respuestaEn: r.respuesta_en ?? undefined,
    creadoEn: r.creado_en,
    demo: r.es_demo,
    propia: !!usuarioId && r.autor_id === usuarioId,
  }))
}

export async function crearResena(establecimientoId: string, puntuacion: number, comentario: string): Promise<void> {
  const { error } = await clienteRemoto()
    .from('resenas')
    .insert({ establecimiento_id: establecimientoId, puntuacion, comentario: comentario.trim() })
  if (error) {
    // 23505: ya hay una reseña de esta persona para este lugar.
    if (error.code === '23505') throw new Error('Ya dejaste una reseña en este lugar. Puedes borrarla y escribir otra.')
    throw new Error('No pudimos publicar tu reseña. Inténtalo de nuevo.')
  }
}

export async function borrarResena(id: string): Promise<void> {
  const { error } = await clienteRemoto().from('resenas').delete().eq('id', id)
  if (error) throw new Error('No pudimos borrar tu reseña. Inténtalo de nuevo.')
}

/** "Cómo llegar" a una zona aproximada, sin clave (OpenStreetMap). */
export function enlaceComoLlegar(e: Pick<Establecimiento, 'lat' | 'lng'>): string | undefined {
  if (e.lat === undefined || e.lng === undefined) return undefined
  return `https://www.openstreetmap.org/directions?route=%3B${e.lat}%2C${e.lng}`
}
