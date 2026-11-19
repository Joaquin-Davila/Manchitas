import { ArrowLeft, Cat, Check, Dog, Link2, MapPin, MessageCircle, Share2, ShieldAlert, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import MensajeError from '../../components/ui/MensajeError'
import { formatearFecha, haceCuanto } from '../../lib/fechas'
import {
  borrarMensaje,
  cerrarExtravio,
  mensajesDe,
  obtenerExtraviado,
  publicarMensaje,
  whatsappExtravio,
} from '../../lib/extraviados'
import type { Extraviado, Mensaje } from '../../lib/extraviados'
import { hoyISO } from '../../lib/edad'
import { reducirImagen } from '../../lib/imagen'
import { useCarga } from '../../lib/useCarga'
import { useSesion } from '../auth/contextoSesion'
import { clasesFoco, clasesTarjeta } from '../mascotas/inicio/comun'
import { EtiquetaEstadoExtraviado } from './TarjetaExtraviado'

function LineaTiempo({ e }: { e: Extraviado }) {
  const cerrado = e.estado !== 'activo'
  const pasos = [
    { titulo: 'Reporte', texto: 'Día 0', hecho: true },
    { titulo: 'Avistamientos', texto: 'Días 1 a 4', hecho: e.dias >= 1 || cerrado },
    { titulo: 'Foro comunitario', texto: 'Día 5', hecho: !!e.foroId },
    {
      titulo: e.estado === 'cerrado' ? 'Reporte cerrado' : 'Localizada',
      texto: cerrado ? 'Reporte cerrado, historial conservado' : 'Cuando aparezca',
      hecho: cerrado,
    },
  ]
  return (
    <ol aria-label="Etapas del reporte" className="m-0 grid list-none grid-cols-2 gap-3 p-0 md:grid-cols-4">
      {pasos.map((p) => (
        <li key={p.titulo} className={`flex items-start gap-2.5 rounded-2xl p-3 ${p.hecho ? 'bg-menta-suave' : 'bg-crema'}`}>
          <span
            aria-hidden="true"
            className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${p.hecho ? 'bg-salud-trazo text-white' : 'border border-cafe-suave'}`}
          >
            {p.hecho && <Check size={12} strokeWidth={3} />}
          </span>
          <span>
            <span className="block text-sm font-semibold text-cafe">{p.titulo}</span>
            <span className="block text-xs text-cafe-suave">{p.texto}</span>
            <span className="sr-only">{p.hecho ? ' (listo)' : ' (pendiente)'}</span>
          </span>
        </li>
      ))}
    </ol>
  )
}

function FormularioMensaje({ e, usuarioId, onListo }: { e: Extraviado; usuarioId: string; onListo: () => void }) {
  const [tipo, setTipo] = useState<Mensaje['tipo']>('avistamiento')
  const [texto, setTexto] = useState('')
  const [zona, setZona] = useState('')
  const [foto, setFoto] = useState<string>()
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const archivo = useRef<HTMLInputElement>(null)

  async function elegirFoto(ev: ChangeEvent<HTMLInputElement>) {
    const f = ev.target.files?.[0]
    ev.target.value = ''
    if (!f) return
    setProcesando(true)
    try {
      setFoto(await reducirImagen(f, 1000))
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos leer la imagen.')
    } finally {
      setProcesando(false)
    }
  }

  async function enviar(ev: FormEvent) {
    ev.preventDefault()
    if (!texto.trim()) return setError('Escribe lo que viste o tu comentario.')
    if (tipo === 'avistamiento' && !zona.trim()) return setError('Indica la zona aproximada donde la viste (colonia o calle principal).')
    setError('')
    setEnviando(true)
    try {
      await publicarMensaje(usuarioId, e.id, { tipo, texto, zona, fotoNueva: foto })
      setTexto('')
      setZona('')
      setFoto(undefined)
      onListo()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos publicar tu mensaje.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form noValidate onSubmit={enviar} aria-labelledby="titulo-nuevo-mensaje" className="flex flex-col gap-3 rounded-[20px] bg-crema-clara p-4">
      <h3 id="titulo-nuevo-mensaje" className="font-titulo text-base font-bold text-cafe">Ayuda a encontrar a {e.nombre}</h3>
      <fieldset className="m-0 flex min-w-0 gap-2 border-0 p-0">
        <legend className="sr-only">Tipo de mensaje</legend>
        {(['avistamiento', 'comentario'] as const).map((t) => (
          <label
            key={t}
            className={`flex min-h-11 cursor-pointer items-center rounded-full border-2 px-4 text-sm font-semibold has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-naranja-sombra ${
              tipo === t ? 'border-naranja bg-naranja text-white' : 'border-borde-calido bg-white text-cafe'
            }`}
          >
            <input type="radio" name="tipo-mensaje" value={t} checked={tipo === t} onChange={() => setTipo(t)} className="sr-only" />
            {t === 'avistamiento' ? 'La vi' : 'Comentario'}
          </label>
        ))}
      </fieldset>
      <div>
        <label htmlFor="texto-mensaje" className="text-sm font-semibold text-cafe">
          {tipo === 'avistamiento' ? 'Qué viste' : 'Tu comentario'}
        </label>
        <textarea
          id="texto-mensaje"
          value={texto}
          onChange={(ev) => setTexto(ev.target.value)}
          maxLength={600}
          rows={3}
          className="mt-1 w-full rounded-2xl border border-borde-calido bg-white p-3 text-[15px] text-cafe outline-none focus-visible:border-naranja focus-visible:ring-2 focus-visible:ring-naranja/25"
        />
      </div>
      {tipo === 'avistamiento' && (
        <div>
          <label htmlFor="zona-mensaje" className="text-sm font-semibold text-cafe">Zona aproximada</label>
          <p className="text-xs text-cafe-suave">Colonia o calle principal. No escribas domicilios particulares.</p>
          <input
            id="zona-mensaje"
            value={zona}
            onChange={(ev) => setZona(ev.target.value)}
            maxLength={120}
            className="mt-1 h-12 w-full rounded-2xl border border-borde-calido bg-white px-4 text-[15px] text-cafe outline-none focus-visible:border-naranja focus-visible:ring-2 focus-visible:ring-naranja/25"
          />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => archivo.current?.click()}
          disabled={procesando}
          className={`inline-flex min-h-11 items-center rounded-full border border-borde-calido bg-white px-4 text-sm font-semibold text-cafe ${clasesFoco}`}
        >
          {procesando ? 'Procesando…' : foto ? 'Cambiar foto' : 'Agregar foto (opcional)'}
        </button>
        <input ref={archivo} type="file" accept="image/*" onChange={elegirFoto} className="sr-only" tabIndex={-1} aria-label="Elegir una foto" />
        {foto && (
          <span className="flex items-center gap-2">
            <img src={foto} alt="Foto que se publicará" className="size-14 rounded-xl object-cover" />
            <button type="button" aria-label="Quitar la foto" onClick={() => setFoto(undefined)} className="flex size-11 items-center justify-center rounded-full text-cafe-suave">
              <Trash2 aria-hidden="true" size={18} />
            </button>
          </span>
        )}
      </div>
      {error && <MensajeError id="error-mensaje">{error}</MensajeError>}
      <BotonPrincipal type="submit" disabled={enviando || procesando} className="md:w-fit md:px-10">
        {enviando ? 'Publicando…' : 'Publicar'}
      </BotonPrincipal>
      <p className="text-xs text-cafe-suave">
        Se publica con tu nombre y la inicial de tu apellido. Nunca compartas tu teléfono ni el domicilio de nadie aquí.
      </p>
    </form>
  )
}

export default function PaginaExtravio() {
  const { id = '' } = useParams()
  const { sesion } = useSesion()
  const usuarioId = sesion?.id
  const lugar = useCarga(`extraviado-${id}-${usuarioId ?? ''}`, () => obtenerExtraviado(id, usuarioId))
  const mensajes = useCarga(`mensajes-${id}-${usuarioId ?? ''}`, () => mensajesDe(id, usuarioId))
  const [hoy] = useState(() => hoyISO())
  const [ahora] = useState(() => new Date())
  const [copiado, setCopiado] = useState(false)
  const [confirmar, setConfirmar] = useState<'localizada' | 'cerrar' | null>(null)
  const [accion, setAccion] = useState<{ cargando: boolean; error: string }>({ cargando: false, error: '' })
  const [contacto, setContacto] = useState<{ cargando: boolean; error: string }>({ cargando: false, error: '' })

  const volver = (
    <Link to="/comunidad?tab=extraviadas" className={`-ml-2 inline-flex min-h-11 w-fit items-center gap-2 rounded-full px-3 font-semibold text-naranja-sombra hover:bg-amarillo-suave ${clasesFoco}`}>
      <ArrowLeft aria-hidden="true" size={18} />
      Mascotas extraviadas
    </Link>
  )

  if (lugar.cargando) return <div className="flex flex-col gap-4">{volver}<p role="status" className="text-sm text-cafe-suave">Cargando reporte…</p></div>
  if (lugar.error || !lugar.datos) {
    return (
      <div className="flex flex-col gap-4">
        {volver}
        <div role={lugar.error ? 'alert' : 'status'} className={`p-5 text-sm ${clasesTarjeta}`}>
          {lugar.error || 'No encontramos este reporte.'}
        </div>
      </div>
    )
  }

  const e = lugar.datos
  const activo = e.estado === 'activo'
  const Especie = e.especie === 'gato' ? Cat : Dog
  const lista = mensajes.datos ?? []
  const ref = (
    <span className="sr-only" aria-live="polite">{copiado ? 'Enlace copiado al portapapeles' : ''}</span>
  )

  async function compartir() {
    const url = window.location.href
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title: `Se busca a ${e.nombre}`, text: `Ayuda a encontrar a ${e.nombre} en Hermosillo`, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    } catch {
      // La persona canceló el diálogo de compartir o el navegador no deja copiar: no pasa nada.
    }
  }

  async function contactar() {
    setContacto({ cargando: true, error: '' })
    const enlace = await whatsappExtravio(e.id)
    if (!enlace) {
      setContacto({ cargando: false, error: 'No pudimos obtener el contacto. Publica un avistamiento y el tutor lo recibirá.' })
      return
    }
    setContacto({ cargando: false, error: '' })
    const texto = `Hola, vi el reporte de ${e.nombre} en Manchitas y quiero ayudar.`
    window.open(`${enlace}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener')
  }

  async function cerrar(localizado: boolean) {
    setAccion({ cargando: true, error: '' })
    try {
      await cerrarExtravio(e.id, localizado)
      setConfirmar(null)
      lugar.recargar()
      mensajes.recargar()
      setAccion({ cargando: false, error: '' })
    } catch (err) {
      setAccion({ cargando: false, error: err instanceof Error ? err.message : 'No pudimos actualizar el reporte.' })
    }
  }

  const avisoDia =
    e.esMio && activo && !e.foroId && e.dias >= 4
      ? e.dias === 4
        ? 'Mañana se abrirá el foro comunitario de tu reporte (día 5).'
        : 'El foro comunitario de tu reporte se abrirá en unos minutos.'
      : ''

  return (
    <div className="flex flex-col gap-6">
      {volver}

      {e.esMio && avisoDia && (
        <div role="status" className="rounded-2xl bg-amarillo-suave p-4 text-sm">
          <strong>{avisoDia}</strong> Si ya la encontraste, márcala como localizada; si no, revisa que los datos estén al día.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
        <div className="flex flex-col gap-6">
          <header className={`overflow-hidden ${clasesTarjeta}`}>
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              <div className="relative min-h-56 bg-foto-vacia md:min-h-72">
                {e.foto ? (
                  <img src={e.foto} alt={`Foto de ${e.nombre}`} width={800} height={600} className="absolute inset-0 size-full object-cover" />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-huella"><Especie aria-hidden="true" size={56} /></span>
                )}
              </div>
              <div className="flex flex-col gap-3 p-5 md:p-7">
                <p className="flex flex-wrap gap-2">
                  <EtiquetaEstadoExtraviado e={e} />
                  {e.demo && <span className="rounded-full bg-crema-clara px-2.5 py-1 text-[11px] font-semibold text-cafe">Ejemplo</span>}
                </p>
                <h2 className="font-titulo text-3xl font-bold leading-tight text-cafe">{e.nombre}</h2>
                <p className="text-sm text-cafe-suave">
                  {e.especie === 'gato' ? 'Gato' : 'Perro'}
                  {e.raza ? ` · ${e.raza}` : ''}
                </p>
                <p className="flex items-start gap-2 text-sm text-cafe">
                  <MapPin aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-cafe-suave" />
                  Vista por última vez en {e.zona}, el {formatearFecha(e.fecha, e.fecha.slice(0, 4) !== hoy.slice(0, 4))}
                </p>
                <p className="text-sm text-cafe-suave">Reporta {e.tutor}</p>
              </div>
            </div>
          </header>

          <LineaTiempo e={e} />

          <section aria-labelledby="titulo-reconocer" className={`p-5 md:p-7 ${clasesTarjeta}`}>
            <h3 id="titulo-reconocer" className="font-titulo text-xl font-bold text-cafe">Cómo reconocerla</h3>
            <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-cafe">{e.descripcion || 'No hay señas particulares. Revisa la foto.'}</p>
          </section>

          <section aria-labelledby="titulo-foro" className="flex flex-col gap-4">
            <div>
              <h3 id="titulo-foro" className="font-titulo text-xl font-bold text-cafe">
                {e.foroId ? 'Foro comunitario' : 'Avistamientos y comentarios'}
              </h3>
              {e.foroId && (
                <p className="text-sm text-cafe-suave">
                  {e.foroEstado === 'abierto' ? 'El foro se abrió al cumplirse 5 días sin noticias.' : 'El foro está cerrado. El historial se conserva.'}
                </p>
              )}
            </div>

            {activo && usuarioId ? (
              <FormularioMensaje e={e} usuarioId={usuarioId} onListo={() => { mensajes.recargar(); lugar.recargar() }} />
            ) : !activo ? (
              <p role="status" className="rounded-2xl bg-crema p-4 text-sm text-cafe-suave">
                Este reporte está cerrado y ya no recibe mensajes. Puedes consultar el historial.
              </p>
            ) : null}

            {mensajes.cargando ? (
              <p role="status" className="text-sm text-cafe-suave">Cargando mensajes…</p>
            ) : mensajes.error ? (
              <div role="alert" className={`flex flex-col items-start gap-3 p-4 text-sm ${clasesTarjeta}`}>
                {mensajes.error}
                <button type="button" onClick={mensajes.recargar} className="min-h-11 font-semibold text-naranja-sombra underline">Reintentar</button>
              </div>
            ) : lista.length === 0 ? (
              <p role="status" className="text-sm text-cafe-suave">Todavía no hay avistamientos. Si la ves, cuéntanos dónde.</p>
            ) : (
              <ul className="m-0 flex list-none flex-col divide-y divide-borde-calido p-0">
                {lista.map((m) => (
                  <li key={m.id} className="flex flex-col gap-1.5 py-4">
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-cafe-suave">
                      <span className="font-semibold text-cafe">{m.autor}</span>
                      <span>{haceCuanto(m.creadoEn, ahora)}</span>
                      <span className={`rounded-full px-2 py-px text-[11px] font-semibold ${m.tipo === 'avistamiento' ? 'bg-menta-suave text-salud-trazo' : 'bg-aviso-fondo text-cafe'}`}>
                        {m.tipo === 'avistamiento' ? 'Avistamiento' : 'Comentario'}
                      </span>
                      {m.demo && <span className="rounded-full bg-crema-clara px-2 py-px text-[11px] font-semibold text-cafe">Ejemplo</span>}
                    </p>
                    <p className="text-[15px] leading-snug text-cafe">{m.texto}</p>
                    {m.zona && (
                      <p className="flex items-center gap-1.5 text-[13px] text-cafe-suave">
                        <MapPin aria-hidden="true" size={13} />
                        {m.zona}
                      </p>
                    )}
                    {m.foto && <img src={m.foto} alt={`Foto compartida por ${m.autor}`} loading="lazy" className="mt-1 max-h-72 w-fit max-w-full rounded-2xl object-cover" />}
                    {(m.mio || e.esMio) && (
                      <button
                        type="button"
                        onClick={async () => { await borrarMensaje(m.id).catch(() => undefined); mensajes.recargar(); lugar.recargar() }}
                        className={`inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-semibold text-naranja-sombra underline ${clasesFoco}`}
                      >
                        <Trash2 aria-hidden="true" size={15} />
                        {m.mio ? 'Borrar mi mensaje' : 'Quitar este mensaje'}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside aria-label="Acciones del reporte" className={`flex flex-col gap-4 p-5 lg:sticky lg:top-6 ${clasesTarjeta}`}>
          <p className="flex items-start gap-2 text-[13px] leading-snug text-cafe-suave">
            <ShieldAlert aria-hidden="true" size={17} className="mt-0.5 shrink-0" />
            Por privacidad no mostramos domicilios ni teléfonos. La zona es aproximada.
          </p>

          {activo && !e.esMio && (
            e.contactoWhatsapp ? (
              <>
                <button
                  type="button"
                  onClick={contactar}
                  disabled={contacto.cargando}
                  className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-naranja px-6 text-[15px] font-semibold text-white shadow-boton ${clasesFoco}`}
                >
                  <MessageCircle aria-hidden="true" size={18} />
                  {contacto.cargando ? 'Abriendo…' : 'Contactar por WhatsApp'}
                </button>
                {contacto.error && <MensajeError id="error-contacto">{contacto.error}</MensajeError>}
              </>
            ) : (
              <p className="rounded-2xl bg-crema p-3 text-sm text-cafe">
                El tutor no compartió su WhatsApp. Publica un avistamiento y recibirá una notificación al instante.
              </p>
            )
          )}

          <button
            type="button"
            onClick={compartir}
            className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-barra-borde bg-white px-6 text-[15px] font-semibold text-cafe ${clasesFoco}`}
          >
            {copiado ? <Check aria-hidden="true" size={18} /> : typeof navigator.share === 'function' ? <Share2 aria-hidden="true" size={18} /> : <Link2 aria-hidden="true" size={18} />}
            {copiado ? 'Enlace copiado' : 'Compartir'}
          </button>
          {ref}

          {e.esMio && activo && (
            <div className="flex flex-col gap-3 border-t border-borde-calido pt-4">
              <h3 className="font-titulo text-base font-bold text-cafe">Tu reporte</h3>
              {confirmar ? (
                <div role="alertdialog" aria-labelledby="titulo-confirmar" className="flex flex-col gap-3 rounded-2xl bg-amarillo-suave p-4">
                  <p id="titulo-confirmar" className="text-sm font-semibold text-cafe">
                    {confirmar === 'localizada' ? `¿${e.nombre} ya está contigo?` : '¿Cerrar el reporte sin haberla encontrado?'}
                  </p>
                  <p className="text-xs text-cafe-suave">Se cerrará el foro, se avisará a quienes participaron y el historial se conserva.</p>
                  {accion.error && <MensajeError id="error-accion">{accion.error}</MensajeError>}
                  <div className="flex gap-2">
                    <button type="button" disabled={accion.cargando} onClick={() => cerrar(confirmar === 'localizada')} className={`min-h-11 flex-1 rounded-full bg-naranja px-4 text-sm font-semibold text-white ${clasesFoco}`}>
                      {accion.cargando ? 'Guardando…' : 'Sí, confirmar'}
                    </button>
                    <button type="button" onClick={() => setConfirmar(null)} className={`min-h-11 flex-1 rounded-full border border-borde-calido bg-white px-4 text-sm font-semibold text-cafe ${clasesFoco}`}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <BotonPrincipal onClick={() => setConfirmar('localizada')}>Ya la encontré</BotonPrincipal>
                  <button type="button" onClick={() => setConfirmar('cerrar')} className={`min-h-11 text-sm font-semibold text-naranja-sombra underline ${clasesFoco}`}>
                    Cerrar el reporte
                  </button>
                </>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
