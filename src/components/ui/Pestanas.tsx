import { useEffect } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'

/** `icono` es opcional; las pantallas que no lo pasan se ven igual que antes. */
type Pestana = { id: string; etiqueta: string; icono?: ReactNode }

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
  // Con muchas pestañas la fila se desplaza a lo ancho: la activa siempre queda a la vista.
  useEffect(() => {
    document.getElementById(`${base}-tab-${activa}`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [activa, base])

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
      className="flex gap-1 overflow-x-auto rounded-boton border-2 border-barra-borde bg-white p-1 shadow-tarjeta [scrollbar-width:none]"
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
            className={`flex min-h-11 min-w-fit flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-boton px-3 text-[13px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naranja ${
              seleccionada ? 'bg-naranja text-white' : 'text-cafe hover:bg-crema'
            }`}
          >
            {p.icono}
            {p.etiqueta}
          </button>
        )
      })}
    </div>
  )
}
