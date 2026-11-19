import { Star } from 'lucide-react'
import { useState } from 'react'

/** Calificación de solo lectura (0 a 5, con decimales). La estrella parcial se redondea a la más cercana. */
export function Estrellas({ valor, tamano = 16 }: { valor: number; tamano?: number }) {
  const llenas = Math.round(valor)
  return (
    <span role="img" aria-label={`${valor.toFixed(1)} de 5 estrellas`} className="inline-flex items-center gap-0.5 text-amarillo-borde">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} aria-hidden="true" size={tamano} className={n <= llenas ? 'fill-[#e0a82e] text-[#e0a82e]' : 'text-amarillo-borde'} />
      ))}
    </span>
  )
}

/** Selector de 1 a 5 estrellas con el patrón radiogroup: flechas cambian el valor. */
export function SelectorEstrellas({
  valor,
  onCambiar,
  etiqueta,
}: {
  valor: number
  onCambiar: (n: number) => void
  etiqueta: string
}) {
  const [enfoque, setEnfoque] = useState(false)
  return (
    <div
      role="radiogroup"
      aria-label={etiqueta}
      className={`inline-flex gap-1 rounded-full ${enfoque ? 'outline-2 outline-offset-2 outline-naranja-sombra' : ''}`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <label key={n} className="flex size-11 cursor-pointer items-center justify-center">
          <input
            type="radio"
            name="puntuacion"
            value={n}
            checked={valor === n}
            onChange={() => onCambiar(n)}
            onFocus={() => setEnfoque(true)}
            onBlur={() => setEnfoque(false)}
            className="sr-only"
          />
          <Star
            aria-hidden="true"
            size={30}
            className={n <= valor ? 'fill-[#e0a82e] text-[#e0a82e]' : 'text-amarillo-borde'}
          />
          <span className="sr-only">{`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}</span>
        </label>
      ))}
    </div>
  )
}
