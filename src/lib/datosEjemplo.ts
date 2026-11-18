import type { Aviso } from '../types/inicio'

// Datos de ejemplo mientras no hay proyecto de Supabase. Las vacunas, lo pendiente y el
// recordatorio salen de la cartilla real (src/lib/cartillas.ts); los cupones, de cuponesEjemplo.
export const tutor = { nombre: 'Joaquín' }

export const estadoMascota = 'Registrada'

export const proximaCampana: Aviso = {
  titulo: 'Jornada de esterilización',
  detalle: 'Sáb 28 · Centro de Atención Canina',
}
