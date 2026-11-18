import { generarToken } from './identificadores'
import { clienteRemoto } from './supabase'

// Fotos en Supabase Storage. La ruta es <id del usuario>/<nombre aleatorio>.jpg: la política de
// la base solo deja escribir dentro de la carpeta propia. El nombre aleatorio (256 bits) hace que
// una URL pública no se pueda adivinar. Tamaño y tipo también los limita el bucket (2 MB, JPEG).
export type Bucket = 'mascotas-fotos' | 'cartillas-fotos'

/** `imagen.ts` entrega la foto como data URL; Storage necesita un Blob. */
function dataUrlABlob(dataUrl: string): Blob {
  const [cabecera, base64] = dataUrl.split(',')
  const tipo = /^data:(.*?);base64$/.exec(cabecera)?.[1] ?? 'image/jpeg'
  const binario = atob(base64)
  const bytes = new Uint8Array(binario.length)
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i)
  return new Blob([bytes], { type: tipo })
}

export function esDataUrl(valor: string | undefined): valor is string {
  return !!valor && valor.startsWith('data:')
}

/** Sube la foto y devuelve su ruta dentro del bucket. */
export async function subirFoto(bucket: Bucket, usuarioId: string, dataUrl: string): Promise<string> {
  const ruta = `${usuarioId}/${generarToken()}.jpg`
  const { error } = await clienteRemoto()
    .storage.from(bucket)
    .upload(ruta, dataUrlABlob(dataUrl), { contentType: 'image/jpeg', cacheControl: '31536000' })
  if (error) throw new Error('No pudimos subir la foto. Revisa tu conexión e inténtalo de nuevo.')
  return ruta
}

export async function borrarFoto(bucket: Bucket, ruta: string | null | undefined): Promise<void> {
  if (!ruta) return
  // Si falla el borrado queda un archivo huérfano, pero nunca se debe frenar la operación principal.
  await clienteRemoto().storage.from(bucket).remove([ruta])
}

/** URL de una foto de mascota (bucket público). */
export function urlFotoMascota(ruta: string | null | undefined): string | undefined {
  if (!ruta) return undefined
  return clienteRemoto().storage.from('mascotas-fotos').getPublicUrl(ruta).data.publicUrl
}

/** URL temporal (1 hora) de una foto de un bucket privado. */
export async function urlFirmada(bucket: Bucket, ruta: string | null | undefined): Promise<string | undefined> {
  if (!ruta) return undefined
  const { data } = await clienteRemoto().storage.from(bucket).createSignedUrl(ruta, 3600)
  return data?.signedUrl
}
