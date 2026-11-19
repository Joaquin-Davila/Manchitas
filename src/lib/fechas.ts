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
/** "hace 5 minutos", "hace 2 horas", "ayer", "hace 3 días" o, pasada una semana, la fecha corta. */
export function haceCuanto(iso: string, ahora: Date): string {
  const t = new Date(iso)
  const minutos = Math.max(0, Math.round((ahora.getTime() - t.getTime()) / 60000))
  if (minutos < 1) return 'justo ahora'
  if (minutos < 60) return `hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`
  const dias = Math.floor(horas / 24)
  if (dias === 1) return 'ayer'
  if (dias < 7) return `hace ${dias} días`
  return `${t.getDate()} de ${MESES[t.getMonth()]}`
}

export function formatearFecha(iso: string, conAnio = true): string {
  const [anio, mes, dia] = iso.split('-').map(Number)
  const base = `${dia} de ${MESES[mes - 1]}`
  return conAnio ? `${base} de ${anio}` : base
}
