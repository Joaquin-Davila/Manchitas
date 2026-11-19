import { subirFoto } from './almacenamiento'
import { clienteRemoto, haySupabase } from './supabase'

// Manchitas Solidario: campañas de recaudación. NO HAY PASARELA DE PAGO. Una aportación hecha desde
// la app queda "pendiente" y "simulada": nunca suma al dinero recaudado. Solo cuentan las
// confirmadas, que hoy existen únicamente como datos de demostración.

export type EstadoColecta = 'borrador' | 'en_revision' | 'publicada' | 'rechazada' | 'finalizada'
export type TipoBeneficiario = 'mascota' | 'albergue' | 'rescatista' | 'campana'

export const NOMBRE_BENEFICIARIO: Record<TipoBeneficiario, string> = {
  mascota: 'Una mascota',
  albergue: 'Un albergue',
  rescatista: 'Una persona rescatista',
  campana: 'Una jornada o campaña',
}

export const NOMBRE_ESTADO_COLECTA: Record<EstadoColecta, string> = {
  borrador: 'Borrador',
  en_revision: 'En revisión',
  publicada: 'Publicada',
  rechazada: 'Rechazada',
  finalizada: 'Finalizada',
}

export type Colecta = {
  id: string
  organizador: string
  titulo: string
  resumen: string
  historia: string
  beneficiarioTipo: TipoBeneficiario
  beneficiario: string
  meta: number
  /** Solo suma aportaciones confirmadas. */
  recaudado: number
  donantes: number
  fotoPrincipal?: string
  estado: EstadoColecta
  motivoRechazo?: string
  /** AAAA-MM-DD */
  fechaFin: string
  creadaEn: string
  demo: boolean
  /** La creó la persona con sesión. */
  esMia: boolean
}

export type Gasto = { id: string; concepto: string; monto: number }
export type Actualizacion = { id: string; titulo: string; texto: string; creadoEn: string }

export type EstadoAportacion = 'pendiente' | 'confirmada' | 'fallida' | 'reembolsada'
export type Aportacion = {
  id: string
  donante: string
  anonima: boolean
  monto: number
  mensaje: string
  estado: EstadoAportacion
  simulada: boolean
  demo: boolean
  creadaEn: string
  /** La hizo la persona con sesión. */
  mia: boolean
}

export type DetalleColecta = { colecta: Colecta; gastos: Gasto[]; actualizaciones: Actualizacion[]; aportaciones: Aportacion[] }

type FilaColecta = {
  id: string
  organizador_id: string | null
  organizador_nombre: string
  titulo: string
  resumen: string
  historia: string
  beneficiario_tipo: string
  beneficiario_nombre: string
  meta_mxn: number
  recaudado_mxn: number
  donantes: number
  foto_principal: string | null
  estado: string
  motivo_rechazo: string | null
  fecha_fin: string
  creado_en: string
  es_demo: boolean
}

function aColecta(f: FilaColecta, usuarioId?: string): Colecta {
  return {
    id: f.id,
    organizador: f.organizador_nombre,
    titulo: f.titulo,
    resumen: f.resumen,
    historia: f.historia,
    beneficiarioTipo: f.beneficiario_tipo as TipoBeneficiario,
    beneficiario: f.beneficiario_nombre,
    meta: f.meta_mxn,
    recaudado: f.recaudado_mxn,
    donantes: f.donantes,
    fotoPrincipal: f.foto_principal ?? undefined,
    estado: f.estado as EstadoColecta,
    motivoRechazo: f.motivo_rechazo ?? undefined,
    fechaFin: f.fecha_fin,
    creadaEn: f.creado_en,
    demo: f.es_demo,
    esMia: !!usuarioId && f.organizador_id === usuarioId,
  }
}

/** Porcentaje de avance redondeado, con tope en 100. */
export function porcentaje(recaudado: number, meta: number): number {
  return meta > 0 ? Math.min(100, Math.round((recaudado / meta) * 100)) : 0
}

/** Las fotos pueden ser archivos de la app ("/img/...") o rutas del bucket `colectas-fotos`. */
export function urlFotoColecta(ruta: string | undefined): string | undefined {
  if (!ruta) return undefined
  if (ruta.startsWith('/') || ruta.startsWith('http')) return ruta
  return clienteRemoto().storage.from('colectas-fotos').getPublicUrl(ruta).data.publicUrl
}

export async function listarColectas(usuarioId?: string): Promise<Colecta[]> {
  if (!haySupabase) return []
  const { data, error } = await clienteRemoto()
    .from('colectas_resumen')
    .select('*')
    .eq('estado', 'publicada')
    .order('creado_en', { ascending: false })
  if (error) throw new Error('No pudimos cargar las campañas. Revisa tu conexión.')
  return (data as FilaColecta[]).map((f) => aColecta(f, usuarioId))
}

/** Campañas de la persona en cualquier estado (borrador, en revisión, rechazadas...). */
export async function misColectas(usuarioId: string): Promise<Colecta[]> {
  if (!haySupabase) return []
  const { data, error } = await clienteRemoto()
    .from('colectas_resumen')
    .select('*')
    .eq('organizador_id', usuarioId)
    .order('creado_en', { ascending: false })
  if (error) throw new Error('No pudimos cargar tus campañas. Revisa tu conexión.')
  return (data as FilaColecta[]).map((f) => aColecta(f, usuarioId))
}

export async function obtenerColecta(id: string, usuarioId?: string): Promise<DetalleColecta | null> {
  if (!haySupabase) return null
  const db = clienteRemoto()
  const { data, error } = await db.from('colectas_resumen').select('*').eq('id', id).maybeSingle()
  if (error && error.code !== '22P02') throw new Error('No pudimos cargar esta campaña. Revisa tu conexión.')
  if (!data) return null
  const [gastos, actualizaciones, aportaciones] = await Promise.all([
    db.from('colecta_gastos').select('id, concepto, monto_mxn').eq('colecta_id', id).order('monto_mxn', { ascending: false }),
    db.from('colecta_actualizaciones').select('id, titulo, texto, creado_en').eq('colecta_id', id).order('creado_en', { ascending: false }),
    db
      .from('aportaciones')
      .select('id, donante_id, donante_nombre, anonima, monto_mxn, mensaje, estado, simulada, es_demo, creado_en')
      .eq('colecta_id', id)
      .order('creado_en', { ascending: false })
      .limit(50),
  ])
  if (gastos.error || actualizaciones.error || aportaciones.error) {
    throw new Error('No pudimos cargar esta campaña. Revisa tu conexión.')
  }
  return {
    colecta: aColecta(data as FilaColecta, usuarioId),
    gastos: gastos.data.map((g) => ({ id: g.id, concepto: g.concepto, monto: g.monto_mxn })),
    actualizaciones: actualizaciones.data.map((a) => ({ id: a.id, titulo: a.titulo, texto: a.texto, creadoEn: a.creado_en })),
    aportaciones: aportaciones.data.map((a) => ({
      id: a.id,
      donante: a.donante_nombre,
      anonima: a.anonima,
      monto: a.monto_mxn,
      mensaje: a.mensaje,
      estado: a.estado as EstadoAportacion,
      simulada: a.simulada,
      demo: a.es_demo,
      creadaEn: a.creado_en,
      mia: !!usuarioId && a.donante_id === usuarioId,
    })),
  }
}

export type DatosNuevaColecta = {
  titulo: string
  resumen: string
  historia: string
  beneficiarioTipo: TipoBeneficiario
  beneficiario: string
  meta: number
  fechaFin: string
  gastos: { concepto: string; monto: number }[]
  /** Fotos como data URL (ya reducidas); la primera es la principal. */
  fotos: string[]
}

function mensajeRpc(error: { message: string; code?: string }, porDefecto: string): string {
  if (error.message.includes('limite_excedido')) return 'Hiciste demasiados intentos. Espera un rato e inténtalo de nuevo.'
  if (error.message.includes('desglose_no_suma_meta')) return 'El desglose de gastos debe sumar exactamente la meta.'
  if (error.message.includes('colecta_no_disponible')) return 'Esta campaña ya no recibe aportaciones.'
  return porDefecto
}

/** Sube las fotos y crea la campaña. Nace "en revisión": un moderador la valida antes de publicarse. */
export async function crearColecta(usuarioId: string, d: DatosNuevaColecta): Promise<string> {
  const rutas: string[] = []
  for (const foto of d.fotos) rutas.push(await subirFoto('colectas-fotos', usuarioId, foto))
  const { data, error } = await clienteRemoto().rpc('crear_colecta', {
    p_datos: {
      titulo: d.titulo.trim(),
      resumen: d.resumen.trim(),
      historia: d.historia.trim(),
      beneficiario_tipo: d.beneficiarioTipo,
      beneficiario_nombre: d.beneficiario.trim(),
      meta_mxn: d.meta,
      fecha_fin: d.fechaFin,
      foto_principal: rutas[0] ?? '',
      fotos: rutas.slice(1),
      gastos: d.gastos.map((g) => ({ concepto: g.concepto.trim(), monto_mxn: g.monto })),
    },
  })
  if (error) throw new Error(mensajeRpc(error, 'No pudimos enviar tu campaña. Revisa los datos e inténtalo de nuevo.'))
  return data as string
}

/** MODO DEMOSTRACIÓN: registra una aportación pendiente y simulada. No se cobra nada ni suma al recaudado. */
export async function registrarAportacion(colectaId: string, monto: number, mensaje: string, anonima: boolean): Promise<void> {
  const { error } = await clienteRemoto().rpc('registrar_aportacion', {
    p_colecta: colectaId,
    p_monto: monto,
    p_mensaje: mensaje.trim(),
    p_anonima: anonima,
  })
  if (error) throw new Error(mensajeRpc(error, 'No pudimos registrar tu aportación. Inténtalo de nuevo.'))
}

export async function publicarActualizacion(colectaId: string, titulo: string, texto: string): Promise<void> {
  const { error } = await clienteRemoto().rpc('publicar_actualizacion', {
    p_colecta: colectaId,
    p_titulo: titulo,
    p_texto: texto,
  })
  if (error) throw new Error('No pudimos publicar la actualización. Inténtalo de nuevo.')
}

const formatoPesos = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })

/** 15000 → "$15,000". */
export function pesos(monto: number): string {
  return formatoPesos.format(monto)
}

/** Días que faltan para `fechaFin` (AAAA-MM-DD) desde `hoy`; 0 o negativo si ya terminó. */
export function diasRestantes(fechaFin: string, hoy: string): number {
  const dia = 86400000
  return Math.round((Date.parse(`${fechaFin}T00:00:00Z`) - Date.parse(`${hoy}T00:00:00Z`)) / dia)
}
