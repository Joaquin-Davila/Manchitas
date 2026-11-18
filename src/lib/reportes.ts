import { FunctionsHttpError } from '@supabase/supabase-js'
import type { DatosReporte, Reporte, SeguimientoReporte } from '../types/reporte'
import { generarFolioReporte } from './identificadores'
import { clienteRemoto, haySupabase } from './supabase'

// Repositorio de reportes ciudadanos (sin cuenta).
//   - Con Supabase: el envío pasa por la función de Edge `enviar-reporte`, que valida, sube la
//     evidencia y aplica el límite de envíos por IP en el servidor; el seguimiento usa la función
//     `seguimiento_reporte`, que solo devuelve folio, tipo, fecha y estado.
//   - Sin Supabase: localStorage. Ese límite se puede saltar borrando los datos del navegador;
//     solo sirve para el prototipo.
const CLAVE = 'manchitas.reportes'
const CLAVE_ENVIOS = 'manchitas.reportes.envios'

export const LIMITE_ENVIOS = 3
const VENTANA_MS = 24 * 60 * 60 * 1000

function leer<T>(clave: string, porDefecto: T): T {
  try {
    const texto = localStorage.getItem(clave)
    return texto ? (JSON.parse(texto) as T) : porDefecto
  } catch {
    return porDefecto
  }
}

function escribir(clave: string, valor: unknown) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor))
  } catch {
    throw new Error('No pudimos guardar tu reporte en este dispositivo. Prueba con menos fotos o más pequeñas.')
  }
}

/** Marcas de tiempo de los envíos de las últimas 24 horas. */
function enviosRecientes(ahora: number): number[] {
  return leer<number[]>(CLAVE_ENVIOS, []).filter((t) => ahora - t < VENTANA_MS)
}

/**
 * Cuántos reportes más puede enviar este dispositivo hoy. Con Supabase el servidor es quien
 * cuenta (por IP), así que de entrada no se sabe y se asume el máximo; si ya se pasó, el envío
 * responde con el aviso.
 */
export async function enviosDisponibles(ahora = Date.now()): Promise<number> {
  if (haySupabase) return LIMITE_ENVIOS
  return Math.max(0, LIMITE_ENVIOS - enviosRecientes(ahora).length)
}

/** Acepta "rep-4m8q2x", "REP4M8Q2X" o con espacios; devuelve null si no tiene el formato. */
export function normalizarFolioReporte(texto: string): string | null {
  const limpio = texto.toUpperCase().replace(/[\s-]/g, '')
  const m = /^REP([A-HJ-NP-Z2-9]{6})$/.exec(limpio)
  return m ? `REP-${m[1]}` : null
}

async function enviarRemoto(datos: DatosReporte, trampa: string): Promise<string> {
  const { data, error } = await clienteRemoto().functions.invoke('enviar-reporte', {
    body: { datos, trampa },
  })
  if (error) {
    // Los errores de la función traen un mensaje ya redactado en español.
    if (error instanceof FunctionsHttpError) {
      const detalle = (await error.context.json().catch(() => null)) as { error?: string } | null
      if (detalle?.error) throw new Error(detalle.error)
    }
    throw new Error('No pudimos enviar tu reporte. Revisa tu conexión e inténtalo de nuevo.')
  }
  const folio = (data as { folio?: string } | null)?.folio
  if (!folio) throw new Error('No pudimos enviar tu reporte. Inténtalo de nuevo.')
  return folio
}

/**
 * Guarda el reporte y devuelve su folio. Si el campo trampa (`trampa`) viene lleno es un bot:
 * se responde igual que a una persona, pero no se guarda nada.
 */
export async function enviarReporte(datos: DatosReporte, trampa = ''): Promise<string> {
  if (haySupabase) return enviarRemoto(datos, trampa)

  const ahora = Date.now()
  const recientes = enviosRecientes(ahora)
  if (recientes.length >= LIMITE_ENVIOS) {
    throw new Error(
      `Ya enviaste ${LIMITE_ENVIOS} reportes en las últimas 24 horas. Si es una emergencia, llama al 911.`,
    )
  }

  const folio = generarFolioReporte()
  if (trampa) return folio

  const todos = leer<Reporte[]>(CLAVE, [])
  let unico = folio
  while (todos.some((r) => r.folio === unico)) unico = generarFolioReporte()

  const reporte: Reporte = {
    ...datos,
    telefono: datos.telefono?.replace(/\D/g, '') || undefined,
    folio: unico,
    creadoEn: new Date(ahora).toISOString(),
    estado: 'recibido',
  }
  escribir(CLAVE, [...todos, reporte])
  escribir(CLAVE_ENVIOS, [...recientes, ahora])
  return unico
}

type FilaSeguimiento = {
  folio: string
  tipo: SeguimientoReporte['tipo']
  creado_en: string
  estado: SeguimientoReporte['estado']
}

/** Devuelve null si no existe. Falla si se hacen demasiadas consultas seguidas. */
export async function seguimientoPorFolio(texto: string): Promise<SeguimientoReporte | null> {
  const folio = normalizarFolioReporte(texto)
  if (!folio) return null

  if (haySupabase) {
    const { data, error } = await clienteRemoto().rpc('seguimiento_reporte', { p_folio: folio })
    if (error) {
      throw new Error(
        error.message.includes('limite_excedido')
          ? 'Hiciste muchas consultas seguidas. Espera unos minutos e inténtalo de nuevo.'
          : 'No pudimos consultar el folio. Revisa tu conexión e inténtalo de nuevo.',
      )
    }
    const f = (data as FilaSeguimiento[] | null)?.[0]
    return f ? { folio: f.folio, tipo: f.tipo, creadoEn: f.creado_en, estado: f.estado } : null
  }

  const r = leer<Reporte[]>(CLAVE, []).find((x) => x.folio === folio)
  return r ? { folio: r.folio, tipo: r.tipo, creadoEn: r.creadoEn, estado: r.estado } : null
}
