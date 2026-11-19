import type { Especie } from '../types/mascota'

// Textos por especie para las pantallas del tutor. La base solo acepta 'perro' o 'gato'.
export const ESPECIES: Especie[] = ['perro', 'gato']

export const NOMBRE_ESPECIE: Record<Especie, string> = { perro: 'Perro', gato: 'Gato' }
