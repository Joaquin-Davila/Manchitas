import { BadgeCheck, Cat, CircleCheck, Dog, HeartHandshake, ShieldCheck, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import BotonSecundario from '../../components/ui/BotonSecundario'
import { esCachorro, textoEdad } from '../../lib/adopcionEjemplo'
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

  const Especie = animal.especie === 'gato' ? Cat : Dog
  const rasgos = [
    animal.especie === 'gato' ? 'Gato' : 'Perro',
    animal.sexo,
    `${textoEdad(animal.edadMeses)}${esCachorro(animal) ? ' · Cachorro' : ''}`,
    animal.tamano,
  ]

  return (
    <dialog
      ref={ref}
      aria-labelledby="ficha-adopcion-titulo"
      onClose={onCerrar}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      className="m-auto max-h-[90dvh] w-[calc(100%-32px)] max-w-[540px] overflow-y-auto overscroll-contain rounded-[28px] bg-white p-0 text-cafe shadow-elevada backdrop:bg-cafe/55"
    >
      <div className="relative aspect-[4/3] bg-foto-vacia">
        <img src={animal.foto} alt={animal.fotoAlt} width={480} height={360} className="size-full object-cover" />
        <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-cafe">
          Foto de ejemplo
        </span>
        <button
          type="button"
          aria-label="Cerrar"
          onClick={() => ref.current?.close()}
          className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-full bg-white/90 text-cafe shadow-suave hover:bg-white"
        >
          <X aria-hidden="true" size={22} />
        </button>
      </div>

      <div className="flex flex-col gap-4 p-5 md:p-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="ficha-adopcion-titulo" className="font-titulo text-2xl font-bold">
              {animal.nombre}
            </h2>
            {animal.verificado && (
              <span className="inline-flex items-center gap-1 rounded-full bg-menta-suave px-2.5 py-1 text-[11px] font-semibold text-salud-trazo">
                <BadgeCheck aria-hidden="true" size={14} />
                Verificado (ejemplo)
              </span>
            )}
          </div>
          <ul aria-label="Características" className="m-0 mt-2 flex list-none flex-wrap gap-1.5 p-0">
            {rasgos.map((r, i) => (
              <li key={r} className="inline-flex items-center gap-1 rounded-full bg-crema px-2.5 py-1 text-xs font-semibold">
                {i === 0 && <Especie aria-hidden="true" size={13} />}
                {r}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[15px]">{animal.descripcion}</p>
        <p className="flex items-center gap-1.5 text-[13px] text-cafe-suave">
          <HeartHandshake aria-hidden="true" size={16} className="shrink-0 text-salud-trazo" />
          Publicado por {animal.publicadoPor}
        </p>

        <section aria-labelledby="titulo-requisitos" className="rounded-2xl bg-crema-clara p-4">
          <h3 id="titulo-requisitos" className="font-titulo text-base font-semibold">
            Para adoptar con responsabilidad
          </h3>
          <ul className="m-0 mt-2 flex list-none flex-col gap-1.5 p-0 text-[13px] text-cafe">
            {REQUISITOS.map((r) => (
              <li key={r} className="flex items-start gap-2">
                <CircleCheck aria-hidden="true" size={15} className="mt-0.5 shrink-0 text-salud-trazo" />
                {r}
              </li>
            ))}
          </ul>
        </section>

        <p className="flex items-start gap-2 rounded-2xl border border-dashed border-borde-calido p-3 text-[13px] text-cafe-suave">
          <ShieldCheck aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-salud-trazo" />
          El contacto con quien publica será protegido desde Manchitas, sin mostrar teléfonos. Llegará en una próxima
          versión: por ahora es una vista de ejemplo.
        </p>
        <BotonSecundario onClick={() => ref.current?.close()}>Cerrar</BotonSecundario>
      </div>
    </dialog>
  )
}
