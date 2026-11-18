import type { Aviso, ResumenMascota } from '../types/inicio'

// Datos de ejemplo mientras no hay proyecto de Supabase.
export const tutor = { nombre: 'Joaquín' }

// Vacunas y pendientes empiezan en 0 hasta que exista la cartilla (paso 6).
// Los cupones son de ejemplo.
export const resumen: ResumenMascota = {
  vacunasAplicadas: 0,
  pendientes: 0,
  cupones: 2,
  estado: 'Registrada',
}

export const proximoRecordatorio: Aviso = {
  titulo: 'Próximo recordatorio',
  detalle: 'Desparasitación · 28 de noviembre',
}

export const proximaCampana: Aviso = {
  titulo: 'Jornada de esterilización',
  detalle: 'Sáb 28 · Centro de Atención Canina',
}
