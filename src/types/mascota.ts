export type Mascota = {
  /** Identificador interno; solo se usa dentro de la cuenta del tutor. */
  id: string
  /** Hoy solo perros; el campo deja lista la ampliación a gatos. */
  especie: 'perro'
  nombre: string
  raza: string
  /** "AAAA" si la edad es aproximada o "AAAA-MM-DD" si se conoce la fecha exacta. */
  nacimiento: string
  senas: string
  nota: string
  /** Foto reducida, como data URL, hasta que haya almacenamiento en Supabase. */
  fotoUrl?: string
  /** ID público aleatorio, p. ej. MCH-7K3P9Q. */
  folio: string
  /** Token largo del QR, distinto del folio y no adivinable. */
  token: string
  creadaEn: string
  tutorCorreo: string
  /** Copia del apellido del tutor (en Supabase vendrá de su perfil). */
  tutorApellido?: string
  /** Copia del WhatsApp del tutor. Nunca se muestra en pantalla. */
  tutorTelefono?: string
}

/** Lo único que ve quien escanea el QR o escribe el ID exacto. */
export type PerfilPublico = Pick<Mascota, 'nombre' | 'raza' | 'nacimiento' | 'senas' | 'nota' | 'fotoUrl'> & {
  /** Un solo apellido del tutor, como máximo. */
  apellidoTutor?: string
  /** Enlace de WhatsApp ya armado; null si el tutor no tiene contacto registrado. */
  enlaceWhatsApp: string | null
}

export type DatosMascota = Pick<
  Mascota,
  'nombre' | 'raza' | 'nacimiento' | 'senas' | 'nota' | 'fotoUrl'
>
