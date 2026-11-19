import { Cat, Dog, MapPin, MessagesSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatearFecha } from '../../lib/fechas'
import type { Extraviado } from '../../lib/extraviados'
import { clasesElevar, clasesFoco, clasesTarjeta } from '../mascotas/inicio/comun'

export function EtiquetaEstadoExtraviado({ e }: { e: Pick<Extraviado, 'estado' | 'dias'> }) {
  if (e.estado === 'localizado') {
    return <span className="rounded-full bg-menta-suave px-2.5 py-1 text-[11px] font-semibold text-salud-trazo">Localizada</span>
  }
  if (e.estado === 'cerrado') {
    return <span className="rounded-full bg-crema px-2.5 py-1 text-[11px] font-semibold text-cafe-suave">Reporte cerrado</span>
  }
  return (
    <span className="rounded-full bg-amarillo-suave px-2.5 py-1 text-[11px] font-semibold text-cafe">
      Extraviada · {e.dias === 0 ? 'hoy' : `día ${e.dias}`}
    </span>
  )
}

/** Tarjeta de una mascota extraviada: foto, etapa, zona aproximada y actividad del foro. */
export default function TarjetaExtraviado({ e, hoy }: { e: Extraviado; hoy: string }) {
  const Especie = e.especie === 'gato' ? Cat : Dog
  return (
    <li>
      <Link to={`/comunidad/extraviadas/${e.id}`} className={`flex h-full flex-col overflow-hidden ${clasesTarjeta} ${clasesElevar} ${clasesFoco}`}>
        <div className="relative aspect-[4/3] bg-foto-vacia">
          {e.foto ? (
            <img src={e.foto} alt="" loading="lazy" width={640} height={480} className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center text-huella">
              <Especie aria-hidden="true" size={48} />
            </span>
          )}
          <span className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <EtiquetaEstadoExtraviado e={e} />
            {e.demo && <span className="rounded-full bg-cafe/80 px-2.5 py-1 text-[11px] font-semibold text-white">Ejemplo</span>}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-4">
          <h3 className="font-titulo text-lg font-bold leading-snug text-cafe">{e.nombre}</h3>
          <p className="text-sm text-cafe-suave">
            {e.especie === 'gato' ? 'Gato' : 'Perro'}
            {e.raza ? ` · ${e.raza}` : ''}
          </p>
          <p className="flex items-center gap-1.5 text-sm text-cafe-suave">
            <MapPin aria-hidden="true" size={14} className="shrink-0" />
            {e.zona}
          </p>
          <p className="text-xs text-cafe-suave">Desde el {formatearFecha(e.fecha, e.fecha.slice(0, 4) !== hoy.slice(0, 4))}</p>
          <p className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[13px] font-semibold text-cafe-suave">
            {e.foroEstado === 'abierto' && <span className="rounded-full bg-menta-suave px-2 py-px text-[11px] text-salud-trazo">Foro abierto</span>}
            {e.foroEstado === 'cerrado' && <span className="rounded-full bg-crema px-2 py-px text-[11px]">Foro cerrado</span>}
            <span className="inline-flex items-center gap-1">
              <MessagesSquare aria-hidden="true" size={14} />
              {e.totalMensajes} {e.totalMensajes === 1 ? 'mensaje' : 'mensajes'}
            </span>
          </p>
        </div>
      </Link>
    </li>
  )
}
