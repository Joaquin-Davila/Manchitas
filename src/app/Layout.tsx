import { Outlet, useLocation } from 'react-router-dom'
import Encabezado from '../components/ui/Encabezado'
import BarraInferior from '../components/ui/BarraInferior'
import { rutas } from './rutas'

export default function Layout() {
  const { pathname } = useLocation()
  const titulo = rutas.find((r) => r.path === pathname)?.titulo ?? 'Manchitas'

  return (
    <div className="mx-auto min-h-dvh max-w-[390px] bg-crema">
      <Encabezado titulo={titulo} />
      {/* pb-32: espacio para que la barra flotante no tape el contenido */}
      <main className="px-5 pb-32 pt-[19px]">
        <Outlet />
      </main>
      <BarraInferior />
    </div>
  )
}
