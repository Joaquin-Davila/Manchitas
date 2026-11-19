import { CalendarHeart, Heart, PawPrint, Store } from 'lucide-react'
import type { Indicadores as Datos } from '../../../lib/comunidad'
import { clasesTarjeta, TituloSeccion } from './comun'

// Conteos agregados que calcula la base de datos (función indicadores_comunidad). Incluyen los
// datos de demostración mientras no haya usuarios reales.
export default function Indicadores({ datos }: { datos: Datos | null }) {
  if (!datos) return null
  const items = [
    { n: datos.mascotas, texto: 'mascotas registradas', icono: PawPrint },
    { n: datos.adopcionesDisponibles, texto: 'esperan un hogar', icono: Heart },
    { n: datos.campanasProximas, texto: 'campañas próximas', icono: CalendarHeart },
    { n: datos.establecimientos, texto: 'establecimientos aliados', icono: Store },
  ]
  return (
    <section aria-labelledby="titulo-indicadores">
      <TituloSeccion id="titulo-indicadores" titulo="Nuestra comunidad en números" />
      <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 md:grid-cols-4 md:gap-4">
        {items.map(({ n, texto, icono: Icono }) => (
          <li key={texto} className={`flex items-center gap-3 p-4 ${clasesTarjeta}`}>
            <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-menta-suave text-salud-trazo">
              <Icono size={22} />
            </span>
            <span>
              <span className="block font-titulo text-2xl font-bold leading-none text-cafe">{n}</span>
              <span className="mt-1 block text-[13px] text-cafe-suave">{texto}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
