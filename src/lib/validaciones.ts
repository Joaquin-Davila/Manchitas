// Cada validación devuelve el mensaje de error (en español) o null si el valor es válido.
// La validación del cliente es solo para la experiencia; la de seguridad irá en Supabase.

export function validarNombre(valor: string, campo: 'nombre' | 'apellido'): string | null {
  const texto = valor.trim()
  if (!texto) return campo === 'nombre' ? 'Escribe tu nombre.' : 'Escribe tu apellido.'
  // Letras de cualquier alfabeto, espacios, apóstrofo, punto y guion.
  if (!/^\p{L}[\p{L}\s'.-]*$/u.test(texto) || texto.length > 60) {
    return 'Usa solo letras (máximo 60).'
  }
  return null
}

export function validarTelefono(valor: string): string | null {
  const digitos = valor.replace(/[\s-]/g, '')
  if (!/^\d{10}$/.test(digitos)) {
    return 'Escribe los 10 dígitos de tu WhatsApp, por ejemplo 662 123 4567.'
  }
  return null
}

export function validarCorreo(valor: string): string | null {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim())) {
    return 'Escribe un correo con el formato tu@correo.com.'
  }
  return null
}

export function validarContrasenaNueva(valor: string): string | null {
  return valor.length >= 8 ? null : 'Usa al menos 8 caracteres.'
}

export function validarContrasenaActual(valor: string): string | null {
  return valor ? null : 'Escribe tu contraseña.'
}
