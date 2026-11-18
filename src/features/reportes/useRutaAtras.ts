import { useSesion } from '../auth/contextoSesion'

/** Estas pantallas son públicas: con sesión se regresa a Reportes y sin sesión, a la bienvenida. */
export function useRutaAtras(): string {
  const { sesion } = useSesion()
  return sesion ? '/avisos' : '/bienvenida'
}
