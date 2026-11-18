import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import BotonSecundario from '../../components/ui/BotonSecundario'
import { textoEdad } from '../../lib/adopcionEjemplo'
import type { Animal } from '../../lib/adopcionEjemplo'

type Props = { animal: Animal; onCerrar: () => void }

const REQUISITOS = [
  'Esterilizar a tu mascota en cuanto tenga la edad indicada por el veterinario.',
  'Registrarla en Manchitas y ponerle su ID de collar.',
  'Mantener su cartilla de vacunación al día.',
  'Darle comida, agua, sombra y atención veterinaria. Un animal es para toda la vida.',
]

// <dialog> nativo: el navegador atrapa el foco, cierra con Esc y devuelve el foco al botón que lo abrió.
export default function FichaAdopcion({ animal, onCerrar }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialogo = ref.current
    if (dialogo && !dialogo.open) dialogo.showModal()
  }, [])

  return (
    <dialog
      ref={ref}
      aria-labelledby="ficha-adopcion-titulo"
      onClose={onCerrar}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      className="m-auto w-[calc(100%-40px)] max-w-[350px] rounded-tarjeta bg-crema p-0 text-cafe shadow-tarjeta backdrop:bg-black/50"
    >
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <h2 id="ficha-adopcion-titulo" className="font-titulo text-xl font-bold">
            {animal.nombre}
          </h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => ref.current?.close()}
            className="-mr-2 -mt-2 flex size-11 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naranja"
          >
            <X aria-hidden="true" size={22} />
          </button>
        </div>
        <p className="text-[13px] text-cafe-suave">
          {animal.sexo} · {textoEdad(animal.edadMeses)} · {animal.tamano}
        </p>
        <p className="text-sm">{animal.descripcion}</p>
        <p className="text-[13px] text-cafe-suave">Publicado por {animal.publicadoPor}.</p>

        <h3 className="font-titulo text-base font-semibold">Para adoptar con responsabilidad</h3>
        <ul className="m-0 flex list-disc flex-col gap-1 pl-5 text-[13px] text-cafe-suave">
          {REQUISITOS.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <p className="text-xs text-cafe-suave">
          Por ahora es una vista de ejemplo: el contacto con quien publica llegará en una próxima versión.
        </p>
        <BotonSecundario onClick={() => ref.current?.close()}>Cerrar</BotonSecundario>
      </div>
    </dialog>
  )
}
