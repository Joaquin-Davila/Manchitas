import { ArrowRight, FlaskConical, HandHeart, Plus, QrCode } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { hoyISO } from '../../lib/edad'
import { diasRestantes, listarColectas, misColectas, NOMBRE_ESTADO_COLECTA, urlFotoColecta } from '../../lib/solidario'
import type { Colecta } from '../../lib/solidario'
import { useCarga } from '../../lib/useCarga'
import { useSesion } from '../auth/contextoSesion'
import { clasesElevar, clasesFoco, clasesTarjeta } from '../mascotas/inicio/comun'
import BarraProgreso from './BarraProgreso'

function TarjetaColecta({ c, hoy, destacada = false }: { c: Colecta; hoy: string; destacada?: boolean }) {
  const foto = urlFotoColecta(c.fotoPrincipal)
  const dias = diasRestantes(c.fechaFin, hoy)
  return (
    <li className={destacada ? 'md:col-span-2' : ''}>
      <Link
        to={`/comunidad/solidario/${c.id}`}
        className={`grid h-full overflow-hidden ${destacada ? 'md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]' : ''} ${clasesTarjeta} ${clasesElevar} ${clasesFoco}`}
      >
        <div className={`relative bg-foto-vacia ${destacada ? 'min-h-52 md:min-h-72' : 'aspect-[16/10]'}`}>
          {foto ? (
            <img src={foto} alt="" loading="lazy" width={640} height={400} className="absolute inset-0 size-full object-cover" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-huella"><HandHeart aria-hidden="true" size={48} /></span>
          )}
          {c.demo && <span className="absolute left-3 top-3 rounded-full bg-cafe/80 px-2.5 py-1 text-[11px] font-semibold text-white">Ejemplo</span>}
        </div>
        <div className="flex flex-col gap-3 p-4 md:p-5">
          <p className="text-[13px] font-semibold text-cafe-suave">{c.organizador}</p>
          <h3 className={`font-titulo font-bold leading-snug text-cafe ${destacada ? 'text-2xl' : 'text-lg'}`}>{c.titulo}</h3>
          {c.resumen && <p className="text-sm text-cafe-suave">{c.resumen}</p>}
          <div className="mt-auto flex flex-col gap-2">
            <BarraProgreso recaudado={c.recaudado} meta={c.meta} />
            <p className="text-xs text-cafe-suave">
              {c.donantes} {c.donantes === 1 ? 'donante' : 'donantes'} · {dias > 0 ? `faltan ${dias} ${dias === 1 ? 'día' : 'días'}` : 'finalizada'}
            </p>
          </div>
        </div>
      </Link>
    </li>
  )
}

/** Pestaña Manchitas Solidario: campañas de recaudación (en modo de demostración, sin pagos reales). */
export default function ListaSolidario() {
  const { sesion } = useSesion()
  const usuarioId = sesion?.id
  const [hoy] = useState(() => hoyISO())
  const activas = useCarga(`colectas-${usuarioId ?? ''}`, () => listarColectas(usuarioId))
  const mias = useCarga(`mis-colectas-${usuarioId ?? ''}`, () => (usuarioId ? misColectas(usuarioId) : Promise.resolve([])))

  const pendientes = (mias.datos ?? []).filter((c) => c.estado !== 'publicada' && c.estado !== 'finalizada')

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="titulo-solidario-intro" className={`grid overflow-hidden lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] ${clasesTarjeta}`}>
        <div className="flex flex-col justify-center gap-4 bg-amarillo-suave p-6 md:p-9">
          <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-salud-trazo">
            <HandHeart aria-hidden="true" size={14} />
            Manchitas Solidario
          </p>
          <h2 id="titulo-solidario-intro" className="font-titulo text-[28px] font-bold leading-tight text-cafe md:text-4xl">
            Una comunidad que se une por cada huella
          </h2>
          <p className="max-w-xl text-[15px] text-cafe-suave">
            Apoya campañas de rescate, cirugías y alimento para animales de Hermosillo, o crea la tuya. Cada campaña
            pasa por una revisión antes de publicarse y muestra a dónde irá el dinero.
          </p>
          <Link
            to="/comunidad/solidario/nueva"
            className={`inline-flex min-h-12 w-fit items-center gap-2 rounded-full bg-naranja px-6 text-[15px] font-semibold text-white shadow-boton ${clasesFoco}`}
          >
            <Plus aria-hidden="true" size={18} />
            Crear una campaña
          </Link>
        </div>
        <div className="flex flex-col justify-center gap-3 p-6 md:p-9">
          <p role="note" className="flex gap-2.5 rounded-2xl bg-aviso-fondo p-4 text-sm leading-snug text-cafe">
            <FlaskConical aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-naranja-sombra" />
            <span>
              <strong>Modo de demostración.</strong> Todavía no hay pasarela de pago: no se cobra ni se recibe dinero
              real. Las aportaciones que hagas quedan como pendientes y no suman al avance de las campañas.
            </span>
          </p>
        </div>
      </section>

      {pendientes.length > 0 && (
        <section aria-labelledby="titulo-mis-colectas" className="flex flex-col gap-3">
          <h2 id="titulo-mis-colectas" className="font-titulo text-xl font-bold text-cafe">Mis campañas por validar</h2>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {pendientes.map((c) => (
              <li key={c.id}>
                <Link to={`/comunidad/solidario/${c.id}`} className={`flex items-center justify-between gap-3 p-4 ${clasesTarjeta} ${clasesFoco}`}>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-cafe">{c.titulo}</span>
                    <span className="block text-[13px] text-cafe-suave">Meta de {c.meta.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-amarillo-suave px-3 py-1 text-[12px] font-semibold text-cafe">{NOMBRE_ESTADO_COLECTA[c.estado]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="titulo-activas" className="flex flex-col gap-3">
        <h2 id="titulo-activas" className="font-titulo text-xl font-bold text-cafe">Campañas activas</h2>
        {activas.cargando ? (
          <p role="status" className="text-sm text-cafe-suave">Cargando campañas…</p>
        ) : activas.error ? (
          <div role="alert" className={`flex flex-col items-start gap-3 p-5 text-sm ${clasesTarjeta}`}>
            {activas.error}
            <button type="button" onClick={activas.recargar} className="min-h-11 font-semibold text-naranja-sombra underline">Reintentar</button>
          </div>
        ) : (activas.datos ?? []).length === 0 ? (
          <p role="status" className={`p-5 text-sm text-cafe-suave ${clasesTarjeta}`}>Todavía no hay campañas publicadas. Crea la primera.</p>
        ) : (
          <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2">
            {(activas.datos ?? []).map((c, i) => <TarjetaColecta key={c.id} c={c} hoy={hoy} destacada={i === 0} />)}
          </ul>
        )}
      </section>

      <section aria-labelledby="titulo-1x1" className={`flex flex-col gap-3 p-5 md:p-7 ${clasesTarjeta}`}>
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-menta-suave text-salud-trazo"><QrCode size={22} /></span>
          <h2 id="titulo-1x1" className="font-titulo text-xl font-bold text-cafe">Fondo 1x1 Solidario</h2>
        </div>
        <p className="max-w-3xl text-[15px] text-cafe-suave">
          Es distinto de las campañas de arriba: no lo organiza una persona. Una parte fija de lo que Manchitas gane con
          las placas QR y las comisiones por cupones canjeados se destinará a regalar placas de identificación a animales
          de albergues.
        </p>
        <p role="note" className="w-fit rounded-full bg-aviso-fondo px-3 py-1.5 text-[13px] font-semibold text-cafe">
          Todavía no se venden placas: el fondo aún no tiene aportaciones.
        </p>
        <Link to="/comunidad/solidario/nueva" className={`inline-flex min-h-11 w-fit items-center gap-1.5 font-semibold text-naranja-sombra underline ${clasesFoco}`}>
          Crear una campaña
          <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </section>
    </div>
  )
}
