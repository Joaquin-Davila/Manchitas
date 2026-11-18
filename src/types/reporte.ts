export type TipoReporte = 'maltrato' | 'abandono' | 'herido' | 'suelto' | 'venta' | 'otro'

export const TIPOS_REPORTE: { id: TipoReporte; titulo: string; detalle: string }[] = [
  { id: 'maltrato', titulo: 'Maltrato o crueldad', detalle: 'Golpes, encierro extremo, falta de agua o comida.' },
  { id: 'abandono', titulo: 'Abandono', detalle: 'Un animal dejado solo, sin cuidados ni dueño a la vista.' },
  { id: 'herido', titulo: 'Animal herido o en peligro', detalle: 'Atropellado, enfermo o atrapado.' },
  { id: 'suelto', titulo: 'Animal suelto o agresivo', detalle: 'Representa un riesgo para las personas.' },
  { id: 'venta', titulo: 'Venta o cría ilegal', detalle: 'Venta en la vía pública o criaderos sin control.' },
  { id: 'otro', titulo: 'Otro', detalle: 'Algo que no encaja en las opciones anteriores.' },
]

export function tituloTipo(tipo: TipoReporte): string {
  return TIPOS_REPORTE.find((t) => t.id === tipo)?.titulo ?? 'Otro'
}

/** "recibido" = guardado en Manchitas; "canalizado" = ya se turnó a la autoridad (paso 11 en adelante). */
export type EstadoReporte = 'recibido' | 'canalizado'

export type DatosReporte = {
  tipo: TipoReporte
  colonia: string
  calle: string
  referencias: string
  /** Coordenadas del dispositivo, solo si la persona usó "Usar mi ubicación". */
  lat?: number
  lng?: number
  descripcion: string
  /** AAAA-MM-DD */
  fechaHechos: string
  /** Fotos reducidas (data URL) hasta que haya almacenamiento en Supabase. */
  fotos: string[]
  /** Contacto opcional para que la autoridad dé seguimiento; el reporte es anónimo por defecto. */
  telefono?: string
}

export type Reporte = DatosReporte & {
  folio: string
  creadoEn: string
  estado: EstadoReporte
}

/** Lo único que devuelve la consulta por folio: nunca ubicación, evidencia ni contacto. */
export type SeguimientoReporte = Pick<Reporte, 'folio' | 'tipo' | 'creadoEn' | 'estado'>
