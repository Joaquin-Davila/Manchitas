import { CalendarClock, HeartPulse, History, Syringe } from 'lucide-react'
import type { ReactNode } from 'react'
import BotonSecundario from '../../../components/ui/BotonSecundario'
import { formatearFecha } from '../../../lib/fechas'
import type { Cartilla } from '../../../types/cartilla'
import { clasesTarjeta } from './comun'

type Props = {
  /** Nombre de la mascota principal; sin él no hay cartilla que resumir. */
  nombre?: string
  cartilla?: Cartilla
  cargando: boolean
  error: boolean
  hoy: string
}

function Indicador({
  icono,
  fondo,
  etiqueta,
  valor,
  detalle,
}: {
  icono: ReactNode
  fondo: string
  etiqueta: string
  valor: ReactNode
  detalle?: string
}) {
  return (
    <li className="flex items-center gap-3 rounded-2xl bg-crema-clara p-3">
      <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${fondo}`}>{icono}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-cafe-suave">{etiqueta}</p>
        {detalle && <p className="truncate text-sm text-cafe">{detalle}</p>}
      </div>
      <p className="shrink-0 font-titulo text-2xl font-bold text-cafe">{valor}</p>
    </li>
  )
}

/** "2026-10-12" → "12 oct" (año aparte si no es el actual). */
function fechaCorta(iso: string, hoy: string) {
  const [, , dia] = iso.split('-')
  const mes = formatearFecha(iso, false).split(' de ')[1].slice(0, 3)
  return (
    <>
      {Number(dia)} {mes}
      {iso.slice(0, 4) !== hoy.slice(0, 4) && <span className="ml-1 text-sm font-semibold">{iso.slice(0, 4)}</span>}
    </>
  )
}

export default function ResumenSalud({ nombre, cartilla, cargando, error, hoy }: Props) {
  const vacunas = cartilla?.vacunas ?? []
  const proxima = cartilla?.proxima
  // Las vacunas llegan ordenadas de la más reciente a la más antigua.
  const ultima = vacunas[0]
  const vacia = !!cartilla && vacunas.length === 0 && !proxima

  return (
    <section aria-labelledby="titulo-salud" className={`flex h-full flex-col gap-4 p-5 md:p-6 ${clasesTarjeta}`}>
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-full bg-coral-suave text-naranja">
          <HeartPulse aria-hidden="true" size={22} />
        </span>
        <div>
          <h2 id="titulo-salud" className="font-titulo text-xl font-bold text-cafe">
            Su cuidado importa
          </h2>
          {nombre && <p className="text-sm text-cafe-suave">Resumen de la cartilla de {nombre}</p>}
        </div>
      </div>

      {!nombre ? (
        <p className="flex-1 rounded-2xl bg-crema-clara p-4 text-sm text-cafe-suave">
          Cuando registres a tu mascota, aquí verás sus vacunas y su próximo cuidado.
        </p>
      ) : cargando ? (
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-[68px] animate-pulse rounded-2xl bg-crema-clara" />
          ))}
        </ul>
      ) : error ? (
        <p role="alert" className="flex-1 rounded-2xl bg-crema-clara p-4 text-sm">
          No pudimos cargar la cartilla. Revisa tu conexión e inténtalo de nuevo.
        </p>
      ) : vacia ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl bg-menta-suave p-5 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-white text-salud-trazo">
            <Syringe aria-hidden="true" size={26} />
          </span>
          <p className="font-titulo text-lg font-semibold text-cafe">Su cartilla está esperando</p>
          <p className="text-sm text-cafe-suave">
            Registra la primera vacuna de {nombre} y te recordaremos la siguiente.
          </p>
        </div>
      ) : (
        <ul className="m-0 flex flex-1 list-none flex-col gap-2.5 p-0">
          <Indicador
            icono={<Syringe aria-hidden="true" size={22} />}
            fondo="bg-menta-suave text-salud-trazo"
            etiqueta="Vacunas registradas"
            valor={vacunas.length}
          />
          <Indicador
            icono={<CalendarClock aria-hidden="true" size={22} />}
            fondo="bg-aviso-fondo text-naranja"
            etiqueta="Próximo cuidado"
            valor={proxima ? 1 : 0}
            detalle={
              !proxima
                ? 'Nada pendiente'
                : cartilla?.recordatorio === false
                  ? `${proxima.nombre} · recordatorio apagado`
                  : `${proxima.nombre} · ${formatearFecha(proxima.fecha, proxima.fecha.slice(0, 4) !== hoy.slice(0, 4))}${proxima.fecha < hoy ? ' · ya pasó' : ''}`
            }
          />
          <Indicador
            icono={<History aria-hidden="true" size={22} />}
            fondo="bg-amarillo-suave text-cafe"
            etiqueta="Última vacuna registrada"
            detalle={ultima?.nombre}
            valor={ultima ? fechaCorta(ultima.fecha, hoy) : '—'}
          />
        </ul>
      )}

      {nombre && !cargando && !error && (
        <BotonSecundario to="/salud">{vacia ? 'Completar cartilla' : 'Consultar cartilla'}</BotonSecundario>
      )}
    </section>
  )
}
