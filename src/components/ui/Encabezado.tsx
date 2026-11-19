import type { ReactNode } from 'react'

type Props = {
  titulo: string
  /** Navegación horizontal para escritorio (solo se ve desde `lg`). */
  navegacion?: ReactNode
  /** Contenido a la derecha del título (p. ej. el botón de ajustes). */
  derecha?: ReactNode
}

// El fondo de la barra (sin línea inferior) ocupa todo el ancho; el contenido se alinea con el de la pantalla
// (mismos anchos máximos que el <main> del Layout).
export default function Encabezado({ titulo, navegacion, derecha }: Props) {
  return (
    <header className="rounded-b-encabezado bg-amarillo shadow-suave">
      <div className="mx-auto flex w-full max-w-[390px] items-center gap-3 px-5 pb-3 pt-4 md:max-w-[720px] md:px-8 lg:max-w-[1120px]">
        {/* El PNG tiene márgenes blancos: se recorta a la cabeza del perro y la lupa. */}
        <div className="h-[66px] w-[84px] shrink-0 overflow-hidden">
          <img
            src="/logo-manchitas-sin-titulo.png"
            alt="Logo de Manchitas"
            className="-ml-[33px] -mt-[1px] h-auto w-[160px] max-w-none mix-blend-multiply"
          />
        </div>
        <div className="min-w-0 flex-1">
          {/* Marca y eslogan sobre el título de la pantalla; el eslogan aparece desde tableta. */}
          <p className="flex items-baseline gap-2 text-xs leading-tight">
            <span className="font-titulo text-[13px] font-bold tracking-wide text-cafe">Manchitas</span>
            <span className="hidden truncate font-semibold text-salud-trazo md:inline lg:text-[11px]">
              Cuidamos cada paso de tu mejor amigo
            </span>
          </p>
          <h1 className="font-titulo text-2xl font-bold text-cafe">{titulo}</h1>
        </div>
        {navegacion}
        {derecha}
      </div>
    </header>
  )
}
