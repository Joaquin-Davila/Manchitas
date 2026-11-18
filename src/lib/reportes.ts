import type { DatosReporte, Reporte, SeguimientoReporte } from '../types/reporte'
import { generarFolioReporte } from './identificadores'

// Repositorio de reportes ciudadanos. Hoy guarda en localStorage; en el paso 10 se reemplaza por
// Supabase sin tocar las pantallas. Ahí el límite de envíos y la consulta por folio pasan al
// servidor (por IP, con verificación), porque el límite de este archivo se puede saltar borrando
// los datos del navegador.
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

/** Cuántos reportes más puede enviar este dispositivo hoy. */
export async function enviosDisponibles(ahora = Date.now()): Promise<number> {
  return Math.max(0, LIMITE_ENVIOS - enviosRecientes(ahora).length)
}

/** Acepta "rep-4m8q2x", "REP4M8Q2X" o con espacios; devuelve null si no tiene el formato. */
export function normalizarFolioReporte(texto: string): string | null {
  const limpio = texto.toUpperCase().replace(/[\s-]/g, '')
  const m = /^REP([A-HJ-NP-Z2-9]{6})$/.exec(limpio)
  return m ? `REP-${m[1]}` : null
}

/**
 * Guarda el reporte y devuelve su folio. Si el campo trampa (`trampa`) viene lleno es un bot:
 * se responde igual que a una persona, pero no se guarda nada.
 */
export async function enviarReporte(datos: DatosReporte, trampa = ''): Promise<string> {
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

export async function seguimientoPorFolio(texto: string): Promise<SeguimientoReporte | null> {
  const folio = normalizarFolioReporte(texto)
  if (!folio) return null
  const r = leer<Reporte[]>(CLAVE, []).find((x) => x.folio === folio)
  return r ? { folio: r.folio, tipo: r.tipo, creadoEn: r.creadoEn, estado: r.estado } : null
}
