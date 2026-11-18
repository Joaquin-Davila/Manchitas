import type { DatosMascota, Mascota } from '../types/mascota'
import { generarFolio, generarId, generarToken } from './identificadores'

// Repositorio de mascotas. Hoy guarda en localStorage; en el paso 10 se reemplaza por
// Supabase sin tocar las pantallas, porque todas las funciones ya son asíncronas.
const CLAVE = 'manchitas.mascotas'

function leerTodas(): Mascota[] {
  try {
    const texto = localStorage.getItem(CLAVE)
    return texto ? (JSON.parse(texto) as Mascota[]) : []
  } catch {
    return []
  }
}

function guardarTodas(mascotas: Mascota[]) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(mascotas))
  } catch {
    throw new Error('No pudimos guardar a tu mascota en este dispositivo. Intenta con una foto más pequeña.')
  }
}

export async function listarMascotas(tutorCorreo: string): Promise<Mascota[]> {
  return leerTodas().filter((m) => m.tutorCorreo === tutorCorreo)
}

export async function obtenerMascota(id: string, tutorCorreo: string): Promise<Mascota | null> {
  return leerTodas().find((m) => m.id === id && m.tutorCorreo === tutorCorreo) ?? null
}

export async function crearMascota(datos: DatosMascota, tutorCorreo: string): Promise<Mascota> {
  const todas = leerTodas()

  // El folio debe ser único: se vuelve a generar si ya existe (casi imposible, pero barato).
  let folio = generarFolio()
  while (todas.some((m) => m.folio === folio)) folio = generarFolio()

  const mascota: Mascota = {
    ...datos,
    id: generarId(),
    especie: 'perro',
    folio,
    token: generarToken(),
    creadaEn: new Date().toISOString(),
    tutorCorreo,
  }
  guardarTodas([...todas, mascota])
  return mascota
}
