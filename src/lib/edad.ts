// La fecha de nacimiento se guarda como texto ("AAAA" o "AAAA-MM-DD") y nunca se convierte
// a Date: así no hay desfases por zona horaria. Solo se compara con la fecha local de hoy.

type Partes = { anio: number; mes?: number; dia?: number }

function partes(nacimiento: string): Partes {
  const [anio, mes, dia] = nacimiento.split('-').map(Number)
  return mes ? { anio, mes, dia } : { anio }
}

/** Fecha local de hoy como AAAA-MM-DD. */
export function hoyISO(hoy = new Date()): string {
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const dia = String(hoy.getDate()).padStart(2, '0')
  return `${hoy.getFullYear()}-${mes}-${dia}`
}

export function plural(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`
}

/** "Cachorro", "unos 3 años", "5 meses", "4 años"… según lo que se sepa. */
export function textoEdad(nacimiento: string, hoy = new Date()): string {
  const { anio, mes, dia } = partes(nacimiento)
  const anioHoy = hoy.getFullYear()

  if (mes === undefined || dia === undefined) {
    const anios = anioHoy - anio
    if (anios <= 0) return 'Cachorro (menos de 1 año)'
    return `Unos ${plural(anios, 'año', 'años')}`
  }

  let meses = (anioHoy - anio) * 12 + (hoy.getMonth() + 1 - mes)
  if (hoy.getDate() < dia) meses -= 1
  if (meses < 1) return 'Cachorro (menos de 1 mes)'
  if (meses < 12) return `Cachorro (${plural(meses, 'mes', 'meses')})`
  return plural(Math.floor(meses / 12), 'año', 'años')
}
