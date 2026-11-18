import type { Cartilla, DatosVacuna } from '../types/cartilla'
import { generarId } from './identificadores'

// Repositorio de cartillas. Hoy guarda en localStorage, indexado por el id de la mascota; en el
// paso 10 se reemplaza por Supabase (tabla con RLS y Storage para la foto) sin tocar las
// pantallas, porque todas las funciones ya son asíncronas y devuelven la cartilla actualizada.
const CLAVE = 'manchitas.cartillas'

const VACIA: Cartilla = { vacunas: [], recordatorio: true }

function leerTodas(): Record<string, Cartilla> {
  try {
    const texto = localStorage.getItem(CLAVE)
    return texto ? (JSON.parse(texto) as Record<string, Cartilla>) : {}
  } catch {
    return {}
  }
}

function guardar(mascotaId: string, cartilla: Cartilla): Cartilla {
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ ...leerTodas(), [mascotaId]: cartilla }))
  } catch {
    throw new Error('No pudimos guardar la cartilla en este dispositivo. Intenta con una foto más pequeña.')
  }
  return cartilla
}

export async function obtenerCartilla(mascotaId: string): Promise<Cartilla> {
  return leerTodas()[mascotaId] ?? VACIA
}

/** Las más recientes van primero. */
function ordenar(c: Cartilla): Cartilla {
  return { ...c, vacunas: [...c.vacunas].sort((a, b) => b.fecha.localeCompare(a.fecha)) }
}

export async function registrarVacuna(mascotaId: string, datos: DatosVacuna): Promise<Cartilla> {
  const actual = await obtenerCartilla(mascotaId)
  const nombre = datos.nombre.trim()

  // Si se aplicó la vacuna que estaba pendiente, deja de estar pendiente. Si el tutor conoce
  // la fecha de la siguiente dosis, esa pasa a ser la próxima.
  let proxima = actual.proxima
  if (datos.proximaFecha) proxima = { nombre, fecha: datos.proximaFecha }
  else if (proxima && proxima.nombre.toLowerCase() === nombre.toLowerCase()) proxima = undefined

  return guardar(
    mascotaId,
    ordenar({
      ...actual,
      proxima,
      vacunas: [
        ...actual.vacunas,
        { id: generarId(), nombre, fecha: datos.fecha, veterinaria: datos.veterinaria?.trim() || undefined },
      ],
    }),
  )
}

export async function eliminarVacuna(mascotaId: string, vacunaId: string): Promise<Cartilla> {
  const actual = await obtenerCartilla(mascotaId)
  return guardar(mascotaId, { ...actual, vacunas: actual.vacunas.filter((v) => v.id !== vacunaId) })
}

export async function guardarFotoCartilla(mascotaId: string, foto: string | undefined): Promise<Cartilla> {
  const actual = await obtenerCartilla(mascotaId)
  return guardar(mascotaId, { ...actual, fotoCartilla: foto })
}

export async function definirRecordatorio(mascotaId: string, activo: boolean): Promise<Cartilla> {
  const actual = await obtenerCartilla(mascotaId)
  return guardar(mascotaId, { ...actual, recordatorio: activo })
}
