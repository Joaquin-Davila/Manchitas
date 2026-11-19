import { pesos, porcentaje } from '../../lib/solidario'

/** Avance de una campaña. Solo cuenta lo confirmado: nunca incluye aportaciones de demostración pendientes. */
export default function BarraProgreso({
  recaudado,
  meta,
  grande = false,
}: {
  recaudado: number
  meta: number
  grande?: boolean
}) {
  const pct = porcentaje(recaudado, meta)
  return (
    <div>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Avance de la campaña: ${pct} por ciento`}
        className={`overflow-hidden rounded-full bg-crema ${grande ? 'h-3.5' : 'h-2.5'}`}
      >
        <div className="h-full rounded-full bg-salud-trazo transition-[width] duration-700 motion-reduce:transition-none" style={{ width: `${pct}%` }} />
      </div>
      <p className={`mt-2 flex flex-wrap items-baseline justify-between gap-x-3 ${grande ? 'text-base' : 'text-sm'}`}>
        <span>
          <strong className={`font-titulo text-cafe ${grande ? 'text-2xl' : 'text-lg'}`}>{pesos(recaudado)}</strong>{' '}
          <span className="text-cafe-suave">de {pesos(meta)}</span>
        </span>
        <span className="font-semibold text-salud-trazo">{pct} %</span>
      </p>
    </div>
  )
}
