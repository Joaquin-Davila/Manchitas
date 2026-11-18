import { Settings } from 'lucide-react'

type Props = {
  titulo: string
}

export default function Encabezado({ titulo }: Props) {
  return (
    <header className="flex items-center gap-3 rounded-b-encabezado border-b-[6px] border-amarillo-borde bg-amarillo px-5 pb-3 pt-4">
      {/* El PNG tiene márgenes blancos: se recorta a la cabeza del perro y la lupa. */}
      <div className="h-[66px] w-[84px] shrink-0 overflow-hidden">
        <img
          src="/logo-manchitas-sin-titulo.png"
          alt="Logo de Manchitas"
          className="-ml-[33px] -mt-[1px] h-auto w-[160px] max-w-none mix-blend-multiply"
        />
      </div>
      <h1 className="flex-1 font-titulo text-2xl font-bold text-cafe">{titulo}</h1>
      <button
        type="button"
        aria-label="Ajustes"
        className="flex size-11 items-center justify-center rounded-full bg-crema text-cafe"
      >
        <Settings aria-hidden="true" size={24} />
      </button>
    </header>
  )
}
