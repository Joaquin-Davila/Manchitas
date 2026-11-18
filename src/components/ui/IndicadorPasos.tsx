import { Check } from 'lucide-react'

type Props = {
  pasos: string[]
  /** Paso actual, empezando en 1. */
  actual: number
  /** Nombre accesible del indicador. */
  etiqueta?: string
}

export default function IndicadorPasos({ pasos, actual, etiqueta = 'Progreso del registro' }: Props) {
  return (
    <nav aria-label={etiqueta}>
      <ol className="m-0 flex list-none p-0">
        {pasos.map((nombre, i) => {
          const numero = i + 1
          const hecho = numero < actual
          const activo = numero === actual
          const estado = hecho ? 'completado' : activo ? 'actual' : 'pendiente'
          return (
            <li
              key={nombre}
              aria-current={activo ? 'step' : undefined}
              className={`relative flex flex-1 flex-col items-center gap-1 ${
                i > 0
                  ? 'before:absolute before:right-1/2 before:top-[17px] before:h-0.5 before:w-full before:bg-amarillo-borde'
                  : ''
              }`}
            >
              <span
                aria-hidden="true"
                className={`relative z-10 flex size-9 items-center justify-center rounded-full border-2 font-titulo text-base font-semibold ${
                  hecho
                    ? 'border-salud-trazo bg-salud-trazo text-white'
                    : activo
                      ? 'border-naranja bg-naranja text-white'
                      : 'border-cafe-suave bg-white text-cafe'
                }`}
              >
                {hecho ? <Check size={18} strokeWidth={3} /> : numero}
              </span>
              <span className="text-[11px] font-semibold text-cafe-suave">{nombre}</span>
              <span className="sr-only">{`Paso ${numero} de ${pasos.length}, ${estado}`}</span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
