import { CalendarDays, ChevronDown, Clock, MapPin, Stethoscope } from 'lucide-react'
import { lazy, Suspense, useState } from 'react'
import type { ReactNode } from 'react'
import CampoTexto from '../../components/ui/CampoTexto'
import Tarjeta from '../../components/ui/Tarjeta'
import {
  campanasProximas,
  enlaceComoLlegar,
  filtrarAliados,
  filtrarCampanas,
} from '../../lib/campanasEjemplo'
import type { Filtro } from '../../lib/campanasEjemplo'
import { hoyISO } from '../../lib/edad'
import { formatearFecha } from '../../lib/fechas'
import LimiteError from './LimiteError'

// Leaflet se descarga solo al abrir esta pantalla.
const MapaAliados = lazy(() => import('./MapaAliados'))

const FILTROS: Filtro[] = ['Todos', 'Vacunación', 'Esterilización', 'Clínicas 24 h']

const claseMapaVacio =
  'flex h-full items-center justify-center bg-foto-vacia px-4 text-center text-[13px] text-cafe-suave'

// Desplegable nativo (<details>): cerrado al inicio para que la pantalla no se alargue.
function Desplegable({ titulo, cantidad, children }: { titulo: string; cantidad: number; children: ReactNode }) {
  return (
    <details className="group">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-2 rounded-tarjeta bg-white px-4 py-2 shadow-tarjeta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naranja [&::-webkit-details-marker]:hidden">
        <span className="font-titulo text-lg font-semibold">
          {titulo} <span className="text-[13px] font-semibold text-cafe-suave">({cantidad})</span>
        </span>
        <ChevronDown aria-hidden="true" size={22} className="shrink-0 text-naranja transition-transform group-open:rotate-180" />
      </summary>
      <div className="pt-3">{children}</div>
    </details>
  )
}

export default function PanelCampanas() {
  const [hoy] = useState(() => hoyISO())
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('Todos')

  const aliados = filtrarAliados(busqueda, filtro)
  const campanas = filtrarCampanas(campanasProximas(hoy), busqueda, filtro)
  const anioActual = hoy.slice(0, 4)

  function limpiar() {
    setBusqueda('')
    setFiltro('Todos')
  }

  return (
    <div className="flex flex-col gap-4">
      <CampoTexto
        label="Buscar campañas o aliados"
        type="search"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Nombre, colonia o servicio"
        autoComplete="off"
      />

      <div role="group" aria-label="Filtrar por servicio" className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filtro === f}
            onClick={() => setFiltro(f)}
            className={`min-h-11 rounded-full px-4 text-[13px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naranja ${
              filtro === f ? 'bg-naranja text-white' : 'bg-aviso-fondo text-cafe'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <p role="status" className="-mb-2 text-[13px] text-cafe-suave">
        {campanas.length === 1 ? '1 campaña' : `${campanas.length} campañas`} y{' '}
        {aliados.length === 1 ? '1 aliado' : `${aliados.length} aliados`}
      </p>

      <section aria-label="Mapa de aliados" className="flex flex-col gap-2">
        {/* isolate: los paneles de Leaflet no deben quedar encima del encabezado ni de la barra inferior */}
        <div className="isolate h-64 overflow-hidden rounded-tarjeta border-2 border-barra-borde shadow-tarjeta">
          <LimiteError respaldo={<p className={claseMapaVacio}>No pudimos cargar el mapa. Consulta la lista de aliados.</p>}>
            <Suspense fallback={<p className={claseMapaVacio}>Cargando mapa…</p>}>
              <MapaAliados aliados={aliados} />
            </Suspense>
          </LimiteError>
        </div>
        <p className="text-xs text-cafe-suave">
          Ubicaciones aproximadas de ejemplo. La lista de abajo trae la misma información que el mapa.
        </p>
      </section>

      <Desplegable titulo="Próximas campañas" cantidad={campanas.length}>
        {campanas.length === 0 ? (
          <Tarjeta className="flex flex-col gap-2 p-4 text-sm text-cafe-suave">
            <p>No hay campañas con esos filtros.</p>
            <button
              type="button"
              onClick={limpiar}
              className="min-h-11 self-start text-[13px] font-semibold text-cafe underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naranja"
            >
              Quitar búsqueda y filtros
            </button>
          </Tarjeta>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {campanas.map((c) => (
              <li key={c.id}>
                <Tarjeta className="flex gap-3 p-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-salud-fondo text-salud-trazo">
                    <CalendarDays aria-hidden="true" size={22} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold leading-snug text-cafe-suave">{c.tipo}</p>
                    <p className="font-titulo text-base font-semibold leading-snug">{c.titulo}</p>
                    <p className="mt-1 text-[13px] leading-snug text-cafe-suave">
                      {formatearFecha(c.fecha, c.fecha.slice(0, 4) !== anioActual)}
                    </p>
                    <p className="flex items-center gap-1 text-[13px] leading-snug text-cafe-suave">
                      <Clock aria-hidden="true" size={14} className="shrink-0" />
                      {c.horario}
                    </p>
                    <p className="flex items-center gap-1 text-[13px] leading-snug text-cafe-suave">
                      <MapPin aria-hidden="true" size={14} className="shrink-0" />
                      {c.lugar}
                    </p>
                  </div>
                </Tarjeta>
              </li>
            ))}
          </ul>
        )}
      </Desplegable>

      <Desplegable titulo="Aliados" cantidad={aliados.length}>
        {aliados.length === 0 ? (
          <Tarjeta className="p-4 text-sm text-cafe-suave">No hay aliados con esos filtros.</Tarjeta>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {aliados.map((a) => (
              <li key={a.id}>
                <Tarjeta className="flex gap-3 p-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-celeste text-cafe">
                    <Stethoscope aria-hidden="true" size={22} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold leading-snug text-cafe-suave">{a.tipo}</p>
                    <p className="font-titulo text-base font-semibold leading-snug">{a.nombre}</p>
                    <p className="mt-1 text-[13px] leading-snug text-cafe-suave">
                      {a.zona} · {a.horario}
                    </p>
                    <p className="text-[13px] leading-snug text-cafe-suave">
                      Servicios: {a.servicios.join(' y ').toLowerCase()}
                    </p>
                    <a
                      href={enlaceComoLlegar(a)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Cómo llegar a ${a.nombre} (se abre en otra pestaña)`}
                      className="mt-2 inline-flex min-h-11 items-center rounded-boton border-2 border-barra-borde px-4 text-[13px] font-semibold text-cafe focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naranja"
                    >
                      Cómo llegar
                    </a>
                  </div>
                </Tarjeta>
              </li>
            ))}
          </ul>
        )}
      </Desplegable>
    </div>
  )
}
