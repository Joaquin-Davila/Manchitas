import { Bone, Footprints, Scissors, Stethoscope } from 'lucide-react'
import type { ComponentType } from 'react'
import Tarjeta from '../../components/ui/Tarjeta'
import { cuponesVigentes } from '../../lib/cuponesEjemplo'
import type { CategoriaCupon } from '../../lib/cuponesEjemplo'
import { hoyISO } from '../../lib/edad'
import { formatearFecha } from '../../lib/fechas'

type Estilo = { icono: ComponentType<{ size?: number; 'aria-hidden'?: boolean | 'true' | 'false' }>; fondo: string }

const estilos: Record<CategoriaCupon, Estilo> = {
  Veterinaria: { icono: Stethoscope, fondo: 'bg-salud-fondo text-salud-trazo' },
  Estética: { icono: Scissors, fondo: 'bg-rosa text-cafe' },
  Alimento: { icono: Bone, fondo: 'bg-lima text-cafe' },
  Paseos: { icono: Footprints, fondo: 'bg-celeste text-cafe' },
}

export default function PanelCupones() {
  const lista = cuponesVigentes(hoyISO())

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13px] text-cafe-suave">
        Beneficios de comercios aliados. Por ahora son ejemplos: el canje llegará en una próxima versión.
      </p>

      {lista.length === 0 ? (
        <Tarjeta className="p-4 text-sm text-cafe-suave">
          No hay cupones vigentes por ahora. Pronto sumaremos más aliados.
        </Tarjeta>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {lista.map((c) => {
            const { icono: Icono, fondo } = estilos[c.categoria]
            return (
              <li key={c.id}>
                <Tarjeta className="flex gap-3 p-4">
                  <div className={`flex size-11 shrink-0 items-center justify-center rounded-[14px] ${fondo}`}>
                    <Icono aria-hidden="true" size={22} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold leading-snug text-cafe-suave">
                      {c.comercio} · {c.categoria}
                    </p>
                    <p className="font-titulo text-base font-semibold leading-snug">{c.oferta}</p>
                    <p className="mt-1 text-[13px] leading-snug text-cafe-suave">{c.detalle}</p>
                    <p className="mt-2 inline-block rounded-full bg-aviso-fondo px-3 py-1 text-[11px] font-semibold text-cafe">
                      Vigente hasta el {formatearFecha(c.vigencia)}
                    </p>
                  </div>
                </Tarjeta>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
