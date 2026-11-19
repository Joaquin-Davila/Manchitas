import { ArrowRight, Plus, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import BotonPrincipal from '../../../components/ui/BotonPrincipal'
import Huella from '../../../components/ui/Huella'
import { estadoMascota } from '../../../lib/datosEjemplo'
import { textoEdad } from '../../../lib/edad'
import { NOMBRE_ESPECIE } from '../../../lib/especies'
import type { Mascota } from '../../../types/mascota'
import { HuellasDecorativas, clasesElevar, clasesFoco, clasesTarjeta } from './comun'


/** Foto guardada de la mascota o, si no tiene, el hueco cálido con huella (nunca una foto genérica). */
function FotoMascota({ mascota, className }: { mascota: Mascota; className: string }) {
  return mascota.fotoUrl ? (
    <img src={mascota.fotoUrl} alt={`Foto de ${mascota.nombre}`} className={`object-cover ${className}`} />
  ) : (
    <div className={`flex items-center justify-center bg-foto-vacia text-huella ${className}`}>
      <Huella aria-hidden="true" size={72} relleno />
    </div>
  )
}

export function HeroMascota({ mascotas }: { mascotas: Mascota[] }) {
  const [principal, ...otras] = mascotas
  const detalle = [NOMBRE_ESPECIE[principal.especie], principal.raza, textoEdad(principal.nacimiento, undefined, principal.especie)]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="flex flex-col gap-3">
      <Link
        to={`/mascotas/${principal.id}`}
        aria-label={`Ver perfil y cartilla de ${principal.nombre}`}
        className={`group relative grid grid-cols-1 overflow-hidden md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] ${clasesTarjeta} ${clasesElevar} ${clasesFoco}`}
      >
        <div className="relative overflow-hidden">
          <FotoMascota
            mascota={principal}
            className="aspect-[4/3] w-full transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.03] md:aspect-auto md:h-full md:min-h-[320px]"
          />
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-cafe shadow-suave">
            <Huella aria-hidden="true" size={14} relleno />
            Mi compañero
          </span>
        </div>

        <div className="relative flex flex-col justify-center gap-3 bg-amarillo-suave p-5 md:p-7">
          <HuellasDecorativas
            className="text-huella"
            huellas={[
              { top: '-10px', right: '-8px', size: 70, giro: 18 },
              { bottom: '18px', right: '22px', size: 30, giro: -12, retraso: 1200 },
            ]}
          />
          <div className="relative">
            <p className="font-titulo text-[32px] font-bold leading-tight text-cafe md:text-[38px]">
              {principal.nombre}
            </p>
            <p className="mt-1 text-[15px] text-cafe-suave">{detalle}</p>
          </div>
          <p className="relative flex flex-wrap gap-2 text-xs font-semibold">
            <span className="inline-flex items-center gap-1 rounded-full bg-menta-suave px-2.5 py-1 text-salud-trazo">
              <ShieldCheck aria-hidden="true" size={14} />
              {estadoMascota}
            </span>
            <span className="rounded-full bg-white/80 px-2.5 py-1 text-salud-trazo">Folio {principal.folio}</span>
          </p>
          <p className="relative font-titulo text-lg font-semibold text-cafe">Tu mejor amigo merece lo mejor</p>
          {/* La tarjeta completa es el enlace; esto solo se ve como botón. */}
          <span className="relative mt-1 flex h-[50px] items-center justify-center gap-2 rounded-boton bg-naranja px-6 text-[15px] font-semibold text-white shadow-boton transition-colors group-hover:bg-naranja-sombra md:w-fit">
            Ver perfil y cartilla
            <ArrowRight aria-hidden="true" size={18} className="transition-transform motion-safe:group-hover:translate-x-1" />
          </span>
        </div>
      </Link>

      <nav aria-label="Tus mascotas" className="flex flex-wrap items-center gap-2">
        {otras.length > 0 && <span className="text-sm text-cafe-suave">También en casa:</span>}
        {otras.slice(0, 4).map((m) => (
          <Link
            key={m.id}
            to={`/mascotas/${m.id}`}
            className={`flex min-h-11 items-center gap-2 rounded-full border border-borde-calido bg-white py-1 pl-1 pr-3.5 text-sm font-semibold text-cafe transition-colors hover:bg-amarillo-suave ${clasesFoco}`}
          >
            <FotoMascota mascota={m} className="size-9 shrink-0 rounded-full [&_svg]:size-5" />
            {m.nombre}
          </Link>
        ))}
        <Link
          to={otras.length > 0 ? '/mascotas' : '/mascotas/nueva'}
          className={`flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-naranja hover:bg-amarillo-suave ${clasesFoco}`}
        >
          {otras.length > 0 ? (
            <>
              Ver todas ({mascotas.length})
              <ArrowRight aria-hidden="true" size={16} />
            </>
          ) : (
            <>
              <Plus aria-hidden="true" size={16} />
              Registrar otra mascota
            </>
          )}
        </Link>
      </nav>
    </div>
  )
}

export function HeroSinMascota() {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-borde-calido bg-amarillo-suave p-6 text-center shadow-suave md:p-10">
      <HuellasDecorativas
        huellas={[
          { top: '14px', left: '18px', size: 44, giro: -20 },
          { bottom: '20px', right: '26px', size: 60, giro: 16, retraso: 900 },
          { top: '40%', right: '12%', size: 26, giro: 30, retraso: 1800 },
        ]}
      />
      <div className="relative mx-auto flex max-w-sm flex-col items-center gap-3">
        <span className="flex size-24 items-center justify-center rounded-full bg-white text-huella shadow-suave">
          <Huella aria-hidden="true" size={52} relleno />
        </span>
        <p className="font-titulo text-2xl font-bold text-cafe">Aún no registras a tu mascota</p>
        <p className="text-[15px] text-cafe-suave">
          Dale un ID de collar y un QR para que, si alguien la encuentra, pueda avisarte.
        </p>
        <BotonPrincipal to="/mascotas/nueva" className="mt-1 md:w-fit">
          Registrar a mi mascota
        </BotonPrincipal>
      </div>
    </div>
  )
}

export function HeroCargando() {
  return (
    <div className={`grid grid-cols-1 overflow-hidden md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] ${clasesTarjeta}`} aria-hidden="true">
      <div className="aspect-[4/3] animate-pulse bg-foto-vacia/70 md:aspect-auto md:min-h-[320px]" />
      <div className="flex flex-col gap-3 bg-amarillo-suave p-6">
        <div className="h-9 w-2/3 animate-pulse rounded-full bg-white/70" />
        <div className="h-4 w-1/2 animate-pulse rounded-full bg-white/70" />
        <div className="mt-4 h-[50px] w-full animate-pulse rounded-boton bg-white/70" />
      </div>
    </div>
  )
}
