import type { TipoAliado } from '../../lib/campanasEjemplo'

// Color y símbolo de cada tipo de lugar en el mapa. Vive fuera de MapaAliados para que la leyenda y
// las tarjetas lo usen sin descargar Leaflet.
export type CategoriaMapa = { tipo: TipoAliado; color: string; etiqueta: string; simbolo: 'reloj' | 'cruz' | 'calendario' }

export const CATEGORIAS_MAPA: CategoriaMapa[] = [
  { tipo: 'Veterinaria', color: '#386494', etiqueta: 'Veterinarias', simbolo: 'cruz' },
  { tipo: 'Clínica 24 h', color: '#2c6e78', etiqueta: 'Clínicas 24 h', simbolo: 'reloj' },
  { tipo: 'Punto de campañas', color: '#6a6596', etiqueta: 'Sedes de campañas', simbolo: 'calendario' },
]

export function categoriaDe(tipo: TipoAliado): CategoriaMapa {
  return CATEGORIAS_MAPA.find((c) => c.tipo === tipo) ?? CATEGORIAS_MAPA[0]
}

/** Símbolo blanco dentro del marcador (SVG en un lienzo de 32 × 40, centrado en 16,15). */
export function simboloSvg(simbolo: CategoriaMapa['simbolo']): string {
  switch (simbolo) {
    case 'reloj':
      return '<circle cx="16" cy="15" r="6.5" fill="none" stroke="#fff" stroke-width="2"/><path d="M16 11.5V15l2.5 1.6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>'
    case 'cruz':
      return '<path d="M16 10v10M11 15h10" stroke="#fff" stroke-width="3" stroke-linecap="round"/>'
    case 'calendario':
      return '<rect x="10.5" y="10.5" width="11" height="10" rx="2" fill="none" stroke="#fff" stroke-width="2"/><path d="M10.5 14h11M13.5 9v3M18.5 9v3" stroke="#fff" stroke-width="2" stroke-linecap="round"/>'
  }
}
