import type { Aviso, Mascota, ResumenMascota } from '../types/inicio'

// Datos de ejemplo mientras no hay proyecto de Supabase.
export const tutor = { nombre: 'Joaquín' }

export const mascota: Mascota = {
  nombre: 'Luna',
  folio: 'MCH-02841',
}

export const resumen: ResumenMascota = {
  vacunasAplicadas: 4,
  pendientes: 1,
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
