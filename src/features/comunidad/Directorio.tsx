import { ArrowRight, Clock, HeartHandshake, MapPin, MessageSquareText, ShieldCheck, Star } from 'lucide-react'
import { clasesBotonSecundario } from '../../components/ui/BotonSecundario'
import type { Aliado, Campana } from '../../lib/campanasEjemplo'
import { campanasDeAliado } from '../../lib/campanasEjemplo'
import { formatearFecha } from '../../lib/fechas'
import { Aparecer, clasesElevar, clasesTarjeta } from '../mascotas/inicio/comun'
import ManchitasSolidario from './ManchitasSolidario'
import { EtiquetaTipo, FotoAliado, TituloBloque, clasesFocoComunidad } from './piezas'

type Props = {
  aliados: Aliado[]
  campanas: Campana[]
  hoy: string
  onVerEstablecimiento: (id: string) => void
  onVerEnMapa: (id: string) => void
  /** Lleva a "Próximas actividades" (botón "Explorar campañas" de Manchitas Solidario). */
  onExplorarCampanas: () => void
}

function TarjetaEstablecimiento({
  aliado,
  proxima,
  hoy,
  indice,
  onVer,
  onMapa,
}: {
  aliado: Aliado
  proxima?: Campana
  hoy: string
  indice: number
  onVer: () => void
  onMapa: () => void
}) {
  return (
    <Aparecer como="li" retraso={60 + indice * 60} className="min-w-0">
      <article
        aria-labelledby={`aliado-${aliado.id}`}
        className={`group flex h-full flex-col overflow-hidden ${clasesTarjeta} ${clasesElevar}`}
      >
        <FotoAliado tipo={aliado.tipo} foto={aliado.foto} alt={aliado.fotoAlt} className="aspect-[16/9]" />
        <div className="flex flex-1 flex-col gap-2.5 p-4">
          <p className="flex flex-wrap gap-1.5">
            <EtiquetaTipo tipo={aliado.tipo} />
          </p>
          <h3 id={`aliado-${aliado.id}`} className="font-titulo text-lg font-bold leading-snug text-cafe">
            {aliado.nombre}
          </h3>
          <div className="flex flex-col gap-1 text-[13px] text-cafe-suave">
            <p className="flex items-center gap-1.5">
              <MapPin aria-hidden="true" size={14} className="shrink-0" />
              {aliado.zona}
            </p>
            <p className="flex items-center gap-1.5">
              <Clock aria-hidden="true" size={14} className="shrink-0" />
              {aliado.horario}
            </p>
          </div>
          <p className="text-[13px] text-cafe">
            <span className="text-cafe-suave">Servicios: </span>
            {aliado.servicios.join(' y ').toLowerCase()}
          </p>
          {proxima && (
            <p className="rounded-xl bg-crema-clara px-3 py-2 text-[13px] text-cafe">
              <span className="font-semibold">Próxima campaña:</span>{' '}
              {formatearFecha(proxima.fecha, proxima.fecha.slice(0, 4) !== hoy.slice(0, 4))}
            </p>
          )}
          <div className="mt-auto flex items-center gap-2 pt-1">
            <button type="button" onClick={onVer} className={`${clasesBotonSecundario} h-11! flex-1 gap-1.5 text-sm!`}>
              Ver establecimiento
              <ArrowRight aria-hidden="true" size={16} className="transition-transform motion-safe:group-hover:translate-x-1" />
            </button>
            <button
              type="button"
              onClick={onMapa}
              aria-label={`Ver ${aliado.nombre} en el mapa`}
              title="Ver en el mapa"
              className={`flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-barra-borde bg-white text-naranja hover:bg-crema ${clasesFocoComunidad}`}
            >
              <MapPin aria-hidden="true" size={18} />
            </button>
          </div>
        </div>
      </article>
    </Aparecer>
  )
}

/** Vista previa de reseñas: diseño listo, sin backend. El formulario está deshabilitado a propósito. */
function ResenasPendientes() {
  const reglas = [
    { icono: ShieldCheck, texto: 'Solo con cuenta iniciada y una reseña por establecimiento.' },
    { icono: Clock, texto: 'Límite de publicaciones para evitar spam.' },
    { icono: MessageSquareText, texto: 'Se podrá reportar una reseña inapropiada; sin datos personales.' },
    { icono: Star, texto: 'El promedio aparece solo con suficientes reseñas reales.' },
  ]
  return (
    <section
      aria-labelledby="titulo-resenas"
      className="grid gap-5 rounded-[24px] border border-dashed border-borde-calido bg-white/60 p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:p-6"
    >
      <div>
        <p className="inline-flex rounded-full bg-aviso-fondo px-2.5 py-1 text-[11px] font-semibold text-cafe">
          Pendiente de integración
        </p>
        <h3 id="titulo-resenas" className="mt-2 font-titulo text-lg font-bold text-cafe">
          Reseñas y calificaciones
        </h3>
        <p className="mt-1 text-sm text-cafe-suave">
          Pronto podrás calificar de 1 a 5 estrellas y comentar tu experiencia. Las reseñas mostrarán tu alias
          público y la fecha; no se presentarán como verificadas mientras no exista una forma de comprobarlas.
        </p>
        <ul className="m-0 mt-3 flex list-none flex-col gap-2 p-0">
          {reglas.map(({ icono: Icono, texto }) => (
            <li key={texto} className="flex items-start gap-2 text-[13px] text-cafe">
              <Icono aria-hidden="true" size={15} className="mt-0.5 shrink-0 text-salud-trazo" />
              {texto}
            </li>
          ))}
        </ul>
      </div>

      <form aria-labelledby="titulo-formulario-resena" aria-describedby="nota-formulario-resena" onSubmit={(e) => e.preventDefault()}>
        <fieldset disabled className="flex flex-col gap-3 rounded-2xl bg-crema-clara p-4 opacity-80">
          <legend id="titulo-formulario-resena" className="sr-only">
            Vista previa del formulario de reseña
          </legend>
          <p className="text-sm font-semibold text-cafe">Tu calificación</p>
          <div className="flex gap-1 text-borde-calido" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} size={26} className="fill-current" />
            ))}
          </div>
          <label htmlFor="resena-comentario" className="text-sm font-semibold text-cafe">
            Comentario
          </label>
          <textarea
            id="resena-comentario"
            rows={3}
            placeholder="Cuéntanos cómo te atendieron…"
            className="w-full resize-none rounded-xl border border-borde-calido bg-white p-3 text-sm"
          />
          <button type="submit" className={`${clasesBotonSecundario} h-11!`}>
            Publicar reseña
          </button>
        </fieldset>
        <p id="nota-formulario-resena" className="mt-2 text-xs text-cafe-suave">
          Vista previa deshabilitada: falta crear las tablas, permisos (RLS) y límites en Supabase.
        </p>
      </form>
    </section>
  )
}

export default function Directorio({ aliados, campanas, hoy, onVerEstablecimiento, onVerEnMapa, onExplorarCampanas }: Props) {
  return (
    <>
      <section aria-labelledby="titulo-directorio">
        <TituloBloque
          id="titulo-directorio"
          titulo="Veterinarias y aliados que cuidan"
          subtitulo="Conecta con establecimientos que ayudan a cuidar a tus mascotas en Hermosillo."
          derecha={
            <span className="rounded-full bg-crema px-3 py-1 text-xs font-semibold text-cafe-suave">
              Establecimientos de ejemplo
            </span>
          }
        />
        {aliados.length === 0 ? (
          <div className={`flex flex-col items-center gap-2 p-8 text-center ${clasesTarjeta}`}>
            <span className="flex size-14 items-center justify-center rounded-full bg-menta-suave text-salud-trazo">
              <HeartHandshake aria-hidden="true" size={26} />
            </span>
            <p className="font-titulo text-lg font-semibold text-cafe">
              Estamos conectando con más aliados para cuidar a las mascotas de Hermosillo.
            </p>
            <p className="text-sm text-cafe-suave">Prueba con otra búsqueda o quita los filtros.</p>
          </div>
        ) : (
          <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {aliados.map((a, i) => (
              <TarjetaEstablecimiento
                key={a.id}
                aliado={a}
                proxima={campanasDeAliado(campanas, a.id)[0]}
                hoy={hoy}
                indice={i}
                onVer={() => onVerEstablecimiento(a.id)}
                onMapa={() => onVerEnMapa(a.id)}
              />
            ))}
          </ul>
        )}
      </section>

      <ResenasPendientes />

      <ManchitasSolidario onExplorarCampanas={onExplorarCampanas} />
    </>
  )
}
