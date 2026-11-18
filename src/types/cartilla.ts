export type VacunaAplicada = {
  id: string
  nombre: string
  /** AAAA-MM-DD */
  fecha: string
  veterinaria?: string
}

export type ProximaVacuna = {
  nombre: string
  /** AAAA-MM-DD */
  fecha: string
}

/**
 * Cartilla capturada por el tutor. No la valida un veterinario, así que no se calcula
 * ningún esquema ("4/5", "Al día"): solo lo aplicado y la próxima pendiente.
 */
export type Cartilla = {
  vacunas: VacunaAplicada[]
  proxima?: ProximaVacuna
  /** Foto de la cartilla: data URL en modo local; con Supabase, URL firmada temporal (1 hora). */
  fotoCartilla?: string
  /** Si es false, Inicio no muestra el recordatorio de la próxima vacuna. */
  recordatorio: boolean
}

export type DatosVacuna = {
  nombre: string
  fecha: string
  veterinaria?: string
  /** Fecha de la próxima dosis de esta misma vacuna, si el tutor la conoce. */
  proximaFecha?: string
}
