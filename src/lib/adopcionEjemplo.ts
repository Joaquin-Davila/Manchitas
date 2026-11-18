// Datos de ejemplo: animales y albergues inventados, sin teléfonos ni direcciones.
// El sello "Verificado" es de ejemplo: no promete una verificación real hasta que la valide
// el Instituto o un veterinario. El contacto real llegará con Supabase.

export type Especie = 'perro' | 'gato'
export type Tamano = 'Chico' | 'Mediano' | 'Grande'

export type Animal = {
  id: string
  nombre: string
  especie: Especie
  edadMeses: number
  tamano: Tamano
  sexo: 'Macho' | 'Hembra'
  descripcion: string
  publicadoPor: string
  verificado: boolean
}

export type FiltrosAdopcion = {
  especie: Especie | null
  cachorros: boolean
  tamano: Tamano | null
}

export const animales: Animal[] = [
  {
    id: 'p1',
    nombre: 'Canela',
    especie: 'perro',
    edadMeses: 8,
    tamano: 'Mediano',
    sexo: 'Hembra',
    descripcion: 'Juguetona y sociable. Ya aprendió a caminar con correa.',
    publicadoPor: 'Rescate Huellas del Desierto',
    verificado: true,
  },
  {
    id: 'p2',
    nombre: 'Toto',
    especie: 'perro',
    edadMeses: 36,
    tamano: 'Grande',
    sexo: 'Macho',
    descripcion: 'Tranquilo y cariñoso. Se lleva bien con niños y con otros perros.',
    publicadoPor: 'Albergue Segunda Oportunidad',
    verificado: true,
  },
  {
    id: 'p3',
    nombre: 'Pelusa',
    especie: 'perro',
    edadMeses: 5,
    tamano: 'Chico',
    sexo: 'Hembra',
    descripcion: 'Cachorra curiosa. Necesita un hogar con paciencia para educarla.',
    publicadoPor: 'Rescate Huellas del Desierto',
    verificado: true,
  },
  {
    id: 'p4',
    nombre: 'Bruno',
    especie: 'perro',
    edadMeses: 60,
    tamano: 'Grande',
    sexo: 'Macho',
    descripcion: 'Adulto sereno que busca un hogar con patio. Esterilizado y vacunado.',
    publicadoPor: 'Albergue Segunda Oportunidad',
    verificado: false,
  },
  {
    id: 'p5',
    nombre: 'Lola',
    especie: 'perro',
    edadMeses: 24,
    tamano: 'Chico',
    sexo: 'Hembra',
    descripcion: 'Dócil y buena compañera de departamento. Poco ladradora.',
    publicadoPor: 'Patitas Rescatistas Hermosillo',
    verificado: true,
  },
  {
    id: 'g1',
    nombre: 'Misho',
    especie: 'gato',
    edadMeses: 4,
    tamano: 'Chico',
    sexo: 'Macho',
    descripcion: 'Gatito atigrado, activo y muy curioso. Usa su arenero.',
    publicadoPor: 'Patitas Rescatistas Hermosillo',
    verificado: true,
  },
  {
    id: 'g2',
    nombre: 'Luna',
    especie: 'gato',
    edadMeses: 30,
    tamano: 'Mediano',
    sexo: 'Hembra',
    descripcion: 'Gata tranquila y cariñosa. Esterilizada y desparasitada.',
    publicadoPor: 'Albergue Segunda Oportunidad',
    verificado: true,
  },
  {
    id: 'g3',
    nombre: 'Tigre',
    especie: 'gato',
    edadMeses: 72,
    tamano: 'Mediano',
    sexo: 'Macho',
    descripcion: 'Adulto independiente. Prefiere casas sin otros gatos.',
    publicadoPor: 'Rescate Huellas del Desierto',
    verificado: false,
  },
]

export function esCachorro(a: Animal): boolean {
  return a.edadMeses < 12
}

/** "8 meses", "1 año", "3 años". */
export function textoEdad(meses: number): string {
  if (meses < 12) return meses === 1 ? '1 mes' : `${meses} meses`
  const anios = Math.floor(meses / 12)
  return anios === 1 ? '1 año' : `${anios} años`
}

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}

export function filtrarAnimales(busqueda: string, f: FiltrosAdopcion): Animal[] {
  const q = normalizar(busqueda)
  return animales.filter(
    (a) =>
      (!f.especie || a.especie === f.especie) &&
      (!f.cachorros || esCachorro(a)) &&
      (!f.tamano || a.tamano === f.tamano) &&
      (!q || normalizar(`${a.nombre} ${a.descripcion} ${a.publicadoPor}`).includes(q)),
  )
}
