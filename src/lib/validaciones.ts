import { hoyISO } from './edad'

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

/** Requisitos de una contraseña nueva, en el orden en que se muestran al registrarse. */
export function requisitosContrasena(valor: string): { texto: string; cumple: boolean }[] {
  return [
    { texto: 'Al menos 8 caracteres', cumple: valor.length >= 8 },
    { texto: 'Una letra', cumple: /\p{L}/u.test(valor) },
    { texto: 'Un número', cumple: /\d/.test(valor) },
  ]
}

export function validarContrasenaNueva(valor: string): string | null {
  return requisitosContrasena(valor).every((r) => r.cumple)
    ? null
    : 'Usa al menos 8 caracteres, con una letra y un número.'
}

export function validarConfirmacionContrasena(valor: string, contrasena: string): string | null {
  if (!valor) return 'Escribe de nuevo tu contraseña.'
  return valor === contrasena ? null : 'Las contraseñas no coinciden.'
}

export function validarCiudad(valor: string): string | null {
  const texto = valor.trim()
  if (!texto) return 'Escribe tu ciudad.'
  return texto.length > 80 ? 'Máximo 80 caracteres.' : null
}

export function validarContrasenaActual(valor: string): string | null {
  return valor ? null : 'Escribe tu contraseña.'
}

// --- Mascota ---

export function validarNombreMascota(valor: string): string | null {
  const texto = valor.trim()
  if (!texto) return 'Escribe el nombre de tu mascota.'
  if (!/^[\p{L}\p{N}][\p{L}\p{N}\s'.-]*$/u.test(texto) || texto.length > 40) {
    return 'Usa solo letras y números (máximo 40).'
  }
  return null
}

export function validarRaza(valor: string): string | null {
  const texto = valor.trim()
  if (!texto) return 'Escribe la raza o "Mestizo".'
  if (!/^\p{L}[\p{L}\s'.-]*$/u.test(texto) || texto.length > 60) {
    return 'Usa solo letras (máximo 60).'
  }
  return null
}

export function validarAnioNacimiento(valor: string): string | null {
  return valor ? null : 'Elige el año aproximado de nacimiento.'
}

/** Fecha exacta en formato AAAA-MM-DD: real, no futura y de los últimos 25 años. */
export function validarFechaNacimiento(valor: string, hoy = new Date()): string | null {
  const coincide = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor)
  if (!coincide) return 'Elige la fecha de nacimiento.'
  const [anio, mes, dia] = [Number(coincide[1]), Number(coincide[2]), Number(coincide[3])]
  const existe = new Date(Date.UTC(anio, mes - 1, dia))
  if (existe.getUTCFullYear() !== anio || existe.getUTCMonth() !== mes - 1 || existe.getUTCDate() !== dia) {
    return 'Esa fecha no existe.'
  }
  if (valor > hoyISO(hoy)) return 'La fecha no puede ser futura.'
  if (anio < hoy.getFullYear() - 25) return 'Revisa la fecha: parece muy antigua.'
  return null
}

// --- Cartilla ---

function fechaExiste(valor: string): boolean {
  const c = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor)
  if (!c) return false
  const [anio, mes, dia] = [Number(c[1]), Number(c[2]), Number(c[3])]
  const f = new Date(Date.UTC(anio, mes - 1, dia))
  return f.getUTCFullYear() === anio && f.getUTCMonth() === mes - 1 && f.getUTCDate() === dia
}

export function validarVacuna(valor: string): string | null {
  return valor ? null : 'Elige la vacuna.'
}

export function validarOtraVacuna(valor: string): string | null {
  const texto = valor.trim()
  if (!texto) return 'Escribe el nombre de la vacuna.'
  if (!/^[\p{L}\p{N}][\p{L}\p{N}\s'.()/-]*$/u.test(texto) || texto.length > 60) {
    return 'Usa solo letras y números (máximo 60).'
  }
  return null
}

/** Fecha de aplicación: real, no futura y no anterior al nacimiento ("AAAA" o "AAAA-MM-DD"). */
export function validarFechaVacuna(valor: string, nacimiento: string, hoy = new Date()): string | null {
  if (!valor) return 'Elige la fecha en que se aplicó.'
  if (!fechaExiste(valor)) return 'Esa fecha no existe.'
  if (valor > hoyISO(hoy)) return 'La fecha no puede ser futura.'
  const antes = nacimiento.length === 4 ? valor.slice(0, 4) < nacimiento : valor < nacimiento
  if (antes) return 'La fecha es anterior al nacimiento de tu mascota.'
  return null
}

/** Próxima dosis: opcional; si se escribe, debe ser real, de hoy en adelante y posterior a la aplicada. */
export function validarFechaProxima(valor: string, aplicada: string, hoy = new Date()): string | null {
  if (!valor) return null
  if (!fechaExiste(valor)) return 'Esa fecha no existe.'
  if (valor < hoyISO(hoy)) return 'La próxima dosis debe ser de hoy en adelante.'
  if (aplicada && valor <= aplicada) return 'Debe ser posterior a la fecha de aplicación.'
  return null
}

export function validarVeterinaria(valor: string): string | null {
  const texto = valor.trim()
  if (!texto) return null
  if (!/^[\p{L}\p{N}][\p{L}\p{N}\s'.,&-]*$/u.test(texto) || texto.length > 80) {
    return 'Usa solo letras y números (máximo 80).'
  }
  return null
}

// --- Reporte ciudadano ---

export function validarColonia(valor: string): string | null {
  const texto = valor.trim()
  if (!texto) return 'Escribe la colonia o el sector.'
  if (texto.length > 80) return 'Máximo 80 caracteres.'
  return null
}

export function validarCalle(valor: string): string | null {
  const texto = valor.trim()
  if (!texto) return 'Escribe la calle, el número o el cruce más cercano.'
  if (texto.length > 120) return 'Máximo 120 caracteres.'
  return null
}

export function validarReferencias(valor: string): string | null {
  return valor.trim().length > 200 ? 'Máximo 200 caracteres.' : null
}

export function validarDescripcionReporte(valor: string): string | null {
  const largo = valor.trim().length
  if (largo < 20) return 'Cuéntanos qué viste, con al menos 20 caracteres.'
  if (largo > 800) return 'Máximo 800 caracteres.'
  return null
}

/** Fecha aproximada de los hechos: real, no futura y de los últimos 2 años. */
export function validarFechaHechos(valor: string, hoy = new Date()): string | null {
  if (!valor) return 'Elige la fecha aproximada de los hechos.'
  if (!fechaExiste(valor)) return 'Esa fecha no existe.'
  if (valor > hoyISO(hoy)) return 'La fecha no puede ser futura.'
  if (Number(valor.slice(0, 4)) < hoy.getFullYear() - 2) return 'Revisa la fecha: parece muy antigua.'
  return null
}

/** Teléfono de contacto opcional: si se escribe, debe tener los 10 dígitos. */
export function validarTelefonoOpcional(valor: string): string | null {
  return valor.trim() ? validarTelefono(valor) : null
}

/**
 * Texto que verá cualquier persona al escanear el QR (señas y nota). Es opcional, pero no puede
 * traer un teléfono: 8 o más dígitos (aunque vayan separados por espacios o guiones).
 */
export function validarTextoPublico(valor: string, maximo: number): string | null {
  const texto = valor.trim()
  if (texto.length > maximo) return `Máximo ${maximo} caracteres.`
  if (/(?:\d[\s.\-()]*){8,}/.test(texto)) {
    return 'No incluyas teléfonos ni números largos: este texto lo ve cualquiera que escanee el QR.'
  }
  return null
}
