import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

/**
 * Modal nativo (<dialog>): el navegador atrapa el foco, cierra con Esc y devuelve el foco al botón
 * que lo abrió. Se abre al montarse; `onCerrar` lo quita del árbol.
 */
export default function Dialogo({
  titulo,
  id,
  onCerrar,
  children,
  ancho = 'max-w-[520px]',
}: {
  titulo: ReactNode
  id: string
  onCerrar: () => void
  children: (cerrar: () => void) => ReactNode
  ancho?: string
}) {
  const ref = useRef<HTMLDialogElement>(null)
  // Cerrar se pide con estado: la ref solo se toca en efectos y eventos, nunca durante el render.
  const [cerrando, setCerrando] = useState(false)

  useEffect(() => {
    const dialogo = ref.current
    if (dialogo && !dialogo.open) dialogo.showModal()
  }, [])

  useEffect(() => {
    if (cerrando) ref.current?.close()
  }, [cerrando])

  const cerrar = () => setCerrando(true)

  return (
    <dialog
      ref={ref}
      aria-labelledby={id}
      onClose={onCerrar}
      onClick={(e) => e.target === ref.current && cerrar()}
      className={`m-auto max-h-[90dvh] w-[calc(100%-32px)] ${ancho} overflow-y-auto overscroll-contain rounded-[28px] bg-white p-0 text-cafe shadow-elevada backdrop:bg-cafe/55`}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-borde-calido bg-white px-5 py-3">
        <h2 id={id} className="font-titulo text-lg font-bold">
          {titulo}
        </h2>
        <button
          type="button"
          aria-label="Cerrar"
          onClick={cerrar}
          className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-crema focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naranja-sombra"
        >
          <X aria-hidden="true" size={22} />
        </button>
      </div>
      <div className="p-5">{children(cerrar)}</div>
    </dialog>
  )
}
