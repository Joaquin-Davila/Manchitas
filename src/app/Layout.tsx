import { Outlet, useLocation } from 'react-router-dom'
import Encabezado from '../components/ui/Encabezado'
import BarraInferior from '../components/ui/BarraInferior'
import BarraSuperior from '../components/ui/BarraSuperior'
import PanelAjustes from '../features/auth/PanelAjustes'
import BotonMensajes from '../features/mensajes/BotonMensajes'
import { rutas } from './rutas'

// Pantallas con rejillas: usan todo el ancho en escritorio. Las demás se quedan en una columna
// legible de 720 px.
const ANCHAS = ['/', '/mascotas', '/comunidad', '/salud', '/avisos']

export default function Layout() {
  const { pathname } = useLocation()
  // Las subrutas (p. ej. /mascotas/nueva) heredan el título de su sección.
  const titulo =
    rutas.find((r) => (r.path === '/' ? pathname === '/' : pathname.startsWith(r.path)))?.titulo ??
    (pathname.startsWith('/mensajes') ? 'Mensajes' : 'Manchitas')
  const ancha = ANCHAS.includes(pathname) || pathname.startsWith('/comunidad/') || pathname.startsWith('/mensajes')

  return (
    <div className="min-h-dvh bg-crema">
      <div className="print:hidden">
        <Encabezado titulo={titulo} navegacion={<BarraSuperior />} derecha={
            <div className="flex items-center gap-2">
              <BotonMensajes />
              <PanelAjustes />
            </div>
          } />
      </div>
      {/* pb-32: espacio para que la barra flotante (solo móvil y tableta) no tape el contenido.
          Al imprimir solo sale la etiqueta, con el ancho de siempre. */}
      <main
        className={`mx-auto w-full max-w-[390px] px-5 pb-32 pt-[19px] md:max-w-[720px] md:px-8 lg:pb-12 print:max-w-[390px]! print:p-0! ${
          ancha ? 'lg:max-w-[1120px]' : ''
        }`}
      >
        <Outlet />
      </main>
      <BarraInferior />
    </div>
  )
}
