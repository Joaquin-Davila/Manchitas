import { ArrowRight, MapPin, Stethoscope, Tag } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Anuncio } from '../../../lib/comunidad'
import { formatearFecha } from '../../../lib/fechas'
import { clasesElevar, clasesFoco, clasesTarjeta, TituloSeccion } from './comun'

// Publicidad de veterinarias y comercios aliados. Los anuncios salen de la tabla `anuncios`: ningún
// texto publicitario vive aquí. Cada tarjeta se rotula "Patrocinado" y, si es de demostración,
// también "Ejemplo".
function TarjetaAnuncio({ anuncio, hoy }: { anuncio: Anuncio; hoy: string }) {
  const { establecimiento: e } = anuncio
  return (
    <li className={`flex flex-col overflow-hidden ${clasesTarjeta} ${clasesElevar}`}>
      <div className="relative h-36 bg-foto-vacia md:h-40">
        {anuncio.imagen ? (
          <img src={anuncio.imagen} alt="" loading="lazy" width={640} height={400} className="size-full object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center text-huella">
            <Stethoscope aria-hidden="true" size={40} />
          </span>
        )}
        <span className="absolute left-3 top-3 flex gap-1.5">
          <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-cafe shadow-suave">
            Patrocinado
          </span>
          {anuncio.demo && (
            <span className="rounded-full bg-cafe/80 px-2.5 py-1 text-[11px] font-semibold text-white">Ejemplo</span>
          )}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-cafe-suave">
          <MapPin aria-hidden="true" size={14} className="shrink-0" />
          <span className="truncate">
            {e.nombre}
            {e.zona ? ` · ${e.zona}` : ''}
          </span>
        </p>
        <h3 className="font-titulo text-lg font-bold leading-snug text-cafe">{anuncio.titulo}</h3>
        {anuncio.promocion && (
          <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-menta-suave px-2.5 py-1 text-[13px] font-semibold text-salud-trazo">
            <Tag aria-hidden="true" size={14} />
            {anuncio.promocion}
          </p>
        )}
        <p className="text-sm text-cafe-suave">{anuncio.descripcion}</p>
        <p className="mt-auto pt-1 text-xs text-cafe-suave">
          Vigente hasta el {formatearFecha(anuncio.hasta, anuncio.hasta.slice(0, 4) !== hoy.slice(0, 4))}
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            to={`/comunidad/veterinarias/${e.id}`}
            className={`inline-flex min-h-11 items-center gap-1.5 rounded-full bg-naranja px-4 text-sm font-semibold text-white ${clasesFoco}`}
          >
            Ver perfil
            <ArrowRight aria-hidden="true" size={16} />
          </Link>
          <Link
            to={`/comunidad/veterinarias/${e.id}#titulo-promos`}
            className={`inline-flex min-h-11 items-center rounded-full border border-borde-calido bg-white px-4 text-sm font-semibold text-cafe hover:bg-crema-clara ${clasesFoco}`}
          >
            Consultar promoción
          </Link>
        </div>
      </div>
    </li>
  )
}

export default function Patrocinado({ anuncios, hoy }: { anuncios: Anuncio[]; hoy: string }) {
  if (anuncios.length === 0) return null
  return (
    <section aria-labelledby="titulo-patrocinado">
      <TituloSeccion
        id="titulo-patrocinado"
        titulo="Veterinarias que cuidan contigo"
        subtitulo="Promociones de establecimientos aliados. Contenido patrocinado."
      />
      <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 lg:grid-cols-4">
        {anuncios.slice(0, 4).map((a) => (
          <TarjetaAnuncio key={a.id} anuncio={a} hoy={hoy} />
        ))}
      </ul>
    </section>
  )
}
