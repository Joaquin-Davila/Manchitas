import { createContext, useContext } from 'react'

export type Sesion = {
  nombre: string
  apellido: string
  correo: string
  /** 10 dígitos de WhatsApp; las cuentas anteriores a este campo no lo tienen. */
  telefono?: string
}

export type ValorSesion = {
  sesion: Sesion | null
  iniciarSesion: (correo: string) => void
  registrar: (datos: Sesion) => void
  cerrarSesion: () => void
}

export const ContextoSesion = createContext<ValorSesion | null>(null)

export function useSesion(): ValorSesion {
  const valor = useContext(ContextoSesion)
  if (!valor) throw new Error('useSesion debe usarse dentro de ProveedorSesion')
  return valor
}
