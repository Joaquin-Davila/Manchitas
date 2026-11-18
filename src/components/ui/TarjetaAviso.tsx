import type { ReactNode } from 'react'
import Tarjeta from './Tarjeta'

type Props = {
  icono: ReactNode
  /** Clases de fondo y color de trazo del cuadro del ícono */
  colorIcono: string
  titulo: string
  detalle: string
}

export default function TarjetaAviso({ icono, colorIcono, titulo, detalle }: Props) {
  return (
    <Tarjeta className="flex items-center gap-3 px-4 py-3.5">
      <div
        className={`flex size-11 shrink-0 items-center justify-center rounded-[14px] ${colorIcono}`}
      >
        {icono}
      </div>
      <div>
        <p className="text-sm font-semibold leading-snug">{titulo}</p>
        <p className="text-[13px] leading-snug text-cafe-suave">{detalle}</p>
      </div>
    </Tarjeta>
  )
}
