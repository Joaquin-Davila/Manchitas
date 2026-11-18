import type { Cartilla, DatosVacuna } from '../types/cartilla'
import { borrarFoto, esDataUrl, subirFoto, urlFirmada } from './almacenamiento'
import { generarId } from './identificadores'
import { clienteRemoto, haySupabase } from './supabase'

// Repositorio de cartillas. Con Supabase configurado usa las tablas `cartillas` y `vacunas`
// (RLS: solo el dueño de la mascota) y el bucket privado `cartillas-fotos`; sin él, localStorage
// indexado por el id de la mascota. Todas las funciones devuelven la cartilla actualizada.
const CLAVE = 'manchitas.cartillas'

const VACIA: Cartilla = { vacunas: [], recordatorio: true }

/** Las más recientes van primero. */
function ordenar(c: Cartilla): Cartilla {
  return { ...c, vacunas: [...c.vacunas].sort((a, b) => b.fecha.localeCompare(a.fecha)) }
}

/**
 * Si se aplicó la vacuna que estaba pendiente, deja de estar pendiente. Si el tutor conoce la
 * fecha de la siguiente dosis, esa pasa a ser la próxima. Devuelve `undefined` si no queda ninguna.
 */
function calcularProxima(actual: Cartilla['proxima'], nombre: string, proximaFecha?: string): Cartilla['proxima'] {
  if (proximaFecha) return { nombre, fecha: proximaFecha }
  if (actual && actual.nombre.toLowerCase() === nombre.toLowerCase()) return undefined
  return actual
}

// --- Modo local --------------------------------------------------------------------------

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

async function obtenerLocal(mascotaId: string): Promise<Cartilla> {
  return leerTodas()[mascotaId] ?? VACIA
}

// --- Modo Supabase -----------------------------------------------------------------------

const ERROR_RED = 'No pudimos guardar los cambios. Revisa tu conexión e inténtalo de nuevo.'

type FilaCartilla = {
  proxima_nombre: string | null
  proxima_fecha: string | null
  foto_path: string | null
  recordatorio: boolean
}
type FilaVacuna = { id: string; nombre: string; fecha: string; veterinaria: string | null }

async function obtenerRemoto(mascotaId: string): Promise<Cartilla> {
  const supabase = clienteRemoto()
  const [cartilla, vacunas] = await Promise.all([
    supabase
      .from('cartillas')
      .select('proxima_nombre, proxima_fecha, foto_path, recordatorio')
      .eq('mascota_id', mascotaId)
      .maybeSingle(),
    supabase
      .from('vacunas')
      .select('id, nombre, fecha, veterinaria')
      .eq('mascota_id', mascotaId)
      .order('fecha', { ascending: false }),
  ])
  if (cartilla.error || vacunas.error) throw new Error('No pudimos cargar la cartilla. Revisa tu conexión.')

  const c = cartilla.data as FilaCartilla | null
  return {
    vacunas: (vacunas.data as FilaVacuna[]).map((v) => ({
      id: v.id,
      nombre: v.nombre,
      fecha: v.fecha,
      veterinaria: v.veterinaria ?? undefined,
    })),
    proxima: c?.proxima_nombre && c.proxima_fecha ? { nombre: c.proxima_nombre, fecha: c.proxima_fecha } : undefined,
    fotoCartilla: await urlFirmada('cartillas-fotos', c?.foto_path),
    recordatorio: c?.recordatorio ?? true,
  }
}

async function actualizarCartilla(mascotaId: string, cambios: Partial<FilaCartilla>): Promise<void> {
  const { error } = await clienteRemoto().from('cartillas').update(cambios).eq('mascota_id', mascotaId)
  if (error) throw new Error(ERROR_RED)
}

async function registrarVacunaRemoto(mascotaId: string, datos: DatosVacuna): Promise<Cartilla> {
  const nombre = datos.nombre.trim()
  const actual = await obtenerRemoto(mascotaId)

  const { error } = await clienteRemoto()
    .from('vacunas')
    .insert({
      mascota_id: mascotaId,
      nombre,
      fecha: datos.fecha,
      veterinaria: datos.veterinaria?.trim() || null,
    })
  if (error) throw new Error(ERROR_RED)

  const proxima = calcularProxima(actual.proxima, nombre, datos.proximaFecha)
  if (proxima?.fecha !== actual.proxima?.fecha || proxima?.nombre !== actual.proxima?.nombre) {
    await actualizarCartilla(mascotaId, {
      proxima_nombre: proxima?.nombre ?? null,
      proxima_fecha: proxima?.fecha ?? null,
    })
  }
  return obtenerRemoto(mascotaId)
}

async function eliminarVacunaRemoto(mascotaId: string, vacunaId: string): Promise<Cartilla> {
  const { error } = await clienteRemoto().from('vacunas').delete().eq('id', vacunaId).eq('mascota_id', mascotaId)
  if (error) throw new Error(ERROR_RED)
  return obtenerRemoto(mascotaId)
}

async function guardarFotoRemoto(mascotaId: string, foto: string | undefined): Promise<Cartilla> {
  const supabase = clienteRemoto()
  const { data: sesion } = await supabase.auth.getSession()
  const usuarioId = sesion.session?.user.id
  if (!usuarioId) throw new Error('Tu sesión no es válida. Cierra sesión e inicia de nuevo.')

  const { data: previa } = await supabase
    .from('cartillas')
    .select('foto_path')
    .eq('mascota_id', mascotaId)
    .maybeSingle()
  const rutaAnterior = (previa as { foto_path: string | null } | null)?.foto_path

  const rutaNueva = esDataUrl(foto) ? await subirFoto('cartillas-fotos', usuarioId, foto) : null
  try {
    await actualizarCartilla(mascotaId, { foto_path: rutaNueva })
  } catch (error) {
    await borrarFoto('cartillas-fotos', rutaNueva)
    throw error
  }
  await borrarFoto('cartillas-fotos', rutaAnterior)
  return obtenerRemoto(mascotaId)
}

// --- API pública del repositorio ---------------------------------------------------------

export async function obtenerCartilla(mascotaId: string): Promise<Cartilla> {
  return haySupabase ? obtenerRemoto(mascotaId) : obtenerLocal(mascotaId)
}

export async function registrarVacuna(mascotaId: string, datos: DatosVacuna): Promise<Cartilla> {
  if (haySupabase) return registrarVacunaRemoto(mascotaId, datos)

  const actual = await obtenerLocal(mascotaId)
  const nombre = datos.nombre.trim()
  return guardar(
    mascotaId,
    ordenar({
      ...actual,
      proxima: calcularProxima(actual.proxima, nombre, datos.proximaFecha),
      vacunas: [
        ...actual.vacunas,
        { id: generarId(), nombre, fecha: datos.fecha, veterinaria: datos.veterinaria?.trim() || undefined },
      ],
    }),
  )
}

export async function eliminarVacuna(mascotaId: string, vacunaId: string): Promise<Cartilla> {
  if (haySupabase) return eliminarVacunaRemoto(mascotaId, vacunaId)
  const actual = await obtenerLocal(mascotaId)
  return guardar(mascotaId, { ...actual, vacunas: actual.vacunas.filter((v) => v.id !== vacunaId) })
}

/** `foto` es una data URL (ya reducida) o `undefined` para quitarla. */
export async function guardarFotoCartilla(mascotaId: string, foto: string | undefined): Promise<Cartilla> {
  if (haySupabase) return guardarFotoRemoto(mascotaId, foto)
  const actual = await obtenerLocal(mascotaId)
  return guardar(mascotaId, { ...actual, fotoCartilla: foto })
}

export async function definirRecordatorio(mascotaId: string, activo: boolean): Promise<Cartilla> {
  if (haySupabase) {
    await actualizarCartilla(mascotaId, { recordatorio: activo })
    return obtenerRemoto(mascotaId)
  }
  const actual = await obtenerLocal(mascotaId)
  return guardar(mascotaId, { ...actual, recordatorio: activo })
}
