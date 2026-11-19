import { CalendarDays, Clock, MapPin, Navigation, Star, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import BotonSecundario, { clasesBotonSecundario } from '../../components/ui/BotonSecundario'
import { enlaceComoLlegar } from '../../lib/campanasEjemplo'
import type { Aliado, Campana, EstadoCampana } from '../../lib/campanasEjemplo'
import { formatearFecha } from '../../lib/fechas'
import { EtiquetaEstado, EtiquetaTipo, ImagenRepresentativa } from './piezas'

export type Ficha =
  | { tipo: 'aliado'; aliado: Aliado; campanas: Campana[] }
  | { tipo: 'campana'; campana: Campana; aliado?: Aliado; estado: EstadoCampana }

type Props = {
  ficha: Ficha
  hoy: string
  onCerrar: () => void
  /** Solo si el lugar está en el mapa (con los filtros actuales). */
  onVerEnMapa?: (aliadoId: string) => void
}

function Dato({ icono, children }: { icono: ReactNode; children: ReactNode }) {
  return (
    <p className="flex items-start gap-2 text-sm text-cafe">
      <span className="mt-0.5 shrink-0 text-cafe-suave">{icono}</span>
      <span>{children}</span>
    </p>
  )
}

// <dialog> nativo: el navegador atrapa el foco, cierra con Esc y devuelve el foco al botón que lo abrió.
export default function FichaLugar({ ficha, hoy, onCerrar, onVerEnMapa }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialogo = ref.current
    if (dialogo && !dialogo.open) dialogo.showModal()
  }, [])

  const anio = hoy.slice(0, 4)
  const aliado = ficha.aliado
  const titulo = ficha.tipo === 'aliado' ? ficha.aliado.nombre : ficha.campana.titulo
  const tipo = ficha.tipo === 'aliado' ? ficha.aliado.tipo : ficha.campana.tipo

  function verEnMapa(id: string) {
    ref.current?.close()
    onVerEnMapa?.(id)
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby="ficha-lugar-titulo"
      onClose={onCerrar}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      className="m-auto max-h-[90dvh] w-[calc(100%-32px)] max-w-[520px] overflow-y-auto overscroll-contain rounded-[28px] bg-white p-0 text-cafe shadow-elevada backdrop:bg-cafe/55"
    >
      <div className="relative">
        <ImagenRepresentativa tipo={tipo} className="h-40" />
        <button
          type="button"
          aria-label="Cerrar"
          onClick={() => ref.current?.close()}
          className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-full bg-white/90 text-cafe shadow-suave hover:bg-white"
        >
          <X aria-hidden="true" size={22} />
        </button>
      </div>

      <div className="flex flex-col gap-4 p-5 md:p-6">
        <div>
          <p className="flex flex-wrap gap-1.5">
            <EtiquetaTipo tipo={tipo} />
            {ficha.tipo === 'campana' && <EtiquetaEstado estado={ficha.estado} />}
            <span className="rounded-full bg-crema px-2.5 py-1 text-[11px] font-semibold text-cafe-suave">Dato de ejemplo</span>
          </p>
          <h2 id="ficha-lugar-titulo" className="mt-2 font-titulo text-2xl font-bold leading-tight">
            {titulo}
          </h2>
        </div>

        {ficha.tipo === 'campana' ? (
          <div className="flex flex-col gap-2">
            <Dato icono={<CalendarDays aria-hidden="true" size={17} />}>
              {formatearFecha(ficha.campana.fecha, ficha.campana.fecha.slice(0, 4) !== anio)}
            </Dato>
            <Dato icono={<Clock aria-hidden="true" size={17} />}>{ficha.campana.horario}</Dato>
            <Dato icono={<MapPin aria-hidden="true" size={17} />}>
              {ficha.campana.lugar}
              {aliado && <span className="text-cafe-suave"> · {aliado.zona}</span>}
            </Dato>
            {aliado && <p className="text-[13px] text-cafe-suave">Organiza: {aliado.nombre}</p>}
            <p className="text-[13px] text-cafe-suave">
              {ficha.campana.tipo === 'Vacunación'
                ? 'Lleva la cartilla de tu mascota para registrar la vacuna.'
                : 'Pregunta al organizador por los requisitos (ayuno, edad mínima y cupo).'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Dato icono={<MapPin aria-hidden="true" size={17} />}>{ficha.aliado.zona}</Dato>
            <Dato icono={<Clock aria-hidden="true" size={17} />}>{ficha.aliado.horario}</Dato>
            <div className="flex flex-wrap gap-1.5">
              {ficha.aliado.servicios.map((s) => (
                <EtiquetaTipo key={s} tipo={s} />
              ))}
            </div>
            {ficha.campanas.length > 0 && (
              <div className="mt-1 rounded-2xl bg-crema-clara p-3">
                <p className="text-[13px] font-semibold text-cafe-suave">Próximas campañas aquí</p>
                <ul className="m-0 mt-1 flex list-none flex-col gap-1 p-0 text-sm">
                  {ficha.campanas.map((c) => (
                    <li key={c.id}>
                      <span className="font-semibold">{formatearFecha(c.fecha, c.fecha.slice(0, 4) !== anio)}</span> ·{' '}
                      {c.titulo}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preparación visual: las reseñas necesitan tablas, RLS y límites en Supabase. */}
            <section aria-labelledby="ficha-resenas" className="mt-1 rounded-2xl border border-dashed border-borde-calido p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 id="ficha-resenas" className="text-sm font-semibold">
                  Reseñas
                </h3>
                <span className="rounded-full bg-aviso-fondo px-2 py-0.5 text-[11px] font-semibold text-cafe">
                  Pendiente de integración
                </span>
              </div>
              <p className="mt-1 flex items-center gap-1 text-[13px] text-cafe-suave">
                <Star aria-hidden="true" size={14} />
                Todavía no hay reseñas. El promedio aparecerá cuando haya suficientes opiniones reales.
              </p>
            </section>
          </div>
        )}

        <div className="flex flex-col gap-2.5 sm:flex-row">
          {aliado && onVerEnMapa && (
            <BotonSecundario onClick={() => verEnMapa(aliado.id)} className="gap-2 sm:flex-1">
              <MapPin aria-hidden="true" size={18} />
              Ver en el mapa
            </BotonSecundario>
          )}
          {aliado && (
            <a
              href={enlaceComoLlegar(aliado)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${clasesBotonSecundario} gap-2 sm:flex-1`}
            >
              <Navigation aria-hidden="true" size={18} />
              Cómo llegar
              <span className="sr-only">(se abre en otra pestaña)</span>
            </a>
          )}
        </div>
        {!aliado && (
          <p className="text-[13px] text-cafe-suave">Esta campaña no tiene ubicación en el mapa; consulta el lugar indicado.</p>
        )}
      </div>
    </dialog>
  )
}
