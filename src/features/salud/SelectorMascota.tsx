import Huella from '../../components/ui/Huella'
import { NOMBRE_ESPECIE } from '../../lib/especies'
import type { Mascota } from '../../types/mascota'


/** Elige de qué mascota se consulta la cartilla (solo aparece con dos o más). */
export default function SelectorMascota({
  mascotas,
  elegida,
  onElegir,
}: {
  mascotas: Mascota[]
  elegida: string
  onElegir: (id: string) => void
}) {
  return (
    <div role="group" aria-label="Elegir mascota" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 pt-0.5">
      {mascotas.map((m) => {
        const activa = m.id === elegida
        return (
          <button
            key={m.id}
            type="button"
            aria-pressed={activa}
            onClick={() => onElegir(m.id)}
            className={`flex min-h-12 shrink-0 items-center gap-2.5 rounded-full border py-1 pl-1 pr-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naranja-sombra ${
              activa ? 'border-naranja bg-white shadow-suave' : 'border-borde-calido bg-white/60 hover:bg-white'
            }`}
          >
            <span className="size-10 shrink-0 overflow-hidden rounded-full bg-foto-vacia">
              {m.fotoUrl ? (
                <img src={m.fotoUrl} alt="" className="size-full object-cover" />
              ) : (
                <span className="flex size-full items-center justify-center text-huella">
                  <Huella aria-hidden="true" size={20} relleno />
                </span>
              )}
            </span>
            <span className="leading-tight">
              <span className={`block text-sm font-semibold ${activa ? 'text-naranja-sombra' : 'text-cafe'}`}>{m.nombre}</span>
              <span className="block text-xs text-cafe-suave">{NOMBRE_ESPECIE[m.especie]}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
