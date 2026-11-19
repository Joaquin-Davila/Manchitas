import { LogOut, Settings, ShieldCheck, X } from 'lucide-react'
import { useRef } from 'react'
import { useLocation } from 'react-router-dom'
import BotonSecundario from '../../components/ui/BotonSecundario'
import { useSesion } from './contextoSesion'

// Botón de ajustes del encabezado y su panel modal. Por ahora solo trae "Cerrar sesión".
export default function PanelAjustes() {
  const dialogo = useRef<HTMLDialogElement>(null)
  const { sesion, cerrarSesion } = useSesion()
  const { pathname } = useLocation()

  function salir() {
    dialogo.current?.close()
    // Sin sesión, RutaProtegida lleva a la bienvenida.
    cerrarSesion()
  }

  return (
    <>
      <button
        type="button"
        aria-label="Ajustes"
        aria-haspopup="dialog"
        onClick={() => dialogo.current?.showModal()}
        className="flex size-11 items-center justify-center rounded-full bg-crema text-cafe"
      >
        <Settings aria-hidden="true" size={24} />
      </button>

      {/* Modal nativo: el navegador aporta Esc, foco contenido y regreso del foco al botón. */}
      <dialog
        ref={dialogo}
        aria-labelledby="titulo-ajustes"
        className="m-auto w-[min(340px,calc(100%-40px))] overscroll-contain rounded-tarjeta bg-crema p-5 text-cafe shadow-tarjeta backdrop:overflow-hidden backdrop:overscroll-contain backdrop:bg-cafe/50"
      >
        <div className="flex items-center justify-between">
          <h2 id="titulo-ajustes" className="font-titulo text-lg font-semibold">
            Ajustes
          </h2>
          <button
            type="button"
            aria-label="Cerrar ajustes"
            onClick={() => dialogo.current?.close()}
            className="-mr-2 flex size-11 items-center justify-center rounded-full"
          >
            <X aria-hidden="true" size={22} />
          </button>
        </div>
        {sesion && (
          <p className="mt-1 break-words text-sm text-cafe-suave">
            Sesión iniciada con {sesion.correo}
          </p>
        )}
        {/* Solo se ofrece a quien tiene el rol; no es parte de la navegación de los tutores. */}
        {sesion?.rol === 'autoridad' && pathname !== '/autoridad' && (
          <BotonSecundario to="/autoridad" onClick={() => dialogo.current?.close()} className="mt-5 gap-2">
            <ShieldCheck aria-hidden="true" size={20} />
            Panel de autoridad
          </BotonSecundario>
        )}
        <BotonSecundario onClick={salir} className="mt-3 gap-2">
          <LogOut aria-hidden="true" size={20} />
          Cerrar sesión
        </BotonSecundario>
      </dialog>
    </>
  )
}
