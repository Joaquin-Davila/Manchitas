import { BadgeCheck, BadgePercent, MapPin, Star, Stethoscope } from 'lucide-react'
import BotonSecundario from '../../../components/ui/BotonSecundario'
import { HuellasDecorativas, TituloSeccion, clasesTarjeta } from './comun'

/**
 * Veterinaria destacada del futuro directorio. Todavía no hay una fuente real (los aliados de
 * Comunidad son datos de ejemplo), así que Inicio la recibe vacía y muestra el estado de
 * descubrimiento. Cada campo opcional solo se pinta si existe de verdad.
 */
export type AliadoDestacado = {
  nombre: string
  zona: string
  servicios: string[]
  fotoUrl?: string
  /** Solo con reseñas reales. */
  calificacion?: { promedio: number; resenas: number }
  /** Solo si está registrada y autorizada. */
  promocion?: string
  /** Solo con convenio confirmado. */
  convenio?: boolean
}

function TarjetaAliado({ aliado }: { aliado: AliadoDestacado }) {
  return (
    <div className="grid grid-cols-1 overflow-hidden md:grid-cols-[280px_minmax(0,1fr)]">
      {aliado.fotoUrl ? (
        <img src={aliado.fotoUrl} alt={`Fachada de ${aliado.nombre}`} loading="lazy" className="aspect-[4/3] w-full object-cover md:aspect-auto md:h-full" />
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center bg-menta-suave text-salud-trazo md:aspect-auto">
          <Stethoscope aria-hidden="true" size={48} />
        </div>
      )}
      <div className="flex flex-col gap-2 p-5 md:p-6">
        {aliado.convenio && (
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-amarillo-suave px-2.5 py-1 text-xs font-semibold text-cafe">
            <BadgeCheck aria-hidden="true" size={14} />
            Aliado Manchitas
          </span>
        )}
        <p className="font-titulo text-xl font-bold text-cafe">{aliado.nombre}</p>
        <p className="flex items-center gap-1 text-sm text-cafe-suave">
          <MapPin aria-hidden="true" size={15} />
          {aliado.zona}
        </p>
        <p className="text-sm text-cafe">{aliado.servicios.join(' · ')}</p>
        {aliado.calificacion && (
          <p className="flex items-center gap-1 text-sm font-semibold text-cafe">
            <Star aria-hidden="true" size={15} className="fill-amarillo text-amarillo-borde" />
            {aliado.calificacion.promedio.toFixed(1)} ({aliado.calificacion.resenas} reseñas)
          </p>
        )}
        {aliado.promocion && (
          <p className="flex items-center gap-1.5 rounded-xl bg-coral-suave px-3 py-2 text-sm font-semibold text-cafe">
            <BadgePercent aria-hidden="true" size={16} className="text-naranja" />
            {aliado.promocion}
          </p>
        )}
      </div>
    </div>
  )
}

function Descubrimiento() {
  return (
    <div className="relative flex flex-col items-start gap-4 overflow-hidden p-5 md:p-7 lg:flex-row lg:items-center lg:gap-6">
      <HuellasDecorativas
        className="text-huella/70"
        huellas={[
          { top: '-14px', right: '6%', size: 76, giro: 22 },
          { bottom: '-10px', right: '28%', size: 40, giro: -14, retraso: 1500 },
        ]}
      />
      <span className="relative flex size-20 shrink-0 items-center justify-center rounded-[26px] bg-menta-suave text-salud-trazo">
        <Stethoscope aria-hidden="true" size={38} />
      </span>
      <div className="relative flex-1">
        <p className="font-titulo text-lg font-bold text-cafe">Pronto encontrarás más aliados para cuidar a tu mascota</p>
        <p className="mt-1 text-sm text-cafe-suave">
          Estamos sumando veterinarias de Hermosillo. Cuando haya un convenio confirmado, aquí verás sus
          servicios, reseñas reales y promociones autorizadas.
        </p>
      </div>
      <BotonSecundario to="/comunidad" className="relative md:w-fit lg:shrink-0">
        Explorar veterinarias
      </BotonSecundario>
    </div>
  )
}

export default function Aliados({ destacado }: { destacado?: AliadoDestacado }) {
  return (
    <section aria-labelledby="titulo-aliados">
      <TituloSeccion
        id="titulo-aliados"
        titulo="Aliados que cuidan"
        subtitulo="Encuentra atención y promociones para tu mejor amigo en Hermosillo."
      />
      <div className={`overflow-hidden ${clasesTarjeta}`}>
        {destacado ? (
          <>
            <TarjetaAliado aliado={destacado} />
            <div className="border-t border-borde-calido p-4">
              <BotonSecundario to="/comunidad" className="md:ml-auto md:w-fit">
                Explorar veterinarias
              </BotonSecundario>
            </div>
          </>
        ) : (
          <Descubrimiento />
        )}
      </div>
    </section>
  )
}
