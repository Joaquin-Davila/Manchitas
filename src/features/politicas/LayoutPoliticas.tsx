import { ArrowLeft } from 'lucide-react'
import { NavLink, Outlet, useNavigate, useSearchParams } from 'react-router-dom'

const DOCUMENTOS = [
  { to: '/terminos', texto: 'Términos y condiciones' },
  { to: '/privacidad', texto: 'Aviso de privacidad' },
  { to: '/cookies', texto: 'Cookies y almacenamiento' },
  { to: '/reglamento', texto: 'Reglamento municipal' },
]

// Contenedor de los documentos de políticas. Son públicos (se abren desde el registro y desde el
// reporte ciudadano), así que no llevan la barra de la app: una columna editorial ancha, con
// navegación entre los cuatro documentos y un botón de regreso.
export default function LayoutPoliticas() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  function volver() {
    // Si se abrió en otra pestaña no hay historial: se regresa a un punto de entrada.
    const hayHistorial = (window.history.state as { idx?: number } | null)?.idx
    if (hayHistorial && hayHistorial > 0) navigate(-1)
    else navigate(params.get('desde') === 'reportar' ? '/reportar' : '/bienvenida')
  }

  return (
    <div className="min-h-dvh bg-crema">
      <div className="mx-auto w-full max-w-[1040px] px-5 pb-16 pt-5 md:px-8">
        <button
          type="button"
          onClick={volver}
          className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-full px-3 font-semibold text-naranja-sombra hover:bg-amarillo-suave focus-visible:outline-2 focus-visible:outline-naranja-sombra"
        >
          <ArrowLeft aria-hidden="true" size={18} />
          Volver
        </button>

        <nav aria-label="Documentos" className="mt-2 -mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
          <ul className="m-0 flex list-none gap-2 p-0">
            {DOCUMENTOS.map(({ to, texto }) => (
              <li key={to} className="shrink-0">
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naranja-sombra ${
                      isActive
                        ? 'border-naranja bg-naranja text-white'
                        : 'border-borde-calido bg-white text-cafe hover:bg-amarillo-suave'
                    }`
                  }
                >
                  {texto}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <main className="mt-6 rounded-[28px] border border-borde-calido bg-white p-5 shadow-suave md:p-9">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
