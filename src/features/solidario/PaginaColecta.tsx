import { ArrowLeft, CalendarClock, Check, FlaskConical, HandHeart, Link2, Share2, ShieldCheck, Users } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import MensajeError from '../../components/ui/MensajeError'
import { hoyISO } from '../../lib/edad'
import { formatearFecha, haceCuanto } from '../../lib/fechas'
import {
  diasRestantes,
  NOMBRE_BENEFICIARIO,
  NOMBRE_ESTADO_COLECTA,
  obtenerColecta,
  pesos,
  publicarActualizacion,
  urlFotoColecta,
} from '../../lib/solidario'
import type { Aportacion, EstadoAportacion } from '../../lib/solidario'
import { useCarga } from '../../lib/useCarga'
import { useSesion } from '../auth/contextoSesion'
import { clasesFoco, clasesTarjeta } from '../mascotas/inicio/comun'
import BarraProgreso from './BarraProgreso'
import DialogoAportar from './DialogoAportar'

const ESTADO_APORTACION: Record<EstadoAportacion, { texto: string; clase: string }> = {
  pendiente: { texto: 'Pendiente', clase: 'bg-amarillo-suave text-cafe' },
  confirmada: { texto: 'Confirmada', clase: 'bg-menta-suave text-salud-trazo' },
  fallida: { texto: 'Fallida', clase: 'bg-aviso-fondo text-error-oscuro' },
  reembolsada: { texto: 'Reembolsada', clase: 'bg-crema text-cafe-suave' },
}

function FilaAportacion({ a, ahora }: { a: Aportacion; ahora: Date }) {
  const e = ESTADO_APORTACION[a.estado]
  return (
    <li className="flex items-start justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="font-semibold text-cafe">
          {a.anonima ? 'Anónimo' : a.donante}
          {a.mia && <span className="ml-2 text-[11px] font-semibold text-naranja-sombra">(tú)</span>}
        </p>
        {a.mensaje && <p className="text-sm text-cafe-suave">{a.mensaje}</p>}
        <p className="mt-0.5 text-xs text-cafe-suave">
          {haceCuanto(a.creadaEn, ahora)}
          {(a.simulada || a.demo) && ' · Demostración'}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-titulo font-bold text-cafe">{pesos(a.monto)}</p>
        <span className={`inline-flex rounded-full px-2 py-px text-[11px] font-semibold ${e.clase}`}>{e.texto}</span>
      </div>
    </li>
  )
}

function FormularioActualizacion({ colectaId, onListo }: { colectaId: string; onListo: () => void }) {
  const [titulo, setTitulo] = useState('')
  const [texto, setTexto] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (!titulo.trim() || !texto.trim()) {
      setError('Escribe un título y el texto de la actualización.')
      return
    }
    setError('')
    setEnviando(true)
    try {
      await publicarActualizacion(colectaId, titulo, texto)
      setTitulo('')
      setTexto('')
      onListo()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos publicar la actualización.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form noValidate onSubmit={enviar} aria-labelledby="titulo-act" className="flex flex-col gap-3 rounded-[20px] bg-crema-clara p-4">
      <h3 id="titulo-act" className="font-titulo text-base font-bold text-cafe">Publicar una actualización</h3>
      <div>
        <label htmlFor="act-titulo" className="text-sm font-semibold">Título</label>
        <input id="act-titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={120} className="mt-1 h-12 w-full rounded-2xl border border-borde-calido bg-white px-4 text-[15px] outline-none focus-visible:border-naranja focus-visible:ring-2 focus-visible:ring-naranja/25" />
      </div>
      <div>
        <label htmlFor="act-texto" className="text-sm font-semibold">Qué ha pasado</label>
        <textarea id="act-texto" value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={2000} rows={3} className="mt-1 w-full rounded-2xl border border-borde-calido bg-white p-3 text-[15px] outline-none focus-visible:border-naranja focus-visible:ring-2 focus-visible:ring-naranja/25" />
      </div>
      {error && <MensajeError id="error-act">{error}</MensajeError>}
      <BotonPrincipal type="submit" disabled={enviando} className="md:w-fit md:px-10">{enviando ? 'Publicando…' : 'Publicar'}</BotonPrincipal>
    </form>
  )
}

export default function PaginaColecta() {
  const { id = '' } = useParams()
  const { sesion } = useSesion()
  const usuarioId = sesion?.id
  const { datos, cargando, error, recargar } = useCarga(`colecta-${id}-${usuarioId ?? ''}`, () => obtenerColecta(id, usuarioId))
  const [hoy] = useState(() => hoyISO())
  const [ahora] = useState(() => new Date())
  const [aportando, setAportando] = useState(false)
  const [copiado, setCopiado] = useState(false)

  const volver = (
    <Link to="/comunidad?tab=solidario" className={`-ml-2 inline-flex min-h-11 w-fit items-center gap-2 rounded-full px-3 font-semibold text-naranja-sombra hover:bg-amarillo-suave ${clasesFoco}`}>
      <ArrowLeft aria-hidden="true" size={18} />
      Manchitas Solidario
    </Link>
  )

  if (cargando) return <div className="flex flex-col gap-4">{volver}<p role="status" className="text-sm text-cafe-suave">Cargando campaña…</p></div>
  if (error || !datos) {
    return (
      <div className="flex flex-col gap-4">
        {volver}
        <div role={error ? 'alert' : 'status'} className={`p-5 text-sm ${clasesTarjeta}`}>
          {error || 'No encontramos esta campaña. Puede que aún esté en revisión o ya no esté disponible.'}
        </div>
      </div>
    )
  }

  const { colecta: c, gastos, actualizaciones, aportaciones } = datos
  const publicada = c.estado === 'publicada'
  const dias = diasRestantes(c.fechaFin, hoy)
  const foto = urlFotoColecta(c.fotoPrincipal)

  async function compartir() {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: c.titulo, text: c.resumen || c.titulo, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    } catch {
      // La persona canceló el diálogo de compartir o el navegador no deja copiar: no pasa nada.
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {volver}

      {c.estado === 'en_revision' && (
        <p role="status" className="rounded-2xl bg-amarillo-suave p-4 text-sm">
          <strong>Tu campaña está en revisión.</strong> Un moderador la valida antes de publicarla. Todavía no puede recibir aportaciones.
        </p>
      )}
      {c.estado === 'rechazada' && (
        <p role="alert" className="rounded-2xl bg-aviso-fondo p-4 text-sm">
          <strong>Esta campaña no fue aprobada.</strong> {c.motivoRechazo ?? 'Revisa los datos y crea una nueva.'}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
        <div className="flex flex-col gap-6">
          <div className={`overflow-hidden ${clasesTarjeta}`}>
            <div className="relative aspect-[16/9] bg-foto-vacia">
              {foto ? (
                <img src={foto} alt="" width={960} height={540} className="size-full object-cover" />
              ) : (
                <span className="flex size-full items-center justify-center text-huella"><HandHeart aria-hidden="true" size={56} /></span>
              )}
              {c.demo && (
                <span className="absolute left-3 top-3 rounded-full bg-cafe/80 px-2.5 py-1 text-[11px] font-semibold text-white">Campaña de ejemplo</span>
              )}
            </div>
            <div className="flex flex-col gap-3 p-5 md:p-7">
              <h2 className="font-titulo text-2xl font-bold leading-tight text-cafe md:text-3xl">{c.titulo}</h2>
              <p className="text-sm text-cafe-suave">
                Organiza <strong className="text-cafe">{c.organizador}</strong> · Para {NOMBRE_BENEFICIARIO[c.beneficiarioTipo].toLowerCase()}:{' '}
                <strong className="text-cafe">{c.beneficiario}</strong>
              </p>
              {c.estado !== 'publicada' && (
                <p className="w-fit rounded-full bg-aviso-fondo px-3 py-1 text-[12px] font-semibold text-cafe">{NOMBRE_ESTADO_COLECTA[c.estado]}</p>
              )}
            </div>
          </div>

          <section aria-labelledby="titulo-historia" className={`p-5 md:p-7 ${clasesTarjeta}`}>
            <h3 id="titulo-historia" className="font-titulo text-xl font-bold text-cafe">Historia</h3>
            <div className="mt-3 flex flex-col gap-3">
              {c.historia.split(/\n{2,}/).map((p, i) => (
                <p key={i} className="max-w-3xl text-[15px] leading-relaxed text-cafe">{p}</p>
              ))}
            </div>
          </section>

          <section aria-labelledby="titulo-desglose" className={`p-5 md:p-7 ${clasesTarjeta}`}>
            <h3 id="titulo-desglose" className="font-titulo text-xl font-bold text-cafe">Transparencia: a dónde irá el dinero</h3>
            <p className="mt-1 text-sm text-cafe-suave">Desglose que dio la persona organizadora. La suma es igual a la meta.</p>
            <ul className="m-0 mt-3 flex list-none flex-col divide-y divide-borde-calido p-0">
              {gastos.map((g) => (
                <li key={g.id} className="flex items-center justify-between gap-3 py-2.5 text-[15px]">
                  <span className="text-cafe">{g.concepto}</span>
                  <span className="shrink-0 font-semibold text-cafe">{pesos(g.monto)}</span>
                </li>
              ))}
              <li className="flex items-center justify-between gap-3 py-2.5 font-titulo text-base font-bold text-cafe">
                <span>Total</span>
                <span>{pesos(gastos.reduce((s, g) => s + g.monto, 0))}</span>
              </li>
            </ul>
          </section>

          <section aria-labelledby="titulo-actualizaciones" className={`p-5 md:p-7 ${clasesTarjeta}`}>
            <h3 id="titulo-actualizaciones" className="font-titulo text-xl font-bold text-cafe">Actualizaciones</h3>
            {actualizaciones.length === 0 ? (
              <p className="mt-2 text-sm text-cafe-suave">Todavía no hay actualizaciones.</p>
            ) : (
              <ol className="m-0 mt-3 flex list-none flex-col gap-4 border-l-2 border-borde-calido p-0 pl-4">
                {actualizaciones.map((a) => (
                  <li key={a.id}>
                    <p className="text-xs font-semibold text-cafe-suave">{haceCuanto(a.creadoEn, ahora)}</p>
                    <p className="font-semibold text-cafe">{a.titulo}</p>
                    <p className="text-sm text-cafe-suave">{a.texto}</p>
                  </li>
                ))}
              </ol>
            )}
            {c.esMia && (c.estado === 'publicada' || c.estado === 'finalizada') && (
              <div className="mt-4"><FormularioActualizacion colectaId={c.id} onListo={recargar} /></div>
            )}
          </section>

          <section aria-labelledby="titulo-aportaciones" className={`p-5 md:p-7 ${clasesTarjeta}`}>
            <h3 id="titulo-aportaciones" className="font-titulo text-xl font-bold text-cafe">Aportaciones</h3>
            {aportaciones.length === 0 ? (
              <p className="mt-2 text-sm text-cafe-suave">Aún no hay aportaciones. Sé la primera persona en apoyar.</p>
            ) : (
              <ul className="m-0 mt-2 flex list-none flex-col divide-y divide-borde-calido p-0">
                {aportaciones.slice(0, 20).map((a) => <FilaAportacion key={a.id} a={a} ahora={ahora} />)}
              </ul>
            )}
            <p className="mt-3 text-xs text-cafe-suave">
              Estados: <strong>pendiente</strong> (aún sin confirmar), <strong>confirmada</strong>, <strong>fallida</strong> y <strong>reembolsada</strong>. Solo las confirmadas suman al avance.
            </p>
          </section>
        </div>

        <aside aria-label="Resumen de la campaña" className={`flex flex-col gap-4 p-5 lg:sticky lg:top-6 ${clasesTarjeta}`}>
          <BarraProgreso recaudado={c.recaudado} meta={c.meta} grande />
          <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm text-cafe">
            <li className="flex items-center gap-2"><Users aria-hidden="true" size={16} className="text-cafe-suave" />{c.donantes} {c.donantes === 1 ? 'donante' : 'donantes'}</li>
            <li className="flex items-center gap-2">
              <CalendarClock aria-hidden="true" size={16} className="text-cafe-suave" />
              {dias > 0 ? `Faltan ${dias} ${dias === 1 ? 'día' : 'días'}` : 'Campaña finalizada'} · termina el {formatearFecha(c.fechaFin)}
            </li>
            <li className="flex items-center gap-2"><ShieldCheck aria-hidden="true" size={16} className="text-cafe-suave" />Publicada tras revisión de Manchitas</li>
          </ul>

          <p role="note" className="flex gap-2 rounded-2xl bg-amarillo-suave p-3 text-[13px] leading-snug">
            <FlaskConical aria-hidden="true" size={17} className="mt-0.5 shrink-0 text-naranja-sombra" />
            <span>Modo de demostración: aún no se procesan pagos y las aportaciones nuevas no suman al avance.</span>
          </p>

          {publicada && dias > 0 ? (
            <BotonPrincipal onClick={() => setAportando(true)}>Donar</BotonPrincipal>
          ) : (
            <p className="text-sm text-cafe-suave">Esta campaña no recibe aportaciones por ahora.</p>
          )}
          <button
            type="button"
            onClick={compartir}
            className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-barra-borde bg-white px-6 text-[15px] font-semibold text-cafe ${clasesFoco}`}
          >
            {copiado ? <Check aria-hidden="true" size={18} /> : typeof navigator.share === 'function' ? <Share2 aria-hidden="true" size={18} /> : <Link2 aria-hidden="true" size={18} />}
            {copiado ? 'Enlace copiado' : 'Compartir'}
          </button>
          <span role="status" className="sr-only">{copiado ? 'Enlace copiado al portapapeles' : ''}</span>
        </aside>
      </div>

      {aportando && <DialogoAportar colectaId={c.id} titulo={c.titulo} onCerrar={() => setAportando(false)} onListo={recargar} />}
    </div>
  )
}
