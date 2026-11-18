import type { KeyboardEvent } from 'react'

type Pestana = { id: string; etiqueta: string }

type Props = {
  pestanas: Pestana[]
  activa: string
  onCambiar: (id: string) => void
  etiqueta: string
  /** Prefijo de los ids: la pestaña es `${base}-tab-${id}` y su panel `${base}-panel-${id}`. */
  base: string
}

// Pestañas con el patrón ARIA: flechas, Inicio y Fin mueven la selección; solo la activa entra con Tab.
export default function Pestanas({ pestanas, activa, onCambiar, etiqueta, base }: Props) {
  function teclado(e: KeyboardEvent<HTMLButtonElement>, indice: number) {
    const ultimo = pestanas.length - 1
    const destino =
      e.key === 'ArrowRight' ? (indice === ultimo ? 0 : indice + 1)
      : e.key === 'ArrowLeft' ? (indice === 0 ? ultimo : indice - 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? ultimo
      : null
    if (destino === null) return
    e.preventDefault()
    onCambiar(pestanas[destino].id)
    document.getElementById(`${base}-tab-${pestanas[destino].id}`)?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label={etiqueta}
      className="flex gap-1 rounded-boton border-2 border-barra-borde bg-white p-1 shadow-tarjeta"
    >
      {pestanas.map((p, i) => {
        const seleccionada = p.id === activa
        return (
          <button
            key={p.id}
            id={`${base}-tab-${p.id}`}
            type="button"
            role="tab"
            aria-selected={seleccionada}
            aria-controls={`${base}-panel-${p.id}`}
            tabIndex={seleccionada ? 0 : -1}
            onClick={() => onCambiar(p.id)}
            onKeyDown={(e) => teclado(e, i)}
            className={`min-h-11 flex-1 rounded-boton px-2 text-[13px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naranja ${
              seleccionada ? 'bg-naranja text-white' : 'text-cafe'
            }`}
          >
            {p.etiqueta}
          </button>
        )
      })}
    </div>
  )
}
