export type Especie = 'perro' | 'gato'

export type Mascota = {
  /** Identificador interno; solo se usa dentro de la cuenta del tutor. */
  id: string
  especie: Especie
  nombre: string
  raza: string
  /** "AAAA" si la edad es aproximada o "AAAA-MM-DD" si se conoce la fecha exacta. */
  nacimiento: string
  senas: string
  nota: string
  /** URL de la foto: data URL en modo local, URL de Storage con Supabase. */
  fotoUrl?: string
  /** ID público aleatorio, p. ej. MCH-7K3P9Q. */
  folio: string
  /** Token largo del QR, distinto del folio y no adivinable. */
  token: string
  creadaEn: string
  /** Solo en modo local; con Supabase el dueño lo decide la base (RLS). */
  tutorCorreo?: string
  /** Solo en modo local; con Supabase sale del perfil del tutor. */
  tutorApellido?: string
  /** Solo en modo local. Nunca se muestra en pantalla. */
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
  'especie' | 'nombre' | 'raza' | 'nacimiento' | 'senas' | 'nota' | 'fotoUrl'
>
