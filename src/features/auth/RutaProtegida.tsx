import { Navigate, Outlet } from 'react-router-dom'
import { useSesion } from './contextoSesion'

// Sin sesión, las pantallas internas llevan a la bienvenida.
export default function RutaProtegida() {
  const { sesion, cargando } = useSesion()
  if (cargando) {
    return (
      <p role="status" className="px-5 py-16 text-center text-sm text-cafe-suave">
        Abriendo tu sesión…
      </p>
    )
  }
  return sesion ? <Outlet /> : <Navigate to="/bienvenida" replace />
}
