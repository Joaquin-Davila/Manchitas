import { Copy, Eye, MoreHorizontal, Pencil, Printer } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Mascota } from '../../types/mascota'

const clasesOpcion =
  'flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-cafe hover:bg-amarillo-suave focus-visible:bg-amarillo-suave'

/**
 * Menú de opciones de la tarjeta (patrón de botón que despliega una lista de enlaces).
 * Solo trae acciones que existen: editar la ficha, la etiqueta, la ficha pública y copiar el folio.
 */
export default function MenuMascota({ mascota }: { mascota: Mascota }) {
  const [abierto, setAbierto] = useState(false)
  const [copiado, setCopiado] = useState<'si' | 'error'>()
  const contenedor = useRef<HTMLDivElement>(null)
  const boton = useRef<HTMLButtonElement>(null)
  const idLista = useId()

  useEffect(() => {
    if (!abierto) return
    function fuera(e: PointerEvent) {
      if (!contenedor.current?.contains(e.target as Node)) setAbierto(false)
    }
    function tecla(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setAbierto(false)
        boton.current?.focus()
      }
    }
    document.addEventListener('pointerdown', fuera)
    document.addEventListener('keydown', tecla)
    return () => {
      document.removeEventListener('pointerdown', fuera)
      document.removeEventListener('keydown', tecla)
    }
  }, [abierto])

  async function copiarFolio() {
    try {
      await navigator.clipboard.writeText(mascota.folio)
      setCopiado('si')
    } catch {
      setCopiado('error')
    }
    setAbierto(false)
    boton.current?.focus()
    setTimeout(() => setCopiado(undefined), 2500)
  }

  return (
    <div
      ref={contenedor}
      className="relative"
      onBlur={(e) => {
        if (!contenedor.current?.contains(e.relatedTarget as Node)) setAbierto(false)
      }}
    >
      <button
        ref={boton}
        type="button"
        aria-label={`Más opciones de ${mascota.nombre}`}
        aria-expanded={abierto}
        aria-controls={idLista}
        onClick={() => setAbierto((a) => !a)}
        className={`flex size-[50px] items-center justify-center rounded-full border-2 border-barra-borde bg-white text-cafe shadow-tarjeta transition-colors hover:bg-amarillo-suave ${abierto ? 'bg-amarillo-suave' : ''}`}
      >
        <MoreHorizontal aria-hidden="true" size={22} />
      </button>

      <ul
        id={idLista}
        hidden={!abierto}
        className="absolute bottom-[calc(100%+8px)] right-0 z-20 m-0 w-60 list-none rounded-2xl border border-borde-calido bg-white p-1.5 shadow-elevada"
      >
        <li>
          <Link to={`/mascotas/${mascota.id}/editar`} className={clasesOpcion}>
            <Pencil aria-hidden="true" size={18} className="text-naranja" />
            Editar información
          </Link>
        </li>
        <li>
          <Link to={`/mascotas/${mascota.id}#etiqueta`} className={clasesOpcion}>
            <Printer aria-hidden="true" size={18} className="text-naranja" />
            Imprimir etiqueta del collar
          </Link>
        </li>
        <li>
          <a href={`/m/${mascota.token}`} target="_blank" rel="noopener" className={clasesOpcion}>
            <Eye aria-hidden="true" size={18} className="text-naranja" />
            Ver su ficha pública
            <span className="sr-only">(se abre en otra pestaña)</span>
          </a>
        </li>
        <li>
          <button type="button" onClick={copiarFolio} className={clasesOpcion}>
            <Copy aria-hidden="true" size={18} className="text-naranja" />
            Copiar folio
          </button>
        </li>
      </ul>

      <p role="status" className="sr-only">
        {copiado === 'si' ? `Folio ${mascota.folio} copiado` : copiado === 'error' ? 'No se pudo copiar el folio' : ''}
      </p>
      {copiado && (
        <span
          aria-hidden="true"
          className="absolute bottom-[calc(100%+8px)] right-0 z-30 whitespace-nowrap rounded-full bg-cafe px-3 py-1.5 text-xs font-semibold text-crema"
        >
          {copiado === 'si' ? 'Folio copiado' : 'No se pudo copiar'}
        </span>
      )}
    </div>
  )
}
