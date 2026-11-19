import { ArrowLeft, BadgeCheck, Clock, MapPin, MessageSquareReply, Navigation, Stethoscope, Tag, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import MensajeError from '../../components/ui/MensajeError'
import {
  borrarResena,
  crearResena,
  enlaceComoLlegar,
  NOMBRE_TIPO,
  obtenerEstablecimiento,
  promocionesDe,
  resenasDe,
} from '../../lib/directorio'
import type { Resena } from '../../lib/directorio'
import { formatearFecha, haceCuanto } from '../../lib/fechas'
import { hoyISO } from '../../lib/edad'
import { useCarga } from '../../lib/useCarga'
import { useSesion } from '../auth/contextoSesion'
import { clasesFoco, clasesTarjeta } from '../mascotas/inicio/comun'
import BotonEscribir from '../mensajes/BotonEscribir'
import { Estrellas, SelectorEstrellas } from './Estrellas'

function Distribucion({ resenas }: { resenas: Resena[] }) {
  const total = resenas.length
  return (
    <ul className="m-0 flex list-none flex-col gap-1.5 p-0" aria-label="Distribución de calificaciones">
      {[5, 4, 3, 2, 1].map((n) => {
        const cuantas = resenas.filter((r) => r.puntuacion === n).length
        const pct = total ? Math.round((cuantas / total) * 100) : 0
        return (
          <li key={n} className="flex items-center gap-2 text-[13px] text-cafe-suave">
            <span className="w-20 shrink-0">{n} {n === 1 ? 'estrella' : 'estrellas'}</span>
            <span aria-hidden="true" className="h-2 flex-1 overflow-hidden rounded-full bg-crema">
              <span className="block h-full rounded-full bg-[#e0a82e]" style={{ width: `${pct}%` }} />
            </span>
            <span className="w-6 shrink-0 text-right">{cuantas}</span>
          </li>
        )
      })}
    </ul>
  )
}

function TarjetaResena({ r, ahora, onBorrar }: { r: Resena; ahora: Date; onBorrar: (id: string) => void }) {
  return (
    <li className="flex flex-col gap-2 py-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-semibold text-cafe">{r.autor}</span>
        <Estrellas valor={r.puntuacion} tamano={15} />
        <span className="text-[13px] text-cafe-suave">{haceCuanto(r.creadoEn, ahora)}</span>
        {r.verificada ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-menta-suave px-2 py-px text-[11px] font-semibold text-salud-trazo">
            <BadgeCheck aria-hidden="true" size={13} />
            Verificada
          </span>
        ) : (
          <span className="rounded-full bg-crema px-2 py-px text-[11px] font-semibold text-cafe-suave">No verificada</span>
        )}
        {r.demo && <span className="rounded-full bg-crema-clara px-2 py-px text-[11px] font-semibold text-cafe">Ejemplo</span>}
      </div>
      {r.comentario && <p className="text-[15px] leading-snug text-cafe">{r.comentario}</p>}
      {r.respuesta && (
        <div className="ml-2 flex gap-2 rounded-2xl bg-amarillo-suave p-3 text-sm text-cafe">
          <MessageSquareReply aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-naranja-sombra" />
          <div>
            <p className="font-semibold">Respuesta del establecimiento</p>
            <p>{r.respuesta}</p>
          </div>
        </div>
      )}
      {r.propia && (
        <button
          type="button"
          onClick={() => onBorrar(r.id)}
          className={`inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-semibold text-naranja-sombra underline ${clasesFoco}`}
        >
          <Trash2 aria-hidden="true" size={15} />
          Borrar mi reseña
        </button>
      )}
    </li>
  )
}

function FormularioResena({ establecimientoId, onListo }: { establecimientoId: string; onListo: () => void }) {
  const [puntuacion, setPuntuacion] = useState(0)
  const [comentario, setComentario] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (puntuacion === 0) {
      setError('Elige de 1 a 5 estrellas.')
      return
    }
    setError('')
    setEnviando(true)
    try {
      await crearResena(establecimientoId, puntuacion, comentario)
      setPuntuacion(0)
      setComentario('')
      onListo()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos publicar tu reseña.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form noValidate onSubmit={enviar} aria-labelledby="titulo-nueva-resena" className="flex flex-col gap-3 rounded-[20px] bg-crema-clara p-4">
      <h3 id="titulo-nueva-resena" className="font-titulo text-base font-bold text-cafe">
        Cuéntanos tu experiencia
      </h3>
      <SelectorEstrellas valor={puntuacion} onCambiar={setPuntuacion} etiqueta="Tu calificación" />
      <div>
        <label htmlFor="comentario-resena" className="text-sm font-semibold text-cafe">
          Comentario (opcional)
        </label>
        <textarea
          id="comentario-resena"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          maxLength={800}
          rows={3}
          className="mt-1 w-full rounded-2xl border border-borde-calido bg-white p-3 text-[15px] text-cafe outline-none focus-visible:border-naranja focus-visible:ring-2 focus-visible:ring-naranja/25"
        />
        <p className="text-right text-xs text-cafe-suave">{comentario.length}/800</p>
      </div>
      {error && <MensajeError id="error-resena">{error}</MensajeError>}
      <BotonPrincipal type="submit" disabled={enviando} className="md:w-fit md:px-10">
        {enviando ? 'Publicando…' : 'Publicar reseña'}
      </BotonPrincipal>
      <p className="text-xs text-cafe-suave">
        Se publica con tu nombre y la inicial de tu apellido. Las reseñas no verificadas no han sido confirmadas por Manchitas.
      </p>
    </form>
  )
}

export default function FichaVeterinaria() {
  const { id = '' } = useParams()
  const { sesion } = useSesion()
  const { hash } = useLocation()
  const usuarioId = sesion?.id
  const [hoy] = useState(() => hoyISO())
  const [ahora] = useState(() => new Date())
  const [soloVerificadas, setSoloVerificadas] = useState(false)

  const lugar = useCarga(`lugar-${id}`, () => obtenerEstablecimiento(id))
  const promos = useCarga(`promos-${id}`, () => promocionesDe(id))
  const resenas = useCarga(`resenas-${id}-${usuarioId ?? ''}`, () => resenasDe(id, usuarioId))

  // Los enlaces con ancla (p. ej. a las promociones) desplazan la página cuando el contenido ya cargó.
  const listo = !lugar.cargando && !promos.cargando
  useEffect(() => {
    if (!listo || !hash) return
    document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' })
  }, [listo, hash])

  const volver = (
    <Link to="/comunidad?tab=veterinarias" className={`-ml-2 inline-flex min-h-11 w-fit items-center gap-2 rounded-full px-3 font-semibold text-naranja-sombra hover:bg-amarillo-suave ${clasesFoco}`}>
      <ArrowLeft aria-hidden="true" size={18} />
      Veterinarias y comercios
    </Link>
  )

  if (lugar.cargando) {
    return (
      <div className="flex flex-col gap-4">
        {volver}
        <p role="status" className="text-sm text-cafe-suave">Cargando…</p>
      </div>
    )
  }
  if (lugar.error || !lugar.datos) {
    return (
      <div className="flex flex-col gap-4">
        {volver}
        <div role={lugar.error ? 'alert' : 'status'} className={`p-5 text-sm ${clasesTarjeta}`}>
          {lugar.error || 'No encontramos este lugar. Puede que ya no esté en el directorio.'}
        </div>
      </div>
    )
  }

  const e = lugar.datos
  const comoLlegar = enlaceComoLlegar(e)
  const lista = (resenas.datos ?? []).filter((r) => !soloVerificadas || r.verificada)

  return (
    <div className="flex flex-col gap-6">
      {volver}

      <header className={`overflow-hidden ${clasesTarjeta}`}>
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="relative min-h-48 bg-foto-vacia md:min-h-64">
            {e.foto ? (
              <img src={e.foto} alt="" width={800} height={500} className="absolute inset-0 size-full object-cover" />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-huella">
                <Stethoscope aria-hidden="true" size={56} />
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3 p-5 md:p-7">
            <p className="text-[13px] font-semibold text-cafe-suave">
              {NOMBRE_TIPO[e.tipo]}
              {e.demo && ' · Establecimiento de ejemplo'}
            </p>
            <h2 className="font-titulo text-2xl font-bold leading-tight text-cafe md:text-3xl">{e.nombre}</h2>
            <p className="flex items-center gap-2 text-sm text-cafe-suave">
              {e.totalResenas > 0 ? (
                <>
                  <Estrellas valor={e.calificacion} />
                  <span>
                    {e.calificacion.toFixed(1)} · {e.totalResenas} {e.totalResenas === 1 ? 'reseña' : 'reseñas'}
                  </span>
                </>
              ) : (
                'Aún sin reseñas'
              )}
            </p>
            <p className="flex items-start gap-2 text-sm text-cafe">
              <MapPin aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-cafe-suave" />
              {e.zona} (ubicación aproximada)
            </p>
            <p className="flex items-start gap-2 text-sm text-cafe">
              <Clock aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-cafe-suave" />
              {e.horario || 'Horario por confirmar'}
            </p>
            {e.propietarioId && sesion?.id !== e.propietarioId && (
              <BotonEscribir tipo="veterinaria" contextoId={e.id} etiqueta="Escribir a este establecimiento" />
            )}
            {comoLlegar && (
              <a
                href={comoLlegar}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-borde-calido bg-white px-4 text-sm font-semibold text-cafe hover:bg-crema-clara ${clasesFoco}`}
              >
                <Navigation aria-hidden="true" size={16} />
                Cómo llegar
                <span className="sr-only"> (se abre en otra pestaña)</span>
              </a>
            )}
          </div>
        </div>
      </header>

      <section aria-labelledby="titulo-acerca" className="flex flex-col gap-3">
        <h2 id="titulo-acerca" className="font-titulo text-xl font-bold text-cafe">Acerca de</h2>
        <p className="max-w-3xl text-[15px] leading-relaxed text-cafe">{e.descripcion}</p>
        {e.servicios.length > 0 && (
          <ul aria-label="Servicios" className="m-0 flex list-none flex-wrap gap-2 p-0">
            {e.servicios.map((s) => (
              <li key={s} className="rounded-full bg-menta-suave px-3 py-1.5 text-[13px] font-semibold text-salud-trazo">{s}</li>
            ))}
          </ul>
        )}
      </section>

      {promos.datos && promos.datos.length > 0 && (
        <section aria-labelledby="titulo-promos" className="flex flex-col gap-3">
          <h2 id="titulo-promos" className="font-titulo text-xl font-bold text-cafe">Promociones</h2>
          <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-2">
            {promos.datos.map((p) => (
              <li key={p.id} className={`flex flex-col gap-1.5 p-4 ${clasesTarjeta}`}>
                {p.beneficio && (
                  <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-menta-suave px-2.5 py-1 text-[13px] font-semibold text-salud-trazo">
                    <Tag aria-hidden="true" size={14} />
                    {p.beneficio}
                  </p>
                )}
                <h3 className="font-titulo text-base font-bold text-cafe">{p.titulo}</h3>
                <p className="text-sm text-cafe-suave">{p.descripcion}</p>
                {p.condiciones && <p className="text-xs text-cafe-suave">{p.condiciones}</p>}
                <p className="text-xs font-semibold text-cafe-suave">
                  Vigente hasta el {formatearFecha(p.hasta, p.hasta.slice(0, 4) !== hoy.slice(0, 4))}
                  {p.demo && ' · Ejemplo'}
                </p>
              </li>
            ))}
          </ul>
          <p className="text-xs text-cafe-suave">
            El canje de promociones llegará en una fase posterior: por ahora son informativas.
          </p>
        </section>
      )}

      <section aria-labelledby="titulo-resenas" className="flex flex-col gap-4">
        <h2 id="titulo-resenas" className="font-titulo text-xl font-bold text-cafe">Reseñas</h2>
        {resenas.cargando ? (
          <p role="status" className="text-sm text-cafe-suave">Cargando reseñas…</p>
        ) : resenas.error ? (
          <div role="alert" className={`flex flex-col items-start gap-3 p-4 text-sm ${clasesTarjeta}`}>
            {resenas.error}
            <button type="button" onClick={resenas.recargar} className="min-h-11 font-semibold text-naranja-sombra underline">Reintentar</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
              <div className={`flex flex-col gap-3 p-4 ${clasesTarjeta}`}>
                <p className="font-titulo text-4xl font-bold leading-none text-cafe">
                  {e.totalResenas > 0 ? e.calificacion.toFixed(1) : '—'}
                </p>
                <Estrellas valor={e.calificacion} tamano={18} />
                <p className="text-sm text-cafe-suave">
                  {e.totalResenas} {e.totalResenas === 1 ? 'reseña' : 'reseñas'}
                </p>
                <Distribucion resenas={resenas.datos ?? []} />
              </div>
              <div className="flex flex-col gap-4">
                <FormularioResena establecimientoId={e.id} onListo={() => { resenas.recargar(); lugar.recargar() }} />
              </div>
            </div>

            <label className="flex min-h-11 w-fit cursor-pointer items-center gap-2 text-sm font-semibold text-cafe">
              <input
                type="checkbox"
                checked={soloVerificadas}
                onChange={(ev) => setSoloVerificadas(ev.target.checked)}
                className="size-5 accent-naranja"
              />
              Ver solo reseñas verificadas
            </label>

            {lista.length === 0 ? (
              <p role="status" className="text-sm text-cafe-suave">
                {soloVerificadas ? 'No hay reseñas verificadas todavía.' : 'Sé la primera persona en dejar una reseña.'}
              </p>
            ) : (
              <ul className="m-0 flex list-none flex-col divide-y divide-borde-calido p-0">
                {lista.map((r) => (
                  <TarjetaResena
                    key={r.id}
                    r={r}
                    ahora={ahora}
                    onBorrar={async (rid) => {
                      try {
                        await borrarResena(rid)
                      } finally {
                        resenas.recargar()
                        lugar.recargar()
                      }
                    }}
                  />
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </div>
  )
}
