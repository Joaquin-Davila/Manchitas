import { ArrowRight, Bone, CalendarDays, Footprints, Heart, Scissors, Stethoscope, Ticket, TicketCheck } from 'lucide-react'
import type { ComponentType } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { clasesBotonSecundario } from '../../components/ui/BotonSecundario'
import Huella from '../../components/ui/Huella'
import { cuponesVigentes } from '../../lib/cuponesEjemplo'
import type { CategoriaCupon, Cupon } from '../../lib/cuponesEjemplo'
import { hoyISO } from '../../lib/edad'
import { formatearFecha } from '../../lib/fechas'
import { Aparecer, clasesTarjeta } from '../mascotas/inicio/comun'

type Estilo = { icono: ComponentType<{ size?: number; 'aria-hidden'?: boolean | 'true' | 'false' }>; talon: string; texto: string }

// Talón de color por categoría. No hay logotipos reales de los comercios: se usa el ícono del giro.
const estilos: Record<CategoriaCupon, Estilo> = {
  Veterinaria: { icono: Stethoscope, talon: 'bg-menta-suave', texto: 'text-salud-trazo' },
  Estética: { icono: Scissors, talon: 'bg-coral-suave', texto: 'text-naranja-sombra' },
  Alimento: { icono: Bone, talon: 'bg-amarillo-suave', texto: 'text-cafe' },
  Paseos: { icono: Footprints, talon: 'bg-celeste', texto: 'text-naranja-sombra' },
}

const foco = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naranja-sombra'

/** Cupón con estética de boleto: talón con el giro, línea perforada y cuerpo con la oferta. */
function Voucher({ cupon, hoy, indice }: { cupon: Cupon; hoy: string; indice: number }) {
  const { icono: Icono, talon, texto } = estilos[cupon.categoria]
  const anio = hoy.slice(0, 4)
  return (
    <Aparecer como="li" retraso={40 + indice * 60} className="min-w-0">
      <article
        aria-labelledby={`cupon-${cupon.id}`}
        className={`group relative flex h-full overflow-hidden transition-[transform,box-shadow] duration-300 hover:shadow-elevada motion-safe:hover:-translate-y-0.5 ${clasesTarjeta}`}
      >
        <div className={`relative flex w-24 shrink-0 flex-col items-center justify-center gap-2 p-3 sm:w-28 ${talon} ${texto}`}>
          <span aria-hidden="true" className="absolute -bottom-2 -left-2 rotate-12 text-white/60">
            <Huella size={34} relleno />
          </span>
          <span className="relative flex size-12 items-center justify-center rounded-2xl bg-white/85 shadow-suave">
            <Icono aria-hidden="true" size={24} />
          </span>
          <span className="relative text-center text-[11px] font-semibold leading-tight">{cupon.categoria}</span>
        </div>
        {/* Perforación: muescas en los bordes y línea punteada entre talón y cuerpo. */}
        <span aria-hidden="true" className="absolute left-24 top-0 h-full border-l-2 border-dashed border-borde-calido sm:left-28" />
        <span aria-hidden="true" className="absolute -top-2.5 left-24 size-5 -translate-x-1/2 rounded-full bg-crema sm:left-28" />
        <span aria-hidden="true" className="absolute -bottom-2.5 left-24 size-5 -translate-x-1/2 rounded-full bg-crema sm:left-28" />

        <div className="flex min-w-0 flex-1 flex-col gap-2 p-4 pl-5">
          <p className="text-[13px] font-semibold text-cafe-suave">{cupon.comercio}</p>
          <h3 id={`cupon-${cupon.id}`} className="font-titulo text-lg font-bold leading-snug text-cafe">
            {cupon.oferta}
          </h3>
          <p className="text-[13px] text-cafe-suave">
            <span className="font-semibold text-cafe">Condiciones: </span>
            {cupon.detalle}
          </p>
          <p className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-aviso-fondo px-2.5 py-1 text-[11px] font-semibold text-cafe">
              <CalendarDays aria-hidden="true" size={12} />
              Vigente hasta el {formatearFecha(cupon.vigencia, cupon.vigencia.slice(0, 4) !== anio)}
            </span>
            <span className="rounded-full bg-crema px-2.5 py-1 text-[11px] font-semibold text-cafe-suave">Dato de ejemplo</span>
          </p>
          {/* El canje (código, registro y comisión) es de una fase posterior: el botón queda deshabilitado. */}
          <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
            <button
              type="button"
              disabled
              aria-describedby={`canje-${cupon.id}`}
              className={`${clasesBotonSecundario} h-11! w-auto! gap-1.5 px-4! text-sm! disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <Ticket aria-hidden="true" size={16} />
              Canjear
            </button>
            <span id={`canje-${cupon.id}`} className="text-xs text-cafe-suave">
              El canje llegará en una próxima versión.
            </span>
          </div>
        </div>
      </article>
    </Aparecer>
  )
}

export default function PanelCupones() {
  const [hoy] = useState(() => hoyISO())
  const [vista, setVista] = useState<'disponibles' | 'canjeados'>('disponibles')
  const disponibles = cuponesVigentes(hoy)
  // Sin canje implementado no hay cupones canjeados que mostrar.
  const canjeados: Cupon[] = []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="font-titulo text-xl font-bold text-cafe md:text-2xl">
            Beneficios para{' '}
            <span className="whitespace-nowrap">
              consentirlos{' '}
              <span className="inline-block align-[-3px]">
                <Heart aria-hidden="true" size={22} className="fill-coral-medio text-naranja" />
              </span>
            </span>
          </h3>
          <p className="mt-1 text-[15px] text-cafe-suave">Descubre promociones de nuestros establecimientos aliados.</p>
          <p className="mt-1 text-[13px] text-cafe-suave">Por ahora son ejemplos de comercios aliados.</p>
        </div>
        <div role="group" aria-label="Ver cupones" className="flex w-fit gap-1 rounded-full border border-borde-calido bg-white p-1 shadow-suave">
          {(
            [
              ['disponibles', 'Disponibles', disponibles.length],
              ['canjeados', 'Canjeados', canjeados.length],
            ] as const
          ).map(([id, etiqueta, n]) => (
            <button
              key={id}
              type="button"
              aria-pressed={vista === id}
              onClick={() => setVista(id)}
              className={`flex min-h-11 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold transition-colors ${foco} ${
                vista === id ? 'bg-naranja text-white' : 'text-cafe hover:bg-crema'
              }`}
            >
              {etiqueta}
              <span className={`rounded-full px-1.5 text-[11px] ${vista === id ? 'bg-white/20' : 'bg-crema'}`}>{n}</span>
            </button>
          ))}
        </div>
      </div>

      {vista === 'disponibles' ? (
        disponibles.length === 0 ? (
          <div className={`flex flex-col items-center gap-2 p-8 text-center ${clasesTarjeta}`}>
            <span className="flex size-12 items-center justify-center rounded-full bg-aviso-fondo text-naranja">
              <Ticket aria-hidden="true" size={22} />
            </span>
            <p className="font-titulo text-base font-semibold text-cafe">¡Pronto tendremos más beneficios para tu compañero!</p>
          </div>
        ) : (
          <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 lg:grid-cols-2 lg:gap-5">
            {disponibles.map((c, i) => (
              <Voucher key={c.id} cupon={c} hoy={hoy} indice={i} />
            ))}
          </ul>
        )
      ) : (
        <div className={`flex flex-col items-center gap-2 p-8 text-center ${clasesTarjeta}`}>
          <span className="flex size-12 items-center justify-center rounded-full bg-menta-suave text-salud-trazo">
            <TicketCheck aria-hidden="true" size={22} />
          </span>
          <p className="font-titulo text-base font-semibold text-cafe">Aún no has canjeado cupones</p>
          <p className="max-w-sm text-sm text-cafe-suave">Cuando el canje esté disponible, aquí guardaremos tu historial de beneficios usados.</p>
        </div>
      )}

      <div className={`flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between ${clasesTarjeta}`}>
        <p className="text-sm text-cafe">
          <span className="font-semibold">¿Buscas dónde atender a tu mascota?</span>{' '}
          <span className="text-cafe-suave">Conoce a los establecimientos aliados en Comunidad.</span>
        </p>
        <Link to="/comunidad" className={`${clasesBotonSecundario} h-11! shrink-0 gap-1.5 sm:w-auto`}>
          Descubrir aliados
          <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </div>
    </div>
  )
}
