import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { FormasHuella } from './Huella'

type Props = {
  titulo: string
  /** Ruta del botón de regreso; si se omite, no se muestra. */
  atras?: string
}

// Patrón de huellas y huesos en tono claro, decorativo.
function Patron() {
  return (
    <svg aria-hidden="true" className="absolute inset-0 size-full text-white opacity-40">
      <defs>
        <pattern id="patron-mascotas" width="84" height="84" patternUnits="userSpaceOnUse">
          <g fill="currentColor">
            <g transform="translate(8 10) scale(0.36)">
              <FormasHuella />
            </g>
            <g transform="translate(58 58) rotate(-35)">
              <rect x="-11" y="-2" width="22" height="4" rx="2" />
              <circle cx="-11" cy="-3" r="3.5" />
              <circle cx="-11" cy="3" r="3.5" />
              <circle cx="11" cy="-3" r="3.5" />
              <circle cx="11" cy="3" r="3.5" />
            </g>
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#patron-mascotas)" />
    </svg>
  )
}

export default function EncabezadoCurvo({ titulo, atras }: Props) {
  return (
    <header className="relative overflow-hidden rounded-b-[48px] border-b-[6px] border-amarillo-borde bg-amarillo px-5 pb-9 pt-5">
      <Patron />
      <div className="relative grid grid-cols-[44px_1fr_44px] items-center">
        {atras ? (
          <Link
            to={atras}
            aria-label="Regresar"
            className="flex size-11 items-center justify-center rounded-full bg-crema text-cafe"
          >
            <ArrowLeft aria-hidden="true" size={22} />
          </Link>
        ) : (
          <span />
        )}
        <h1 className="text-center font-titulo text-2xl font-bold text-cafe">{titulo}</h1>
        <span />
      </div>
    </header>
  )
}
