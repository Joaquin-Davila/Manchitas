const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

/**
 * "2026-11-28" → "28 de noviembre de 2026". Se arma con el texto, sin pasar por Date, para
 * que la zona horaria no mueva el día. Con `conAnio: false` omite el año.
 */
export function formatearFecha(iso: string, conAnio = true): string {
  const [anio, mes, dia] = iso.split('-').map(Number)
  const base = `${dia} de ${MESES[mes - 1]}`
  return conAnio ? `${base} de ${anio}` : base
}
