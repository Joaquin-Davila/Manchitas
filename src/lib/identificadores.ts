// Alfabeto de 32 caracteres sin 0, O, 1 ni I (se confunden al leerlos o imprimirlos).
// Como 256 es múltiplo de 32, `byte % 32` no introduce sesgo.
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

/** Folio público aleatorio, p. ej. MCH-7K3P9Q (32^6 ≈ 1,000 millones de combinaciones). */
export function generarFolio(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  return 'MCH-' + Array.from(bytes, (b) => ALFABETO[b % 32]).join('')
}

/** Token largo para el QR (256 bits, base64url). No se puede adivinar ni enumerar. */
export function generarToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/** Identificador interno (hex). `randomUUID` exige contexto seguro, `getRandomValues` no. */
export function generarId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12))
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}
