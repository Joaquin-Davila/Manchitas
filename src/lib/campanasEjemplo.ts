// Datos de ejemplo: aliados y campañas inventados. Las coordenadas son aproximadas por zona de
// Hermosillo y NO corresponden a ubicaciones reales de negocios ni de instituciones.
// Mientras no hay Supabase, las funciones son síncronas como en cuponesEjemplo.

export type TipoCampana = 'Vacunación' | 'Esterilización'
export type TipoAliado = 'Veterinaria' | 'Clínica 24 h' | 'Punto de campañas'
export type Filtro = 'Todos' | TipoCampana | 'Clínicas 24 h'

export type Aliado = {
  id: string
  nombre: string
  tipo: TipoAliado
  servicios: TipoCampana[]
  abierto24h: boolean
  horario: string
  /** Colonia o zona, sin calle ni número. */
  zona: string
  lat: number
  lng: number
}

export type Campana = {
  id: string
  titulo: string
  tipo: TipoCampana
  /** AAAA-MM-DD */
  fecha: string
  horario: string
  lugar: string
  aliadoId?: string
}

export const aliados: Aliado[] = [
  {
    id: 'a1',
    nombre: 'Clínica Veterinaria Mezquite 24 h',
    tipo: 'Clínica 24 h',
    servicios: ['Vacunación', 'Esterilización'],
    abierto24h: true,
    horario: 'Abierto las 24 horas',
    zona: 'Zona centro',
    lat: 29.09,
    lng: -110.96,
  },
  {
    id: 'a2',
    nombre: 'Veterinaria Patitas del Desierto',
    tipo: 'Veterinaria',
    servicios: ['Vacunación'],
    abierto24h: false,
    horario: 'Lun a sáb, 9:00 a 19:00 h',
    zona: 'Colonia Pitic',
    lat: 29.083,
    lng: -110.975,
  },
  {
    id: 'a3',
    nombre: 'Hospital Veterinario Saguaro 24 h',
    tipo: 'Clínica 24 h',
    servicios: ['Vacunación', 'Esterilización'],
    abierto24h: true,
    horario: 'Abierto las 24 horas',
    zona: 'Zona norte',
    lat: 29.12,
    lng: -110.98,
  },
  {
    id: 'a4',
    nombre: 'Clínica Colita Feliz',
    tipo: 'Veterinaria',
    servicios: ['Vacunación', 'Esterilización'],
    abierto24h: false,
    horario: 'Lun a vie, 10:00 a 18:00 h',
    zona: 'Villa de Seris',
    lat: 29.07,
    lng: -110.93,
  },
  {
    id: 'a5',
    nombre: 'Centro de Jornadas Sonora Pet',
    tipo: 'Punto de campañas',
    servicios: ['Vacunación', 'Esterilización'],
    abierto24h: false,
    horario: 'Solo en días de jornada',
    zona: 'Zona oriente',
    lat: 29.1,
    lng: -110.92,
  },
  {
    id: 'a6',
    nombre: 'Veterinaria Cerro de la Campana',
    tipo: 'Veterinaria',
    servicios: ['Vacunación'],
    abierto24h: false,
    horario: 'Lun a sáb, 9:00 a 17:00 h',
    zona: 'Zona poniente',
    lat: 29.075,
    lng: -111.0,
  },
]

export const campanas: Campana[] = [
  {
    id: 'k0',
    titulo: 'Vacunación antirrábica',
    tipo: 'Vacunación',
    fecha: '2026-11-10',
    horario: '9:00 a 13:00 h',
    lugar: 'Centro de Jornadas Sonora Pet',
    aliadoId: 'a5',
  },
  {
    id: 'k1',
    titulo: 'Jornada de vacunación antirrábica',
    tipo: 'Vacunación',
    fecha: '2026-11-21',
    horario: '9:00 a 13:00 h',
    lugar: 'Centro de Jornadas Sonora Pet',
    aliadoId: 'a5',
  },
  {
    id: 'k2',
    titulo: 'Jornada de esterilización',
    tipo: 'Esterilización',
    fecha: '2026-11-28',
    horario: '8:00 a 14:00 h',
    lugar: 'Clínica Veterinaria Mezquite 24 h',
    aliadoId: 'a1',
  },
  {
    id: 'k3',
    titulo: 'Vacunación en tu colonia',
    tipo: 'Vacunación',
    fecha: '2026-12-05',
    horario: '10:00 a 14:00 h',
    lugar: 'Explanada de la colonia Pitic',
  },
  {
    id: 'k4',
    titulo: 'Esterilización a bajo costo',
    tipo: 'Esterilización',
    fecha: '2026-12-12',
    horario: '8:00 a 13:00 h',
    lugar: 'Clínica Colita Feliz',
    aliadoId: 'a4',
  },
  {
    id: 'k5',
    titulo: 'Vacunación de refuerzo',
    tipo: 'Vacunación',
    fecha: '2027-01-09',
    horario: '9:00 a 14:00 h',
    lugar: 'Hospital Veterinario Saguaro 24 h',
    aliadoId: 'a3',
  },
]

/** Campañas que aún no pasan (hoy en AAAA-MM-DD cuenta como vigente), de la más cercana a la más lejana. */
export function campanasProximas(hoy: string): Campana[] {
  return campanas.filter((c) => c.fecha >= hoy).sort((a, b) => a.fecha.localeCompare(b.fecha))
}

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}

export function aliadoDe(campana: Campana): Aliado | undefined {
  return aliados.find((a) => a.id === campana.aliadoId)
}

function coincideFiltroAliado(a: Aliado, filtro: Filtro): boolean {
  if (filtro === 'Todos') return true
  if (filtro === 'Clínicas 24 h') return a.abierto24h
  return a.servicios.includes(filtro)
}

export function filtrarAliados(busqueda: string, filtro: Filtro): Aliado[] {
  const q = normalizar(busqueda)
  return aliados.filter(
    (a) => coincideFiltroAliado(a, filtro) && (!q || normalizar(`${a.nombre} ${a.zona} ${a.tipo}`).includes(q)),
  )
}

export function filtrarCampanas(lista: Campana[], busqueda: string, filtro: Filtro): Campana[] {
  const q = normalizar(busqueda)
  return lista.filter((c) => {
    const aliado = aliadoDe(c)
    const coincideFiltro =
      filtro === 'Todos' ||
      (filtro === 'Clínicas 24 h' ? aliado?.abierto24h === true : c.tipo === filtro)
    return coincideFiltro && (!q || normalizar(`${c.titulo} ${c.lugar} ${c.tipo}`).includes(q))
  })
}

/** Enlace a las indicaciones de OpenStreetMap, sin clave. */
export function enlaceComoLlegar(a: Pick<Aliado, 'lat' | 'lng'>): string {
  return `https://www.openstreetmap.org/directions?route=%3B${a.lat}%2C${a.lng}`
}
