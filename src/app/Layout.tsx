import { Outlet, useLocation } from 'react-router-dom'
import Encabezado from '../components/ui/Encabezado'
import BarraInferior from '../components/ui/BarraInferior'
import PanelAjustes from '../features/auth/PanelAjustes'
import { rutas } from './rutas'

export default function Layout() {
  const { pathname } = useLocation()
  // Las subrutas (p. ej. /mascotas/nueva) heredan el título de su sección.
  const titulo =
    rutas.find((r) => (r.path === '/' ? pathname === '/' : pathname.startsWith(r.path)))?.titulo ??
    'Manchitas'

  return (
    <div className="mx-auto min-h-dvh max-w-[390px] bg-crema">
      <div className="print:hidden">
        <Encabezado titulo={titulo} derecha={<PanelAjustes />} />
      </div>
      {/* pb-32: espacio para que la barra flotante no tape el contenido */}
      <main className="px-5 pb-32 pt-[19px] print:p-0">
        <Outlet />
      </main>
      <BarraInferior />
    </div>
  )
}
