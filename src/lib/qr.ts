/**
 * URL que codifica el QR. Con VITE_URL_PUBLICA apunta al dominio publicado; sin ella usa el
 * origen actual (en desarrollo, localhost: solo sirve en el mismo equipo).
 */
export function urlPerfilPublico(token: string): string {
  const configurada = import.meta.env.VITE_URL_PUBLICA as string | undefined
  const base = (configurada || window.location.origin).replace(/\/+$/, '')
  return `${base}/m/${token}`
}

/** Genera el QR como imagen PNG (data URL). La librería se carga solo cuando se necesita. */
export async function generarQR(url: string, ancho = 512): Promise<string> {
  const QRCode = await import('qrcode')
  return QRCode.toDataURL(url, { width: ancho, margin: 2, errorCorrectionLevel: 'M' })
}
