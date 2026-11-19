import { NavLink } from 'react-router-dom'
import { rutas } from '../../app/rutas'

// Mismo conjunto de secciones que la barra inferior, en orden de lectura (Inicio primero).
// Solo se ve desde `lg`; en móvil la navegación es la barra flotante de abajo.
const ORDEN = ['/', '/mascotas', '/comunidad', '/salud', '/avisos']
const enOrden = ORDEN.flatMap((p) => rutas.filter((r) => r.path === p))

export default function BarraSuperior() {
  return (
    <nav aria-label="Navegación principal" className="hidden lg:block">
      <ul className="m-0 flex list-none items-center gap-1 p-0">
        {enOrden.map(({ path, etiqueta, icono: Icono }) => (
          <li key={path}>
            <NavLink
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `flex min-h-11 items-center gap-2 rounded-full px-4 text-[15px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cafe ${
                  isActive ? 'bg-naranja text-white shadow-boton' : 'text-cafe hover:bg-amarillo-borde/50'
                }`
              }
            >
              <Icono aria-hidden="true" size={20} />
              {etiqueta}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
