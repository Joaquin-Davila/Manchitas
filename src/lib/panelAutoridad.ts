import type { EstadoReporte, TipoReporte } from '../types/reporte'
import { clienteRemoto } from './supabase'

// Lectura de reportes para el panel de autoridad. Solo existe con Supabase: la base decide quién
// puede leer (política `reportes_autoridad_leer` y `es_autoridad()`); aquí no se escribe nada.

export const POR_PAGINA = 20
/** Vida de las URLs firmadas de la evidencia. Se piden solo al abrir un reporte. */
const SEGUNDOS_URL = 5 * 60

export type ReporteAutoridad = {
  id: string
  folio: string
  tipo: TipoReporte
  estado: EstadoReporte
  colonia: string
  calle: string
  referencias: string
  lat: number | null
  lng: number | null
  descripcion: string
  /** AAAA-MM-DD */
  fechaHechos: string
  creadoEn: string
  /** Rutas en el bucket privado; no son URLs. */
  fotosPaths: string[]
  telefono: string | null
}

const COLUMNAS =
  'id, folio, tipo, estado, colonia, calle, referencias, lat, lng, descripcion, fecha_hechos, creado_en, fotos_paths, telefono'

type Fila = {
  id: string
  folio: string
  tipo: TipoReporte
  estado: EstadoReporte
  colonia: string
  calle: string
  referencias: string
  lat: number | null
  lng: number | null
  descripcion: string
  fecha_hechos: string
  creado_en: string
  fotos_paths: string[]
  telefono: string | null
}

function aReporte(f: Fila): ReporteAutoridad {
  return {
    id: f.id,
    folio: f.folio,
    tipo: f.tipo,
    estado: f.estado,
    colonia: f.colonia,
    calle: f.calle,
    referencias: f.referencias,
    lat: f.lat,
    lng: f.lng,
    descripcion: f.descripcion,
    fechaHechos: f.fecha_hechos,
    creadoEn: f.creado_en,
    fotosPaths: f.fotos_paths,
    telefono: f.telefono,
  }
}

export type PaginaReportes = { reportes: ReporteAutoridad[]; hayMas: boolean }

/** Los más recientes primero. Pide uno de más para saber si queda otra página. */
export async function listarReportes(pagina: number, estado?: EstadoReporte): Promise<PaginaReportes> {
  const desde = pagina * POR_PAGINA
  let consulta = clienteRemoto().from('reportes').select(COLUMNAS).order('creado_en', { ascending: false })
  if (estado) consulta = consulta.eq('estado', estado)
  const { data, error } = await consulta.range(desde, desde + POR_PAGINA)
  if (error) throw new Error('No pudimos cargar los reportes. Revisa tu conexión e inténtalo de nuevo.')
  const filas = (data ?? []) as Fila[]
  return { reportes: filas.slice(0, POR_PAGINA).map(aReporte), hayMas: filas.length > POR_PAGINA }
}

/** URLs firmadas de corta duración, en el mismo orden que las rutas. Las que fallen se omiten. */
export async function urlsEvidencia(paths: string[]): Promise<string[]> {
  if (paths.length === 0) return []
  const { data, error } = await clienteRemoto().storage.from('reportes-evidencia').createSignedUrls(paths, SEGUNDOS_URL)
  if (error) throw new Error('No pudimos cargar las fotos de evidencia.')
  return (data ?? []).flatMap((d) => (d.signedUrl ? [d.signedUrl] : []))
}

/** Enlace de OpenStreetMap a un punto, sin clave. */
export function enlaceUbicacion(lat: number, lng: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`
}
