import { Outlet } from 'react-router-dom'

// Pantallas de bienvenida, inicio de sesión, registro y privacidad: sin barra inferior.
export default function LayoutAuth() {
  return (
    <div className="mx-auto min-h-dvh max-w-[390px] bg-crema">
      <Outlet />
    </div>
  )
}
