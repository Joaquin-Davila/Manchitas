import { Navigate, Outlet } from 'react-router-dom'
import { useSesion } from './contextoSesion'

// Sin sesión, las pantallas internas llevan a la bienvenida.
export default function RutaProtegida() {
  const { sesion } = useSesion()
  return sesion ? <Outlet /> : <Navigate to="/bienvenida" replace />
}
