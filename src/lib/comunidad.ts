import { campanasProximas as campanasEjemplo } from './campanasEjemplo'
import { clienteRemoto, haySupabase } from './supabase'

// Lectura de lo que alimenta el Inicio: anuncios patrocinados, campañas, adopciones, publicaciones
// de la comunidad e indicadores. Con Supabase vienen de la base de datos (solo lectura para quien
// tiene sesión; RLS). Sin Supabase (modo local) solo hay campañas, de los datos de ejemplo.

export type Anuncio = {
  id: string
  titulo: string
  descripcion: string
  promocion: string
  imagen?: string
  /** Último día de vigencia, AAAA-MM-DD. */
  hasta: string
  /** Contenido de demostración: la interfaz lo rotula "Ejemplo". */
  demo: boolean
  establecimiento: { id: string; nombre: string; zona: string; foto?: string }
}

export type TipoCampana = 'vacunacion' | 'esterilizacion' | 'adopcion' | 'jornada'

export type CampanaComunidad = {
  id: string
  titulo: string
  tipo: TipoCampana
  /** AAAA-MM-DD */
  fecha: string
  horario: string
  lugar: string
  zona: string
  organizador: string
  demo: boolean
}

export type Publicacion = {
  id: string
  autor: string
  autorTipo: 'tutor' | 'rescatista' | 'ciudadano' | 'establecimiento'
  tipo: 'comunidad' | 'consejo' | 'adopcion' | 'campana' | 'extraviada' | 'logro'
  texto: string
  /** Fecha y hora ISO. */
  creadoEn: string
  demo: boolean
}

export type AdopcionResumen = {
  id: string
  nombre: string
  especie: 'perro' | 'gato'
  edadMeses: number
  foto?: string
  publicadoPor: string
  demo: boolean
}

export type Indicadores = {
  mascotas: number
  tutores: number
  adopcionesDisponibles: number
  campanasProximas: number
  establecimientos: number
  reportes: number
}

export type DatosInicio = {
  anuncios: Anuncio[]
  campanas: CampanaComunidad[]
  publicaciones: Publicacion[]
  adopciones: AdopcionResumen[]
  indicadores: Indicadores | null
}

type FilaAnuncio = {
  id: string
  titulo: string
  descripcion: string
  promocion: string
  imagen: string | null
  vigente_hasta: string
  es_demo: boolean
  // PostgREST devuelve un objeto para una relación muchos a uno, pero el tipo genérico admite arreglo.
  establecimiento: FilaEstablecimiento | FilaEstablecimiento[] | null
}
type FilaEstablecimiento = { id: string; nombre: string; zona: string; foto: string | null }

const unico = <T,>(x: T | T[] | null): T | null => (Array.isArray(x) ? (x[0] ?? null) : x)

async function leerAnuncios(): Promise<Anuncio[]> {
  const { data, error } = await clienteRemoto()
    .from('anuncios')
    .select('id, titulo, descripcion, promocion, imagen, vigente_hasta, es_demo, establecimiento:establecimientos(id, nombre, zona, foto)')
    .order('vigente_hasta', { ascending: true })
    .limit(6)
  if (error) throw error
  return ((data ?? []) as unknown as FilaAnuncio[]).flatMap((f) => {
    const e = unico(f.establecimiento)
    if (!e) return []
    return [
      {
        id: f.id,
        titulo: f.titulo,
        descripcion: f.descripcion,
        promocion: f.promocion,
        imagen: f.imagen ?? e.foto ?? undefined,
        hasta: f.vigente_hasta,
        demo: f.es_demo,
        establecimiento: { id: e.id, nombre: e.nombre, zona: e.zona, foto: e.foto ?? undefined },
      },
    ]
  })
}

async function leerCampanas(hoy: string): Promise<CampanaComunidad[]> {
  const { data, error } = await clienteRemoto()
    .from('campanas')
    .select('id, titulo, tipo, fecha, horario, lugar, zona, organizador, es_demo')
    .gte('fecha', hoy)
    .order('fecha', { ascending: true })
    .limit(5)
  if (error) throw error
  return (data ?? []).map((c) => ({
    id: c.id,
    titulo: c.titulo,
    tipo: c.tipo as TipoCampana,
    fecha: c.fecha,
    horario: c.horario,
    lugar: c.lugar,
    zona: c.zona,
    organizador: c.organizador,
    demo: c.es_demo,
  }))
}

async function leerPublicaciones(): Promise<Publicacion[]> {
  const { data, error } = await clienteRemoto()
    .from('publicaciones')
    .select('id, autor_nombre, autor_tipo, tipo, texto, creado_en, es_demo')
    .order('creado_en', { ascending: false })
    .limit(6)
  if (error) throw error
  return (data ?? []).map((p) => ({
    id: p.id,
    autor: p.autor_nombre,
    autorTipo: p.autor_tipo as Publicacion['autorTipo'],
    tipo: p.tipo as Publicacion['tipo'],
    texto: p.texto,
    creadoEn: p.creado_en,
    demo: p.es_demo,
  }))
}

async function leerAdopciones(): Promise<AdopcionResumen[]> {
  const { data, error } = await clienteRemoto()
    .from('adopciones')
    .select('id, nombre, especie, edad_meses, foto, publicado_por, es_demo')
    .eq('estado', 'disponible')
    .order('creado_en', { ascending: false })
    .limit(4)
  if (error) throw error
  return (data ?? []).map((a) => ({
    id: a.id,
    nombre: a.nombre,
    especie: a.especie as 'perro' | 'gato',
    edadMeses: a.edad_meses,
    foto: a.foto ?? undefined,
    publicadoPor: a.publicado_por,
    demo: a.es_demo,
  }))
}

async function leerIndicadores(): Promise<Indicadores> {
  const { data, error } = await clienteRemoto().rpc('indicadores_comunidad')
  if (error) throw error
  const i = data as Record<string, number>
  return {
    mascotas: i.mascotas ?? 0,
    tutores: i.tutores ?? 0,
    adopcionesDisponibles: i.adopciones_disponibles ?? 0,
    campanasProximas: i.campanas_proximas ?? 0,
    establecimientos: i.establecimientos ?? 0,
    reportes: i.reportes ?? 0,
  }
}

/** Resultado de una lectura que puede fallar sin tirar las demás (p. ej. sin red a medias). */
async function seguro<T>(lectura: Promise<T>, respaldo: T): Promise<T> {
  try {
    return await lectura
  } catch {
    return respaldo
  }
}

/**
 * Todo lo del Inicio en paralelo. Cada bloque falla por separado: si uno no carga, el resto se
 * muestra igual. Lanza solo si NINGUNO cargó (típicamente, sin conexión).
 */
export async function cargarInicioComunidad(hoy: string): Promise<DatosInicio> {
  if (!haySupabase) {
    return {
      anuncios: [],
      publicaciones: [],
      adopciones: [],
      indicadores: null,
      campanas: campanasEjemplo(hoy)
        .slice(0, 5)
        .map((c) => ({
          id: c.id,
          titulo: c.titulo,
          tipo: c.tipo === 'Vacunación' ? 'vacunacion' : 'esterilizacion',
          fecha: c.fecha,
          horario: c.horario,
          lugar: c.lugar,
          zona: '',
          organizador: '',
          demo: true,
        })),
    }
  }
  const fallo = Symbol('fallo')
  const [anuncios, campanas, publicaciones, adopciones, indicadores] = await Promise.all([
    seguro<Anuncio[] | typeof fallo>(leerAnuncios(), fallo),
    seguro<CampanaComunidad[] | typeof fallo>(leerCampanas(hoy), fallo),
    seguro<Publicacion[] | typeof fallo>(leerPublicaciones(), fallo),
    seguro<AdopcionResumen[] | typeof fallo>(leerAdopciones(), fallo),
    seguro<Indicadores | typeof fallo>(leerIndicadores(), fallo),
  ])
  if ([anuncios, campanas, publicaciones, adopciones, indicadores].every((r) => r === fallo)) {
    throw new Error('No pudimos cargar la comunidad. Revisa tu conexión.')
  }
  const lista = <T,>(r: T[] | typeof fallo): T[] => (r === fallo ? [] : r)
  return {
    anuncios: lista(anuncios),
    campanas: lista(campanas),
    publicaciones: lista(publicaciones),
    adopciones: lista(adopciones),
    indicadores: indicadores === fallo ? null : indicadores,
  }
}
