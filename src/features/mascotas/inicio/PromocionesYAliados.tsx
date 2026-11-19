import { ArrowRight, Stethoscope, Tag } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { hoyISO } from '../../../lib/edad'
import { listarEstablecimientos, NOMBRE_TIPO, promocionesVigentes } from '../../../lib/directorio'
import { formatearFecha } from '../../../lib/fechas'
import { useCarga } from '../../../lib/useCarga'
import { Estrellas } from '../../veterinarias/Estrellas'
import { clasesElevar, clasesFoco, clasesTarjeta, TituloSeccion } from './comun'

/**
 * Promociones vigentes y los establecimientos mejor calificados, leídos de Supabase. Si no hay datos
 * (sin conexión o directorio vacío) la sección no aparece.
 */
export default function PromocionesYAliados() {
  const [hoy] = useState(() => hoyISO())
  const promos = useCarga('inicio-promos', () => promocionesVigentes(6))
  const lugares = useCarga('inicio-lugares', listarEstablecimientos)

  const promociones = promos.datos ?? []
  const destacados = [...(lugares.datos ?? [])]
    .filter((e) => e.totalResenas > 0 && e.tipo !== 'punto_campanas')
    .sort((a, b) => b.calificacion - a.calificacion || b.totalResenas - a.totalResenas)
    .slice(0, 3)

  if (promociones.length === 0 && destacados.length === 0) return null

  return (
    <>
      {promociones.length > 0 && (
        <section aria-labelledby="titulo-promos-inicio">
          <TituloSeccion
            id="titulo-promos-inicio"
            titulo="Promociones para tu mascota"
            subtitulo="Descuentos y beneficios de veterinarias y comercios aliados."
            derecha={
              <Link to="/comunidad?tab=veterinarias" className={`inline-flex min-h-11 items-center gap-1 font-semibold text-naranja-sombra underline ${clasesFoco}`}>
                Ver veterinarias
                <ArrowRight aria-hidden="true" size={15} />
              </Link>
            }
          />
          <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-2 lg:grid-cols-3">
            {promociones.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/comunidad/veterinarias/${p.establecimientoId}#titulo-promos`}
                  className={`flex h-full flex-col gap-1.5 p-4 ${clasesTarjeta} ${clasesElevar} ${clasesFoco}`}
                >
                  {p.beneficio && (
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-menta-suave px-2.5 py-1 text-[13px] font-semibold text-salud-trazo">
                      <Tag aria-hidden="true" size={14} />
                      {p.beneficio}
                    </span>
                  )}
                  <span className="font-titulo text-base font-bold text-cafe">{p.titulo}</span>
                  <span className="text-[13px] font-semibold text-cafe-suave">{p.establecimiento?.nombre}</span>
                  <span className="mt-auto pt-1 text-xs text-cafe-suave">
                    Hasta el {formatearFecha(p.hasta, p.hasta.slice(0, 4) !== hoy.slice(0, 4))}
                    {p.demo && ' · Ejemplo'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {destacados.length > 0 && (
        <section aria-labelledby="titulo-destacados">
          <TituloSeccion id="titulo-destacados" titulo="Aliados mejor calificados" subtitulo="Según las reseñas de la comunidad." />
          <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-3">
            {destacados.map((e) => (
              <li key={e.id}>
                <Link to={`/comunidad/veterinarias/${e.id}`} className={`flex h-full items-center gap-3 p-3.5 ${clasesTarjeta} ${clasesElevar} ${clasesFoco}`}>
                  <span className="size-16 shrink-0 overflow-hidden rounded-2xl bg-foto-vacia">
                    {e.foto ? (
                      <img src={e.foto} alt="" loading="lazy" width={64} height={64} className="size-full object-cover" />
                    ) : (
                      <span className="flex size-full items-center justify-center text-huella">
                        <Stethoscope aria-hidden="true" size={26} />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-cafe">{e.nombre}</span>
                    <span className="block text-[13px] text-cafe-suave">{NOMBRE_TIPO[e.tipo]} · {e.zona}</span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-[13px] text-cafe-suave">
                      <Estrellas valor={e.calificacion} tamano={14} />
                      {e.calificacion.toFixed(1)} ({e.totalResenas})
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
