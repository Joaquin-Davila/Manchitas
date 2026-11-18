import { NavLink } from 'react-router-dom'
import { rutas } from '../../app/rutas'

export default function BarraInferior() {
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-4 z-10 mx-auto w-full max-w-[390px] px-[14px]"
    >
      <ul className="m-0 flex h-[76px] list-none items-center justify-between rounded-barra border border-barra-borde bg-white px-3 shadow-barra">
        {rutas.map(({ path, etiqueta, icono: Icono }) => (
          <li key={path} className="flex w-[68px] justify-center">
            <NavLink
              to={path}
              end={path === '/'}
              aria-label={etiqueta}
              className={({ isActive }) =>
                isActive
                  ? '-translate-y-3 flex size-[68px] items-center justify-center rounded-full border-4 border-white bg-naranja text-white shadow-boton'
                  : 'flex size-11 items-center justify-center rounded-full text-naranja'
              }
            >
              <Icono aria-hidden="true" size={28} />
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
