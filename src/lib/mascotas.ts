import type { DatosMascota, Mascota, PerfilPublico } from '../types/mascota'
import type { Sesion } from '../features/auth/contextoSesion'
import { borrarFoto, esDataUrl, subirFoto, urlFotoMascota } from './almacenamiento'
import { generarFolio, generarId, generarToken } from './identificadores'
import { clienteRemoto, haySupabase } from './supabase'

// Repositorio de mascotas. Con Supabase configurado usa la base (RLS: cada tutor solo ve lo
// suyo) y Storage; sin él, localStorage. Las pantallas no cambian entre un modo y otro.
const CLAVE = 'manchitas.mascotas'

// --- Modo local --------------------------------------------------------------------------

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

async function crearLocal(datos: DatosMascota, tutor: Sesion): Promise<Mascota> {
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

// --- Modo Supabase -----------------------------------------------------------------------

const COLUMNAS = 'id, especie, nombre, raza, nacimiento, senas, nota, foto_path, folio, token, creada_en'

type Fila = {
  id: string
  especie: 'perro'
  nombre: string
  raza: string
  nacimiento: string
  senas: string
  nota: string
  foto_path: string | null
  folio: string
  token: string
  creada_en: string
}

function aMascota(f: Fila): Mascota {
  return {
    id: f.id,
    especie: f.especie,
    nombre: f.nombre,
    raza: f.raza,
    nacimiento: f.nacimiento,
    senas: f.senas,
    nota: f.nota,
    fotoUrl: urlFotoMascota(f.foto_path),
    folio: f.folio,
    token: f.token,
    creadaEn: f.creada_en,
  }
}

async function listarRemoto(): Promise<Mascota[]> {
  const { data, error } = await clienteRemoto()
    .from('mascotas')
    .select(COLUMNAS)
    .order('creada_en', { ascending: true })
  if (error) throw new Error('No pudimos cargar a tus mascotas. Revisa tu conexión.')
  return (data as Fila[]).map(aMascota)
}

async function obtenerRemoto(id: string): Promise<Mascota | null> {
  const { data, error } = await clienteRemoto().from('mascotas').select(COLUMNAS).eq('id', id).maybeSingle()
  // 22P02: el "id" de la URL no tiene formato de UUID, así que no existe.
  if (error && error.code !== '22P02') throw new Error('No pudimos cargar a tu mascota. Revisa tu conexión.')
  return data ? aMascota(data as Fila) : null
}

async function crearRemoto(datos: DatosMascota, tutor: Sesion): Promise<Mascota> {
  if (!tutor.id) throw new Error('Tu sesión no es válida. Cierra sesión e inicia de nuevo.')
  const fotoPath = esDataUrl(datos.fotoUrl) ? await subirFoto('mascotas-fotos', tutor.id, datos.fotoUrl) : null

  // Dueño, folio y token los fija el servidor; aquí solo van los datos de la mascota.
  const { data, error } = await clienteRemoto()
    .from('mascotas')
    .insert({
      nombre: datos.nombre,
      raza: datos.raza,
      nacimiento: datos.nacimiento,
      senas: datos.senas,
      nota: datos.nota,
      foto_path: fotoPath,
    })
    .select(COLUMNAS)
    .single()
  if (error) {
    await borrarFoto('mascotas-fotos', fotoPath)
    throw new Error('No pudimos guardar a tu mascota. Revisa tu conexión e inténtalo de nuevo.')
  }
  return aMascota(data as Fila)
}

// --- API pública del repositorio ---------------------------------------------------------

/** Con Supabase, el correo se ignora: el filtro por dueño lo hace la base (RLS). */
export async function listarMascotas(tutorCorreo: string): Promise<Mascota[]> {
  if (haySupabase) return listarRemoto()
  return leerTodas().filter((m) => m.tutorCorreo === tutorCorreo)
}

export async function obtenerMascota(id: string, tutorCorreo: string): Promise<Mascota | null> {
  if (haySupabase) return obtenerRemoto(id)
  return leerTodas().find((m) => m.id === id && m.tutorCorreo === tutorCorreo) ?? null
}

export async function crearMascota(datos: DatosMascota, tutor: Sesion): Promise<Mascota> {
  return haySupabase ? crearRemoto(datos, tutor) : crearLocal(datos, tutor)
}

// --- Consulta pública (QR o ID exacto) ---------------------------------------------------
// Devuelve solo lo que puede ver cualquiera. Con Supabase pasa por funciones de la base que no
// exponen las tablas; el teléfono completo nunca se muestra, solo viaja dentro del enlace de WhatsApp.

/** Acepta "mch-7k3p9q", "MCH7K3P9Q" o con espacios; devuelve null si no tiene el formato. */
export function normalizarFolio(texto: string): string | null {
  const limpio = texto.toUpperCase().replace(/[\s-]/g, '')
  const m = /^MCH([A-HJ-NP-Z2-9]{6})$/.exec(limpio)
  return m ? `MCH-${m[1]}` : null
}

function enlaceWhatsApp(base: string | null, nombrePerro: string): string | null {
  if (!base) return null
  const texto = `Hola, vi la ficha de ${nombrePerro} en Manchitas y me comunico contigo.`
  return `${base}?text=${encodeURIComponent(texto)}`
}

function aPerfilPublico(m: Mascota): PerfilPublico {
  const digitos = m.tutorTelefono?.replace(/\D/g, '')
  return {
    nombre: m.nombre,
    raza: m.raza,
    nacimiento: m.nacimiento,
    senas: m.senas,
    nota: m.nota,
    fotoUrl: m.fotoUrl,
    apellidoTutor: m.tutorApellido?.trim().split(/\s+/)[0] || undefined,
    enlaceWhatsApp: enlaceWhatsApp(digitos && digitos.length === 10 ? `https://wa.me/52${digitos}` : null, m.nombre),
  }
}

type FilaPublica = {
  nombre: string
  raza: string
  nacimiento: string
  senas: string
  nota: string
  foto_path: string | null
  apellido_tutor: string | null
  whatsapp_base: string | null
}

export async function perfilPorToken(token: string): Promise<PerfilPublico | null> {
  if (!haySupabase) {
    const m = leerTodas().find((x) => x.token === token)
    return m ? aPerfilPublico(m) : null
  }
  const { data, error } = await clienteRemoto().rpc('perfil_publico', { p_token: token })
  if (error) throw new Error('No pudimos cargar la ficha. Revisa tu conexión e inténtalo de nuevo.')
  const f = (data as FilaPublica[] | null)?.[0]
  if (!f) return null
  return {
    nombre: f.nombre,
    raza: f.raza,
    nacimiento: f.nacimiento,
    senas: f.senas,
    nota: f.nota,
    fotoUrl: urlFotoMascota(f.foto_path),
    apellidoTutor: f.apellido_tutor ?? undefined,
    enlaceWhatsApp: enlaceWhatsApp(f.whatsapp_base, f.nombre),
  }
}

/** Devuelve el token del perro con ese folio exacto, o null. Falla si se hacen demasiadas búsquedas. */
export async function tokenPorFolio(folio: string): Promise<string | null> {
  const normalizado = normalizarFolio(folio)
  if (!normalizado) return null
  if (!haySupabase) return leerTodas().find((x) => x.folio === normalizado)?.token ?? null

  const { data, error } = await clienteRemoto().rpc('token_por_folio', { p_folio: normalizado })
  if (error) {
    throw new Error(
      error.message.includes('limite_excedido')
        ? 'Hiciste muchas búsquedas seguidas. Espera unos minutos e inténtalo de nuevo.'
        : 'No pudimos hacer la búsqueda. Revisa tu conexión e inténtalo de nuevo.',
    )
  }
  return (data as string | null) ?? null
}
