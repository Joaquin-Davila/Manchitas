import { Clock, MapPin, Stethoscope } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarEstablecimientos, NOMBRE_TIPO } from '../../lib/directorio'
import type { Establecimiento, TipoEstablecimiento } from '../../lib/directorio'
import { useCarga } from '../../lib/useCarga'
import { clasesElevar, clasesFoco, clasesTarjeta } from '../mascotas/inicio/comun'
import { Buscador, Chip, FilaChips } from '../comunidad/piezas'
import { Estrellas } from './Estrellas'

type Filtro = 'todos' | '24h' | TipoEstablecimiento

const FILTROS: { id: Filtro; etiqueta: string }[] = [
  { id: 'todos', etiqueta: 'Todos' },
  { id: '24h', etiqueta: 'Abiertos 24 h' },
  { id: 'veterinaria', etiqueta: 'Veterinarias' },
  { id: 'estetica', etiqueta: 'Estéticas' },
  { id: 'tienda', etiqueta: 'Tiendas' },
  { id: 'albergue', etiqueta: 'Albergues' },
]

function normalizar(t: string): string {
  return t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}

function coincide(e: Establecimiento, filtro: Filtro, q: string): boolean {
  const pasaFiltro = filtro === 'todos' || (filtro === '24h' ? e.abierto24h : e.tipo === filtro)
  return pasaFiltro && (!q || normalizar(`${e.nombre} ${e.zona} ${e.servicios.join(' ')}`).includes(q))
}

function Tarjeta({ e }: { e: Establecimiento }) {
  return (
    <li>
      <Link
        to={`/comunidad/veterinarias/${e.id}`}
        className={`flex h-full flex-col overflow-hidden ${clasesTarjeta} ${clasesElevar} ${clasesFoco}`}
      >
        <div className="relative h-36 bg-foto-vacia">
          {e.foto ? (
            <img src={e.foto} alt="" loading="lazy" width={640} height={400} className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center text-huella">
              <Stethoscope aria-hidden="true" size={44} />
            </span>
          )}
          {e.abierto24h && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-salud-trazo shadow-suave">
              <Clock aria-hidden="true" size={12} />
              24 horas
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div>
            <p className="text-[13px] font-semibold text-cafe-suave">{NOMBRE_TIPO[e.tipo]}</p>
            <h3 className="font-titulo text-lg font-bold leading-snug text-cafe">{e.nombre}</h3>
          </div>
          <p className="flex items-center gap-2 text-sm text-cafe-suave">
            {e.totalResenas > 0 ? (
              <>
                <Estrellas valor={e.calificacion} />
                <span>
                  {e.calificacion.toFixed(1)} · {e.totalResenas} {e.totalResenas === 1 ? 'reseña' : 'reseñas'}
                </span>
              </>
            ) : (
              <span>Aún sin reseñas</span>
            )}
          </p>
          <p className="flex items-center gap-1.5 text-sm text-cafe-suave">
            <MapPin aria-hidden="true" size={14} className="shrink-0" />
            {e.zona}
          </p>
          <ul className="m-0 mt-auto flex list-none flex-wrap gap-1.5 p-0 pt-1">
            {e.servicios.slice(0, 3).map((s) => (
              <li key={s} className="rounded-full bg-aviso-fondo px-2.5 py-1 text-[12px] font-semibold text-cafe">
                {s}
              </li>
            ))}
          </ul>
          {e.demo && <p className="text-[11px] font-semibold text-cafe-suave">Establecimiento de ejemplo</p>}
        </div>
      </Link>
    </li>
  )
}

/** Directorio de veterinarias y comercios aliados, con calificación de la comunidad. */
export default function ListaVeterinarias() {
  const { datos, cargando, error, recargar } = useCarga('directorio', listarEstablecimientos)
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('todos')

  const visibles = useMemo(() => {
    const q = normalizar(busqueda)
    return (datos ?? [])
      .filter((e) => coincide(e, filtro, q))
      .sort((a, b) => b.calificacion - a.calificacion || a.nombre.localeCompare(b.nombre))
  }, [datos, busqueda, filtro])

  return (
    <div className="flex flex-col gap-5">
      <Buscador
        id="buscar-veterinarias"
        etiqueta="Buscar veterinarias y comercios"
        valor={busqueda}
        onCambiar={setBusqueda}
        placeholder="Busca por nombre, zona o servicio"
      />
      <FilaChips etiqueta="Filtrar por tipo">
        {FILTROS.map(({ id, etiqueta }) => (
          <Chip key={id} activo={filtro === id} onClick={() => setFiltro(id)}>
            {etiqueta}
          </Chip>
        ))}
      </FilaChips>

      {cargando ? (
        <p role="status" className="text-sm text-cafe-suave">
          Cargando veterinarias…
        </p>
      ) : error ? (
        <div role="alert" className={`flex flex-col items-start gap-3 p-5 ${clasesTarjeta}`}>
          <p className="text-sm">{error}</p>
          <button type="button" onClick={recargar} className="min-h-11 font-semibold text-naranja-sombra underline">
            Reintentar
          </button>
        </div>
      ) : visibles.length === 0 ? (
        <p role="status" className={`p-5 text-sm text-cafe-suave ${clasesTarjeta}`}>
          {datos && datos.length === 0
            ? 'Todavía no hay establecimientos registrados.'
            : 'No encontramos resultados con esos filtros. Prueba con otra búsqueda.'}
        </p>
      ) : (
        <>
          <p role="status" className="text-sm text-cafe-suave">
            {visibles.length} {visibles.length === 1 ? 'resultado' : 'resultados'}, de mejor a menor calificación
          </p>
          <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 lg:grid-cols-3">
            {visibles.map((e) => (
              <Tarjeta key={e.id} e={e} />
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
