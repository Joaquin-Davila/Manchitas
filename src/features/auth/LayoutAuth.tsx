import { Outlet, useLocation } from 'react-router-dom'

// Pantallas de bienvenida, inicio de sesión, registro, privacidad y las públicas (QR, reportes):
// sin barra de navegación. En móvil ocupan la pantalla; desde `md` quedan en una tarjeta centrada
// y la bienvenida se abre en dos columnas (foto y acciones) desde `lg`.
export default function LayoutAuth() {
  const { pathname } = useLocation()
  const bienvenida = pathname === '/bienvenida'
  return (
    <div className="min-h-dvh bg-crema md:px-6 md:py-8">
      <div
        className={`mx-auto min-h-dvh max-w-[390px] bg-crema md:min-h-0 md:max-w-[480px] md:overflow-hidden md:rounded-[32px] md:shadow-tarjeta ${
          bienvenida ? 'lg:max-w-[1000px]' : ''
        }`}
      >
        <Outlet />
      </div>
    </div>
  )
}
