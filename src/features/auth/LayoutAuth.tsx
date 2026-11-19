import { Outlet, useLocation } from 'react-router-dom'
import Huella from '../../components/ui/Huella'

// Pantallas de inicio de sesión, registro y recuperación de contraseña, y las públicas (QR,
// reportes). En móvil ocupan la pantalla; desde `md` quedan en una tarjeta centrada. La bienvenida
// es la excepción: ocupa toda la pantalla y maneja sus propios anchos. Las pantallas de cuenta
// (`CON_FOTO`) suman, desde `lg`, una columna con la foto de la comunidad.
const CON_FOTO = ['/iniciar-sesion', '/registro', '/recuperar', '/restablecer']

export default function LayoutAuth() {
  const { pathname } = useLocation()

  if (pathname === '/bienvenida') {
    return (
      <div className="min-h-dvh bg-crema">
        <Outlet />
      </div>
    )
  }

  const tarjeta = (
    <div className="mx-auto min-h-dvh max-w-[390px] bg-crema md:min-h-0 md:max-w-[480px] md:overflow-hidden md:rounded-[32px] md:shadow-tarjeta">
      <Outlet />
    </div>
  )

  if (CON_FOTO.includes(pathname)) {
    return (
      <div className="min-h-dvh bg-crema lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        {/* Foto de la comunidad (créditos en docs/ATRIBUCION-IMAGENES.md). Decorativa: el texto la acompaña. */}
        <aside aria-label="Manchitas" className="relative m-0 hidden overflow-hidden bg-petroleo lg:block">
          <img
            src="/img/bienvenida.webp"
            alt=""
            width={1200}
            height={800}
            className="absolute inset-0 size-full object-cover object-[42%_38%]"
          />
          <div className="absolute inset-x-8 bottom-8 flex max-w-md items-center gap-4 rounded-3xl bg-petroleo/85 px-6 py-5 text-white backdrop-blur-sm">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/15">
              <Huella aria-hidden="true" size={24} relleno />
            </span>
            <span>
              <span className="block font-titulo text-[22px] font-semibold leading-tight">
                Cuidamos cada paso de tu mejor amigo.
              </span>
              <span className="block text-[15px] text-white/85">Una comunidad que deja huella en Hermosillo.</span>
            </span>
          </div>
        </aside>
        <div className="md:px-6 md:py-8 lg:flex lg:items-center lg:justify-center lg:px-10">
          <div className="w-full">{tarjeta}</div>
        </div>
      </div>
    )
  }

  return <div className="min-h-dvh bg-crema md:px-6 md:py-8">{tarjeta}</div>
}
