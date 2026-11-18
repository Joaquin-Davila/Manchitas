// Datos de ejemplo: comercios inventados. La lógica de canje y comisión es de una fase posterior.
export type CategoriaCupon = 'Veterinaria' | 'Estética' | 'Alimento' | 'Paseos'

export type Cupon = {
  id: string
  comercio: string
  categoria: CategoriaCupon
  oferta: string
  detalle: string
  /** Último día de vigencia, AAAA-MM-DD. */
  vigencia: string
}

export const cupones: Cupon[] = [
  {
    id: 'c1',
    comercio: 'Veterinaria Patitas del Desierto',
    categoria: 'Veterinaria',
    oferta: '20 % en consulta general',
    detalle: 'Una consulta por perro registrado en Manchitas. Con cita previa.',
    vigencia: '2026-12-31',
  },
  {
    id: 'c2',
    comercio: 'Estética Canina Colita Feliz',
    categoria: 'Estética',
    oferta: 'Baño y corte con 15 % de descuento',
    detalle: 'Perros de talla chica y mediana. De lunes a jueves.',
    vigencia: '2027-01-15',
  },
  {
    id: 'c3',
    comercio: 'Alimento Sonora Pet',
    categoria: 'Alimento',
    oferta: '10 % en croquetas de 15 kg',
    detalle: 'Válido en sucursal Centro. No aplica con otras promociones.',
    vigencia: '2027-02-28',
  },
  {
    id: 'c4',
    comercio: 'Paseos Caminando Juntos',
    categoria: 'Paseos',
    oferta: 'Primer paseo de 45 minutos gratis',
    detalle: 'Para clientes nuevos en colonias del centro y Pitic.',
    vigencia: '2027-01-31',
  },
  {
    id: 'c5',
    comercio: 'Clínica Veterinaria Mezquite 24 h',
    categoria: 'Veterinaria',
    oferta: '2 × 1 en desparasitación',
    detalle: 'Aplica para dos perros del mismo tutor. Presenta tu ID de collar.',
    vigencia: '2026-11-30',
  },
]

/** Cupones cuya vigencia no ha terminado en la fecha dada (AAAA-MM-DD). */
export function cuponesVigentes(hoy: string): Cupon[] {
  return cupones.filter((c) => c.vigencia >= hoy)
}
