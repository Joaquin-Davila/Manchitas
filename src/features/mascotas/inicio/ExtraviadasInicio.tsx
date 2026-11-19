import { ArrowRight, Bell } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { hoyISO } from '../../../lib/edad'
import { listarExtraviados } from '../../../lib/extraviados'
import { useCarga } from '../../../lib/useCarga'
import { useSesion } from '../../auth/contextoSesion'
import TarjetaExtraviado from '../../extraviadas/TarjetaExtraviado'
import { clasesFoco, clasesTarjeta, TituloSeccion } from './comun'

/**
 * Mascotas extraviadas que siguen sin aparecer, leídas de Supabase. Si la persona tiene un reporte
 * propio activo, se destaca arriba. Sin datos, la sección no aparece.
 */
export default function ExtraviadasInicio() {
  const { sesion } = useSesion()
  const usuarioId = sesion?.id
  const [hoy] = useState(() => hoyISO())
  const { datos } = useCarga(`inicio-extraviados-${usuarioId ?? ''}`, () => listarExtraviados(usuarioId).catch(() => []))

  const activas = (datos ?? []).filter((e) => e.estado === 'activo')
  const miReporte = activas.find((e) => e.esMio)
  const otras = activas.filter((e) => !e.esMio).slice(0, 3)
  if (activas.length === 0) return null

  return (
    <section aria-labelledby="titulo-extraviadas-inicio">
      <TituloSeccion
        id="titulo-extraviadas-inicio"
        titulo="Mascotas extraviadas"
        subtitulo="Una mirada de tu parte puede llevarlas a casa."
        derecha={
          <Link to="/comunidad?tab=extraviadas" className={`inline-flex min-h-11 items-center gap-1 font-semibold text-naranja-sombra underline ${clasesFoco}`}>
            Ver todas
            <ArrowRight aria-hidden="true" size={15} />
          </Link>
        }
      />
      {miReporte && (
        <Link
          to={`/comunidad/extraviadas/${miReporte.id}`}
          className={`mb-4 flex items-center gap-3 bg-amarillo-suave p-4 ${clasesTarjeta} ${clasesFoco}`}
        >
          <Bell aria-hidden="true" size={20} className="shrink-0 text-naranja-sombra" />
          <span className="min-w-0 flex-1 text-sm">
            <strong>Tu reporte de {miReporte.nombre}</strong> sigue activo (día {miReporte.dias}).{' '}
            {miReporte.foroEstado === 'abierto'
              ? 'Ya tiene un foro comunitario.'
              : miReporte.dias >= 4
                ? 'Muy pronto se abrirá su foro.'
                : 'Revisa si hay avistamientos.'}
          </span>
          <ArrowRight aria-hidden="true" size={16} className="shrink-0 text-naranja-sombra" />
        </Link>
      )}
      {otras.length > 0 && (
        <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {otras.map((e) => (
            <TarjetaExtraviado key={e.id} e={e} hoy={hoy} />
          ))}
        </ul>
      )}
    </section>
  )
}
