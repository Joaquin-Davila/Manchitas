import { createContext, useContext } from 'react'

export type Sesion = {
  /** Identificador del usuario en Supabase Auth; en modo local no existe. */
  id?: string
  nombre: string
  apellido: string
  correo: string
  /** 10 dígitos de WhatsApp; las cuentas anteriores a este campo no lo tienen. */
  telefono?: string
  ciudad?: string
  colonia?: string
  /** Cómo se presentó al registrarse. NO da permisos: los roles con privilegios son `rol`. */
  tipoUsuario?: 'tutor' | 'rescatista' | 'ciudadano'
  /** Solo Supabase lo trae. Sin él (modo local) se trata como tutor. El servidor decide qué puede leer cada rol. */
  rol?: 'tutor' | 'autoridad'
}

export type ValorSesion = {
  sesion: Sesion | null
  /** true mientras se restaura la sesión al abrir la app. */
  cargando: boolean
  /** Falla con un mensaje en español listo para mostrarse. */
  iniciarSesion: (correo: string, contrasena: string) => Promise<void>
  /** Si la confirmación de correo está activa, no hay sesión hasta confirmar. */
  registrar: (datos: Sesion, contrasena: string) => Promise<{ requiereConfirmacion: boolean }>
  cerrarSesion: () => Promise<void>
  /** Envía el enlace para elegir otra contraseña. No revela si el correo tiene cuenta. */
  recuperarContrasena: (correo: string) => Promise<void>
  /** Con la sesión del enlace de recuperación, fija la contraseña nueva. */
  actualizarContrasena: (contrasena: string) => Promise<void>
}

export const ContextoSesion = createContext<ValorSesion | null>(null)

export function useSesion(): ValorSesion {
  const valor = useContext(ContextoSesion)
  if (!valor) throw new Error('useSesion debe usarse dentro de ProveedorSesion')
  return valor
}
