import type { DatosMascota, Mascota, PerfilPublico } from '../types/mascota'
import type { Sesion } from '../features/auth/contextoSesion'
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

export async function crearMascota(datos: DatosMascota, tutor: Sesion): Promise<Mascota> {
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
    tutorCorreo: tutor.correo,
    tutorApellido: tutor.apellido || undefined,
    tutorTelefono: tutor.telefono,
  }
  guardarTodas([...todas, mascota])
  return mascota
}

// --- Consulta pública (QR o ID exacto) ---------------------------------------------------
// Devuelve solo lo que puede ver cualquiera. El teléfono completo nunca sale de aquí: solo
// el enlace de WhatsApp. En el paso 10 esto pasa a una función de Supabase que no expone la
// tabla, y el enlace se resuelve en el servidor.

/** Acepta "mch-7k3p9q", "MCH7K3P9Q" o con espacios; devuelve null si no tiene el formato. */
export function normalizarFolio(texto: string): string | null {
  const limpio = texto.toUpperCase().replace(/[\s-]/g, '')
  const m = /^MCH([A-HJ-NP-Z2-9]{6})$/.exec(limpio)
  return m ? `MCH-${m[1]}` : null
}

function aPerfilPublico(m: Mascota): PerfilPublico {
  const nombrePerro = m.nombre
  const digitos = m.tutorTelefono?.replace(/\D/g, '')
  const texto = `Hola, vi la ficha de ${nombrePerro} en Manchitas y me comunico contigo.`
  return {
    nombre: m.nombre,
    raza: m.raza,
    nacimiento: m.nacimiento,
    senas: m.senas,
    nota: m.nota,
    fotoUrl: m.fotoUrl,
    apellidoTutor: m.tutorApellido?.trim().split(/\s+/)[0] || undefined,
    enlaceWhatsApp:
      digitos && digitos.length === 10
        ? `https://wa.me/52${digitos}?text=${encodeURIComponent(texto)}`
        : null,
  }
}

export async function perfilPorToken(token: string): Promise<PerfilPublico | null> {
  const m = leerTodas().find((x) => x.token === token)
  return m ? aPerfilPublico(m) : null
}

/** Devuelve el token del perro con ese folio exacto, o null. */
export async function tokenPorFolio(folio: string): Promise<string | null> {
  const normalizado = normalizarFolio(folio)
  if (!normalizado) return null
  return leerTodas().find((x) => x.folio === normalizado)?.token ?? null
}
