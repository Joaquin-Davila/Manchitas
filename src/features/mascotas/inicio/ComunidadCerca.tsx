import { ArrowRight, CalendarDays, HeartHandshake, Megaphone, ShieldCheck, Stethoscope, Syringe } from 'lucide-react'
import { Link } from 'react-router-dom'
import BotonSecundario from '../../../components/ui/BotonSecundario'
import Huella from '../../../components/ui/Huella'
import { campanasProximas } from '../../../lib/campanasEjemplo'
import { formatearFecha } from '../../../lib/fechas'
import { clasesFoco, clasesTarjeta } from './comun'

const CATEGORIAS = [
  { texto: 'Vacunación', icono: Syringe, color: 'bg-menta-suave text-salud-trazo' },
  { texto: 'Esterilización', icono: ShieldCheck, color: 'bg-coral-suave text-naranja' },
  { texto: 'Veterinarias', icono: Stethoscope, color: 'bg-amarillo-suave text-cafe' },
  { texto: 'Adopción', icono: HeartHandshake, color: 'bg-menta-suave text-salud-trazo' },
  { texto: 'Reportes ciudadanos', icono: Megaphone, color: 'bg-coral-suave text-naranja' },
]

/**
 * Vista ilustrada de la ciudad (calles, río y cerro dibujados a mano). No lleva marcadores:
 * los puntos reales están en el mapa de Comunidad, que carga Leaflet solo en esa pantalla.
 */
function MapaIlustrado() {
  return (
    <svg viewBox="0 0 400 280" preserveAspectRatio="xMidYMid slice" className="block h-full w-full">
      <rect width="400" height="280" fill="#efe7d6" />
      {/* Manzanas */}
      <g fill="#fbf8f1">
        {Array.from({ length: 7 }, (_, x) =>
          Array.from({ length: 5 }, (_, y) => (
            <rect key={`${x}-${y}`} x={14 + x * 56} y={12 + y * 54} width="44" height="42" rx="6" />
          )),
        )}
      </g>
      {/* Parques */}
      <rect x="126" y="66" width="44" height="42" rx="6" fill="#d8eff2" />
      <rect x="294" y="174" width="44" height="42" rx="6" fill="#d8eff2" />
      {/* Cerro */}
      <ellipse cx="96" cy="150" rx="46" ry="30" fill="#e6d9bd" />
      <ellipse cx="96" cy="146" rx="26" ry="16" fill="#d6c49f" />
      {/* Río */}
      <path d="M-10 214 C60 190 120 236 200 212 S330 180 410 200" fill="none" stroke="#7ec4cf" strokeWidth="16" strokeLinecap="round" />
      {/* Bulevares */}
      <path d="M-10 118 L410 92" stroke="#fff" strokeWidth="9" />
      <path d="M232 -10 L262 290" stroke="#fff" strokeWidth="9" />
      <path d="M-10 118 L410 92" stroke="#84b6f4" strokeWidth="2" strokeDasharray="8 8" />
      <path d="M232 -10 L262 290" stroke="#84b6f4" strokeWidth="2" strokeDasharray="8 8" />
    </svg>
  )
}

export default function ComunidadCerca({ hoy }: { hoy: string }) {
  const siguiente = campanasProximas(hoy)[0]

  return (
    <section aria-labelledby="titulo-comunidad" className={`overflow-hidden ${clasesTarjeta}`}>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="flex flex-col gap-4 p-5 md:p-7">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-amarillo-suave px-3 py-1 text-xs font-semibold text-cafe">
              <Huella aria-hidden="true" size={13} relleno />
              Hermosillo, Sonora
            </p>
            <h2 id="titulo-comunidad" className="mt-3 font-titulo text-2xl font-bold text-cafe md:text-[28px]">
              La comunidad está cerca
            </h2>
            <p className="mt-1 text-[15px] text-cafe-suave">Cuida, comparte y participa.</p>
          </div>

          <ul className="m-0 flex list-none flex-wrap gap-2 p-0" aria-label="Qué encuentras en Comunidad">
            {CATEGORIAS.map(({ texto, icono: Icono, color }) => (
              <li key={texto} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold ${color}`}>
                <Icono aria-hidden="true" size={15} />
                {texto}
              </li>
            ))}
          </ul>

          <Link
            to="/comunidad"
            className={`group flex items-center gap-3 rounded-2xl border border-borde-calido bg-crema-clara p-3 transition-colors hover:bg-amarillo-suave ${clasesFoco}`}
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-menta-suave text-salud-trazo">
              <CalendarDays aria-hidden="true" size={22} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-x-2 text-[13px] font-semibold text-cafe-suave">
                Próxima campaña
                <span className="rounded-full bg-white px-2 py-px text-[11px] text-cafe">Dato de ejemplo</span>
              </span>
              <span className="block truncate font-semibold text-cafe">
                {siguiente ? siguiente.titulo : 'Sin campañas próximas'}
              </span>
              <span className="block truncate text-sm text-cafe-suave">
                {siguiente
                  ? `${formatearFecha(siguiente.fecha, siguiente.fecha.slice(0, 4) !== hoy.slice(0, 4))} · ${siguiente.lugar}`
                  : 'Consulta aliados y clínicas en Comunidad'}
              </span>
            </span>
            <ArrowRight aria-hidden="true" size={18} className="shrink-0 text-naranja transition-transform motion-safe:group-hover:translate-x-1" />
          </Link>

          <BotonSecundario to="/comunidad" className="mt-auto md:w-fit">
            Explorar mapa
          </BotonSecundario>
        </div>

        <Link
          to="/comunidad"
          tabIndex={-1}
          aria-hidden="true"
          className="group relative min-h-[220px] overflow-hidden border-t border-borde-calido md:min-h-[300px] lg:min-h-0 lg:border-l lg:border-t-0"
        >
          <div className="absolute inset-0 transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.04]">
            <MapaIlustrado />
          </div>
          <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-cafe">
            Ilustración · el mapa real está en Comunidad
          </span>
        </Link>
      </div>
    </section>
  )
}
