import type { CSSProperties, ReactNode } from 'react'
import Huella from '../../../components/ui/Huella'

// Piezas compartidas por las secciones de Inicio.

/** Tarjeta base de Inicio: blanca, borde cálido y sombra difusa. */
export const clasesTarjeta = 'rounded-[24px] border border-borde-calido bg-white shadow-suave'

/** Elevación ligera al pasar el cursor (solo en dispositivos con puntero; sin movimiento reducido). */
export const clasesElevar =
  'transition-[transform,box-shadow] duration-300 ease-out motion-safe:hover:-translate-y-1 hover:shadow-elevada'

export const clasesFoco =
  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-naranja-sombra'

/** Aparece con un retraso para que las secciones entren en cascada. */
export function Aparecer({
  retraso = 0,
  className = '',
  children,
  como: Como = 'div',
}: {
  retraso?: number
  className?: string
  children: ReactNode
  como?: 'div' | 'section' | 'li'
}) {
  return (
    <Como className={`aparecer ${className}`} style={{ '--retraso': `${retraso}ms` } as CSSProperties}>
      {children}
    </Como>
  )
}

export function TituloSeccion({
  id,
  titulo,
  subtitulo,
  derecha,
}: {
  id: string
  titulo: ReactNode
  subtitulo?: string
  derecha?: ReactNode
}) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-1 md:mb-4">
      <div>
        <h2 id={id} className="font-titulo text-xl font-bold text-cafe md:text-[22px]">
          {titulo}
        </h2>
        {subtitulo && <p className="mt-0.5 text-sm text-cafe-suave md:text-[15px]">{subtitulo}</p>}
      </div>
      {derecha}
    </div>
  )
}

type HuellaSuelta = { top?: string; left?: string; right?: string; bottom?: string; size: number; giro: number; retraso?: number }

/** Huellitas decorativas, sin significado: quedan ocultas para lectores de pantalla. */
export function HuellasDecorativas({
  huellas,
  className = 'text-huella',
}: {
  huellas: HuellaSuelta[]
  className?: string
}) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {huellas.map(({ size, giro, retraso = 0, ...pos }, i) => (
        <span
          key={i}
          className="flotar absolute block"
          style={{ ...pos, '--giro': `${giro}deg`, '--retraso': `${retraso}ms` } as CSSProperties}
        >
          <Huella size={size} relleno />
        </span>
      ))}
    </div>
  )
}
