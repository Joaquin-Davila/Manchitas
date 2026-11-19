import { ArrowRight, CalendarDays, Clock, LayoutGrid, MapPin, Navigation, ShieldCheck, Syringe, X } from 'lucide-react'
import { lazy, Suspense, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { clasesBotonSecundario } from '../../components/ui/BotonSecundario'
import {
  aliadoDe,
  campanasDeAliado,
  campanasProximas,
  enlaceComoLlegar,
  estadoCampana,
  filtrarAliados,
  filtrarCampanas,
} from '../../lib/campanasEjemplo'
import type { Aliado, Campana, Filtro } from '../../lib/campanasEjemplo'
import { hoyISO } from '../../lib/edad'
import { formatearFecha } from '../../lib/fechas'
import { Aparecer, clasesTarjeta } from '../mascotas/inicio/comun'
import { CATEGORIAS_MAPA, categoriaDe } from './categoriasMapa'
import Directorio from './Directorio'
import FichaLugar from './FichaLugar'
import type { Ficha } from './FichaLugar'
import LimiteError from './LimiteError'
import { BotonLimpiar, Buscador, Chip, EtiquetaEstado, EtiquetaTipo, FilaChips, TituloBloque, clasesFocoComunidad } from './piezas'
import { visualDe } from './visualComunidad'

// Leaflet se descarga solo al abrir esta pantalla.
const MapaAliados = lazy(() => import('./MapaAliados'))

const FILTROS: { id: Filtro; etiqueta: string; icono: typeof Syringe }[] = [
  { id: 'Todos', etiqueta: 'Todas', icono: LayoutGrid },
  { id: 'Vacunación', etiqueta: 'Vacunación', icono: Syringe },
  { id: 'Esterilización', etiqueta: 'Esterilización', icono: ShieldCheck },
  { id: 'Clínicas 24 h', etiqueta: 'Clínicas 24 h', icono: Clock },
]

const claseMapaVacio =
  'flex h-full items-center justify-center bg-foto-vacia px-4 text-center text-[13px] text-cafe-suave'

function plural(n: number, uno: string, varios: string) {
  return `${n} ${n === 1 ? uno : varios}`
}

/** Tarjeta del lugar elegido en el mapa: sobre el mapa desde `md`, debajo en móvil. */
function TarjetaSeleccion({
  aliado,
  proxima,
  hoy,
  onDetalles,
  onCerrar,
}: {
  aliado: Aliado
  proxima?: Campana
  hoy: string
  onDetalles: () => void
  onCerrar: () => void
}) {
  const { color } = categoriaDe(aliado.tipo)
  return (
    <div
      role="region"
      aria-label={`Lugar seleccionado: ${aliado.nombre}`}
      className="aparecer flex gap-3 rounded-[20px] border border-borde-calido bg-white p-3.5 shadow-elevada"
    >
      <span aria-hidden="true" className="mt-1 size-3 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <EtiquetaTipo tipo={aliado.tipo} />
            <p className="mt-1 font-titulo text-base font-bold leading-snug text-cafe">{aliado.nombre}</p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar la tarjeta del lugar"
            className={`-mr-1.5 -mt-1.5 flex size-11 shrink-0 items-center justify-center rounded-full text-cafe-suave hover:bg-crema ${clasesFocoComunidad}`}
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>
        <p className="mt-1 text-[13px] text-cafe-suave">
          {aliado.zona} · {aliado.horario}
        </p>
        {proxima && (
          <p className="mt-1 text-[13px] text-cafe">
            <span className="font-semibold">Próxima campaña:</span>{' '}
            {formatearFecha(proxima.fecha, proxima.fecha.slice(0, 4) !== hoy.slice(0, 4))} · {proxima.titulo}
          </p>
        )}
        <div className="mt-2.5 flex flex-wrap gap-2">
          <button type="button" onClick={onDetalles} className={`${clasesBotonSecundario} h-11! w-auto! gap-1.5 px-4! text-sm!`}>
            Ver detalles
          </button>
          <a
            href={enlaceComoLlegar(aliado)}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-naranja-sombra hover:bg-crema ${clasesFocoComunidad}`}
          >
            <Navigation aria-hidden="true" size={16} />
            Cómo llegar
            <span className="sr-only">(se abre en otra pestaña)</span>
          </a>
        </div>
      </div>
    </div>
  )
}

function TarjetaActividad({
  campana,
  hoy,
  resaltada,
  enMapa,
  indice,
  onDetalles,
  onMapa,
}: {
  campana: Campana
  hoy: string
  resaltada: boolean
  enMapa: boolean
  indice: number
  onDetalles: () => void
  onMapa: () => void
}) {
  const aliado = aliadoDe(campana)
  const { fondo, texto, icono: Icono } = visualDe(campana.tipo)
  return (
    <Aparecer como="li" retraso={40 + indice * 50}>
      <article
        aria-labelledby={`campana-${campana.id}`}
        className={`flex gap-3.5 rounded-[20px] border bg-white p-3.5 transition-[box-shadow,border-color] duration-300 ${
          resaltada ? 'border-naranja shadow-elevada' : 'border-borde-calido shadow-suave hover:shadow-elevada'
        }`}
      >
        {/* Imagen representativa en miniatura (ícono del tipo): no hay fotos propias de las campañas. */}
        <div aria-hidden="true" className={`flex size-16 shrink-0 items-center justify-center rounded-2xl ${fondo} ${texto}`}>
          <Icono size={28} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-1.5">
            <EtiquetaEstado estado={estadoCampana(campana, hoy)} />
            <EtiquetaTipo tipo={campana.tipo} />
          </p>
          <h3 id={`campana-${campana.id}`} className="mt-1.5 font-titulo text-base font-bold leading-snug text-cafe">
            {campana.titulo}
          </h3>
          <div className="mt-1 flex flex-col gap-0.5 text-[13px] text-cafe-suave">
            <p className="flex items-center gap-1.5">
              <CalendarDays aria-hidden="true" size={14} className="shrink-0" />
              {formatearFecha(campana.fecha, campana.fecha.slice(0, 4) !== hoy.slice(0, 4))} · {campana.horario}
            </p>
            <p className="flex items-center gap-1.5">
              <MapPin aria-hidden="true" size={14} className="shrink-0" />
              <span className="min-w-0">{campana.lugar}</span>
            </p>
            {aliado && <p>Organiza: {aliado.nombre}</p>}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={onDetalles}
              className={`flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-semibold text-naranja-sombra hover:bg-crema ${clasesFocoComunidad}`}
            >
              Ver detalles
              <ArrowRight aria-hidden="true" size={15} />
              <span className="sr-only"> de {campana.titulo}</span>
            </button>
            {enMapa && (
              <button
                type="button"
                onClick={onMapa}
                className={`flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-semibold text-cafe-suave hover:bg-crema ${clasesFocoComunidad}`}
              >
                <MapPin aria-hidden="true" size={15} />
                Ver en el mapa
              </button>
            )}
          </div>
        </div>
      </article>
    </Aparecer>
  )
}

export default function PanelCampanas() {
  const [hoy] = useState(() => hoyISO())
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('Todos')
  const [elegido, setElegido] = useState<string | null>(null)
  const [ficha, setFicha] = useState<Ficha | null>(null)
  const zonaMapa = useRef<HTMLDivElement>(null)

  const aliados = useMemo(() => filtrarAliados(busqueda, filtro), [busqueda, filtro])
  const proximas = useMemo(() => campanasProximas(hoy), [hoy])
  const campanas = useMemo(() => filtrarCampanas(proximas, busqueda, filtro), [proximas, busqueda, filtro])
  const hayFiltros = busqueda !== '' || filtro !== 'Todos'

  // Si los filtros ocultan el lugar elegido, la selección desaparece sola.
  const seleccionado = aliados.find((a) => a.id === elegido)
  const idsEnMapa = new Set(aliados.map((a) => a.id))

  function limpiar() {
    setBusqueda('')
    setFiltro('Todos')
  }

  function verEnMapa(id: string) {
    setElegido(id)
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    zonaMapa.current?.scrollIntoView({ behavior: reducido ? 'auto' : 'smooth', block: 'center' })
  }

  function abrirAliado(id: string) {
    const aliado = aliados.find((a) => a.id === id)
    if (aliado) setFicha({ tipo: 'aliado', aliado, campanas: campanasDeAliado(proximas, id) })
  }

  function abrirCampana(c: Campana) {
    setFicha({ tipo: 'campana', campana: c, aliado: aliadoDe(c), estado: estadoCampana(c, hoy) })
  }

  return (
    <div className="flex flex-col gap-8 md:gap-10">
      <div className="flex flex-col gap-3">
        <Buscador
          id="buscar-campanas"
          etiqueta="Buscar campañas, veterinarias o servicios"
          valor={busqueda}
          onCambiar={setBusqueda}
          placeholder="Busca campañas, veterinarias o servicios..."
        />
        <div className="flex items-start gap-2">
          <FilaChips etiqueta="Filtrar por servicio">
            {FILTROS.map(({ id, etiqueta, icono: Icono }) => (
              <Chip key={id} activo={filtro === id} onClick={() => setFiltro(id)} icono={<Icono aria-hidden="true" size={16} />}>
                {etiqueta}
              </Chip>
            ))}
            {hayFiltros && <BotonLimpiar onClick={limpiar} />}
          </FilaChips>
        </div>
        <p role="status" className="text-[13px] text-cafe-suave">
          {plural(campanas.length, 'actividad próxima', 'actividades próximas')} ·{' '}
          {plural(aliados.length, 'lugar en el mapa', 'lugares en el mapa')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-start">
        <section aria-labelledby="titulo-mapa" className="flex flex-col gap-3">
          <h2 id="titulo-mapa" className="sr-only">
            Mapa de Hermosillo
          </h2>
          <div ref={zonaMapa} className="relative scroll-mt-24">
            {/* isolate: los paneles de Leaflet no deben quedar encima del encabezado ni de la barra inferior */}
            <div className={`isolate h-[340px] overflow-hidden md:h-[440px] lg:h-[580px] ${clasesTarjeta}`}>
              <LimiteError respaldo={<p className={claseMapaVacio}>No pudimos cargar el mapa. Consulta las listas de abajo.</p>}>
                <Suspense
                  fallback={
                    <p role="status" className={`${claseMapaVacio} animate-pulse`}>
                      Cargando mapa…
                    </p>
                  }
                >
                  <MapaAliados aliados={aliados} seleccionado={seleccionado?.id ?? null} onSeleccionar={setElegido} />
                </Suspense>
              </LimiteError>
            </div>
            {seleccionado && (
              <div className="mt-3 md:absolute md:bottom-4 md:left-4 md:z-[1000] md:mt-0 md:w-[min(380px,calc(100%-240px))]">
                <TarjetaSeleccion
                  aliado={seleccionado}
                  proxima={campanasDeAliado(proximas, seleccionado.id)[0]}
                  hoy={hoy}
                  onDetalles={() => abrirAliado(seleccionado.id)}
                  onCerrar={() => setElegido(null)}
                />
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <ul aria-label="Leyenda del mapa" className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1.5 p-0">
              {CATEGORIAS_MAPA.map((c) => (
                <li key={c.tipo} className="flex items-center gap-1.5 text-[13px] font-semibold text-cafe">
                  <span aria-hidden="true" className="size-3 rounded-full ring-2 ring-white" style={{ backgroundColor: c.color }} />
                  {c.etiqueta}
                </li>
              ))}
            </ul>
            <p className="text-xs text-cafe-suave">Ubicaciones aproximadas de ejemplo. Toca un marcador para ver el lugar.</p>
          </div>
        </section>

        <section aria-labelledby="titulo-actividades" className="flex min-w-0 scroll-mt-24 flex-col">
          <TituloBloque
            id="titulo-actividades"
            titulo="Próximas actividades"
            derecha={<span className="rounded-full bg-crema px-3 py-1 text-xs font-semibold text-cafe-suave">Datos de ejemplo</span>}
          />
          {campanas.length === 0 ? (
            <div className={`flex flex-col items-center gap-2 p-6 text-center ${clasesTarjeta}`}>
              <span className="flex size-12 items-center justify-center rounded-full bg-aviso-fondo text-naranja">
                <CalendarDays aria-hidden="true" size={22} />
              </span>
              <p className="font-titulo text-base font-semibold text-cafe">No hay actividades con esos filtros</p>
              <p className="text-sm text-cafe-suave">Vuelve pronto: publicamos campañas en cuanto se confirman.</p>
              <div className="mt-1 flex flex-wrap justify-center gap-2">
                {hayFiltros && <BotonLimpiar onClick={limpiar} />}
                <Link to="/comunidad?tab=adopcion" onClick={() => window.scrollTo({ top: 0 })} className={`flex min-h-11 items-center rounded-full px-3 text-[13px] font-semibold text-naranja-sombra hover:underline ${clasesFocoComunidad}`}>
                  Explorar adopciones
                </Link>
              </div>
            </div>
          ) : (
            // Desde lg la lista se desplaza sola, a la altura del mapa.
            <ul className="m-0 flex list-none flex-col gap-3 p-0 lg:max-h-[580px] lg:overflow-y-auto lg:overscroll-contain lg:pb-1 lg:pr-1.5">
              {campanas.map((c, i) => (
                <TarjetaActividad
                  key={c.id}
                  campana={c}
                  hoy={hoy}
                  indice={i}
                  resaltada={!!seleccionado && c.aliadoId === seleccionado.id}
                  enMapa={!!c.aliadoId && idsEnMapa.has(c.aliadoId)}
                  onDetalles={() => abrirCampana(c)}
                  onMapa={() => c.aliadoId && verEnMapa(c.aliadoId)}
                />
              ))}
            </ul>
          )}
        </section>
      </div>

      <Directorio
        aliados={aliados}
        campanas={proximas}
        hoy={hoy}
        onVerEstablecimiento={abrirAliado}
        onVerEnMapa={verEnMapa}
        onExplorarCampanas={() => {
          const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
          document.getElementById('titulo-actividades')?.scrollIntoView({ behavior: reducido ? 'auto' : 'smooth', block: 'start' })
        }}
      />

      {ficha && (
        <FichaLugar
          ficha={ficha}
          hoy={hoy}
          onCerrar={() => setFicha(null)}
          onVerEnMapa={ficha.aliado && idsEnMapa.has(ficha.aliado.id) ? verEnMapa : undefined}
        />
      )}
    </div>
  )
}
