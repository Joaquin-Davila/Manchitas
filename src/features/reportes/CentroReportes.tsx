import { BookOpen, ChevronRight, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import Tarjeta from '../../components/ui/Tarjeta'

const enlace =
  'block rounded-tarjeta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naranja'

// Pestaña Avisos (encabezado "Reportes"): punto de entrada al reporte, al seguimiento y al reglamento.
export default function CentroReportes() {
  return (
    <div className="flex flex-col gap-3">
      <Tarjeta className="flex flex-col gap-3 p-5">
        <h2 className="font-titulo text-lg font-semibold">¿Viste maltrato o abandono?</h2>
        <p className="text-sm text-cafe-suave">
          Cuéntanos en 4 pasos. No necesitas cuenta y recibes un folio para darle seguimiento. Tu reporte se
          canaliza a la autoridad.
        </p>
        <BotonPrincipal to="/reportar">Hacer un reporte</BotonPrincipal>
      </Tarjeta>

      <Link to="/reportar/seguimiento" className={enlace}>
        <Tarjeta className="flex items-center gap-3 px-4 py-3.5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-celeste text-cafe">
            <Search aria-hidden="true" size={22} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold leading-snug">Consultar seguimiento</p>
            <p className="text-[13px] leading-snug text-cafe-suave">Con el folio de tu reporte</p>
          </div>
          <ChevronRight aria-hidden="true" size={20} className="text-cafe-suave" />
        </Tarjeta>
      </Link>

      <Link to="/reglamento" className={enlace}>
        <Tarjeta className="flex items-center gap-3 px-4 py-3.5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-salud-fondo text-salud-trazo">
            <BookOpen aria-hidden="true" size={22} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold leading-snug">Reglamento de Protección Animal</p>
            <p className="text-[13px] leading-snug text-cafe-suave">Obligaciones, prevención y sanciones</p>
          </div>
          <ChevronRight aria-hidden="true" size={20} className="text-cafe-suave" />
        </Tarjeta>
      </Link>
    </div>
  )
}
