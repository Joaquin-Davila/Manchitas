export type Mascota = {
  nombre: string
  /** Folio público aleatorio, p. ej. MCH-02841 */
  folio: string
  fotoUrl?: string
}

export type ResumenMascota = {
  /** Solo vacunas aplicadas; sin "4/5" hasta que un veterinario valide el esquema. */
  vacunasAplicadas: number
  /** Vacunas o tratamientos pendientes (la próxima). */
  pendientes: number
  cupones: number
  estado: string
}

export type Aviso = {
  titulo: string
  detalle: string
}
