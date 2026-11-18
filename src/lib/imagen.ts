const TAMANO_MAXIMO = 15 * 1024 * 1024 // 15 MB

/**
 * Reduce una foto a un JPEG de máximo `ladoMax` px por lado. Al redibujarla en un canvas
 * se respeta la orientación y se descartan los metadatos (EXIF, incluida la ubicación).
 */
export async function reducirImagen(archivo: File, ladoMax = 800): Promise<string> {
  if (!archivo.type.startsWith('image/')) throw new Error('El archivo no es una imagen.')
  if (archivo.size > TAMANO_MAXIMO) throw new Error('La imagen pesa más de 15 MB.')

  const mapa = await createImageBitmap(archivo, { imageOrientation: 'from-image' })
  try {
    const escala = Math.min(1, ladoMax / Math.max(mapa.width, mapa.height))
    const lienzo = document.createElement('canvas')
    lienzo.width = Math.round(mapa.width * escala)
    lienzo.height = Math.round(mapa.height * escala)
    const contexto = lienzo.getContext('2d')
    if (!contexto) throw new Error('No se pudo procesar la imagen.')
    contexto.drawImage(mapa, 0, 0, lienzo.width, lienzo.height)
    return lienzo.toDataURL('image/jpeg', 0.8)
  } finally {
    mapa.close()
  }
}
