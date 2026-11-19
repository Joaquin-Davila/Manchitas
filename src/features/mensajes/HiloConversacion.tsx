import { Archive, ArchiveRestore, ArrowLeft, Check, CheckCheck, EllipsisVertical, Flag, ImagePlus, MapPin, Send, ShieldBan, ShieldCheck, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import MensajeError from '../../components/ui/MensajeError'
import {
  archivarConversacion,
  bloquearUsuario,
  enlaceUbicacionChat,
  enviarFoto,
  enviarTexto,
  enviarUbicacion,
  estadoDeMensaje,
  NOMBRE_MOTIVO,
  NOMBRE_TIPO_CHAT,
  PREDEFINIDOS,
  reportarConversacion,
  urlFotoChat,
} from '../../lib/chat'
import type { Conversacion, MensajeChat, MotivoReporteChat } from '../../lib/chat'
import { reducirImagen } from '../../lib/imagen'
import { clasesFoco } from '../mascotas/inicio/comun'
import { AvatarConversacion } from './ListaConversaciones'

const hora = new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit' })
const dia = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })

function rutaContexto(c: Conversacion): string | undefined {
  if (!c.contextoId) return undefined
  if (c.tipo === 'extraviado') return `/comunidad/extraviadas/${c.contextoId}`
  if (c.tipo === 'veterinaria') return `/comunidad/veterinarias/${c.contextoId}`
  if (c.tipo === 'adopcion') return '/comunidad?tab=adopcion'
  return undefined
}

function FotoChat({ ruta }: { ruta: string }) {
  const [url, setUrl] = useState<string>()
  useEffect(() => {
    let vigente = true
    urlFotoChat(ruta).then((u) => {
      if (vigente) setUrl(u)
    })
    return () => {
      vigente = false
    }
  }, [ruta])
  return url ? (
    <img src={url} alt="Foto compartida en la conversación" loading="lazy" className="max-h-64 w-full rounded-xl object-cover" />
  ) : (
    <span className="flex h-32 w-full items-center justify-center rounded-xl bg-crema text-xs text-cafe-suave">Cargando foto…</span>
  )
}

function Palomitas({ m, otroLeidoEn }: { m: MensajeChat; otroLeidoEn: string }) {
  const e = estadoDeMensaje(m, otroLeidoEn)
  return (
    <span className="inline-flex items-center gap-0.5" title={e === 'leido' ? 'Leído' : e === 'recibido' ? 'Recibido' : 'Enviado'}>
      {e === 'enviado' ? <Check aria-hidden="true" size={13} /> : <CheckCheck aria-hidden="true" size={13} className={e === 'leido' ? 'text-celeste' : ''} />}
      <span className="sr-only">{e === 'leido' ? 'Leído' : e === 'recibido' ? 'Recibido' : 'Enviado'}</span>
    </span>
  )
}

function Burbuja({ m, otroLeidoEn }: { m: MensajeChat; otroLeidoEn: string }) {
  return (
    <li className={`flex ${m.mio ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] flex-col gap-1.5 rounded-2xl px-3.5 py-2 md:max-w-[70%] ${m.mio ? 'rounded-br-md bg-naranja text-white' : 'rounded-bl-md bg-white text-cafe shadow-suave'}`}>
        {m.tipo === 'foto' && m.foto && <FotoChat ruta={m.foto} />}
        {m.tipo === 'ubicacion' && m.lat !== undefined && m.lng !== undefined && (
          <a
            href={enlaceUbicacionChat(m.lat, m.lng)}
            target="_blank"
            rel="noreferrer"
            className={`flex items-center gap-2 rounded-xl p-2 text-sm font-semibold underline ${m.mio ? 'bg-white/15' : 'bg-crema'}`}
          >
            <MapPin aria-hidden="true" size={18} className="shrink-0" />
            <span>
              {m.zona || 'Ubicación'} <span className="block text-xs font-normal opacity-90">Ubicación aproximada · abrir en el mapa</span>
            </span>
            <span className="sr-only"> (se abre en otra pestaña)</span>
          </a>
        )}
        {m.texto && <p className="whitespace-pre-wrap break-words text-[15px] leading-snug">{m.texto}</p>}
        <p className={`flex items-center justify-end gap-1.5 text-[11px] ${m.mio ? 'text-white/85' : 'text-cafe-suave'}`}>
          {m.demo && <span>Ejemplo ·</span>}
          {hora.format(new Date(m.creadoEn))}
          {m.mio && <Palomitas m={m} otroLeidoEn={otroLeidoEn} />}
        </p>
      </div>
    </li>
  )
}

export default function HiloConversacion({
  c,
  mensajes,
  onCambio,
  volverA,
}: {
  c: Conversacion
  mensajes: MensajeChat[]
  /** Se llama después de enviar, archivar, bloquear... para recargar. */
  onCambio: () => void
  /** Ruta del botón "volver" (solo móvil). */
  volverA: string
}) {
  const [texto, setTexto] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [rapidos, setRapidos] = useState(false)
  const [menu, setMenu] = useState(false)
  const [ubicacion, setUbicacion] = useState<{ lat: number; lng: number } | null>(null)
  const [zona, setZona] = useState('')
  const [reportando, setReportando] = useState(false)
  const [motivo, setMotivo] = useState<MotivoReporteChat>('spam')
  const [detalle, setDetalle] = useState('')
  const [reporteEnviado, setReporteEnviado] = useState(false)
  const fin = useRef<HTMLLIElement>(null)
  const archivo = useRef<HTMLInputElement>(null)
  const dialogoReporte = useRef<HTMLDialogElement>(null)
  const dialogoUbicacion = useRef<HTMLDialogElement>(null)

  const ultimo = mensajes.length
  useEffect(() => {
    fin.current?.scrollIntoView({ block: 'end' })
  }, [ultimo, c.id])

  const bloqueada = c.bloqueado || c.meBloqueo
  const ruta = rutaContexto(c)

  async function accion(f: () => Promise<void>) {
    setError('')
    setEnviando(true)
    try {
      await f()
      onCambio()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos completar la acción.')
    } finally {
      setEnviando(false)
    }
  }

  async function enviar(e?: FormEvent) {
    e?.preventDefault()
    if (!texto.trim() || enviando) return
    const t = texto
    setTexto('')
    setRapidos(false)
    await accion(async () => {
      try {
        await enviarTexto(c.id, t)
      } catch (err) {
        setTexto(t)
        throw err
      }
    })
  }

  function alTeclear(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void enviar()
    }
  }

  async function elegirFoto(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    await accion(async () => enviarFoto(c.id, await reducirImagen(f, 1200)))
  }

  function pedirUbicacion() {
    setError('')
    if (!navigator.geolocation) return setError('Tu navegador no permite obtener la ubicación.')
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setUbicacion({ lat: p.coords.latitude, lng: p.coords.longitude })
        dialogoUbicacion.current?.showModal()
      },
      (err) => setError(err.code === err.PERMISSION_DENIED ? 'No diste permiso para usar tu ubicación.' : 'No pudimos obtener tu ubicación.'),
      { timeout: 10000 },
    )
  }

  async function mandarUbicacion() {
    if (!ubicacion) return
    dialogoUbicacion.current?.close()
    await accion(() => enviarUbicacion(c.id, ubicacion.lat, ubicacion.lng, zona || 'Ubicación aproximada'))
    setZona('')
    setUbicacion(null)
  }

  async function reportar(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await reportarConversacion(c.id, motivo, detalle)
      setReporteEnviado(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos enviar tu reporte.')
    }
  }

  let diaActual = ''
  return (
    <section aria-label={`Conversación con ${c.otroNombre}`} className="flex h-full min-h-0 flex-col overflow-hidden rounded-[24px] border border-borde-calido bg-crema shadow-suave">
      <header className="flex items-center gap-2 border-b border-borde-calido bg-white px-3 py-2.5">
        <Link to={volverA} aria-label="Volver a mis conversaciones" className={`flex size-11 shrink-0 items-center justify-center rounded-full text-cafe lg:hidden ${clasesFoco}`}>
          <ArrowLeft aria-hidden="true" size={20} />
        </Link>
        <AvatarConversacion c={c} tamano="size-11" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-titulo text-base font-bold text-cafe">{c.otroNombre}</h2>
          <p className="truncate text-xs text-cafe-suave">
            {ruta ? (
              <Link to={ruta} className="font-semibold underline">
                {NOMBRE_TIPO_CHAT[c.tipo]}
                {c.contextoTitulo ? ` · ${c.contextoTitulo}` : ''}
              </Link>
            ) : (
              <>
                {NOMBRE_TIPO_CHAT[c.tipo]}
                {c.contextoTitulo ? ` · ${c.contextoTitulo}` : ''}
              </>
            )}
          </p>
        </div>
        <div className="relative">
          <button
            type="button"
            aria-label="Más opciones de la conversación"
            aria-haspopup="menu"
            aria-expanded={menu}
            onClick={() => setMenu((m) => !m)}
            className={`flex size-11 items-center justify-center rounded-full text-cafe hover:bg-crema ${clasesFoco}`}
          >
            <EllipsisVertical aria-hidden="true" size={20} />
          </button>
          {menu && (
            <div role="menu" className="absolute right-0 top-12 z-20 flex w-60 flex-col rounded-2xl border border-borde-calido bg-white p-1.5 shadow-elevada">
              <button role="menuitem" type="button" onClick={() => { setMenu(false); void accion(() => archivarConversacion(c.id, !c.archivada)) }} className={`flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-semibold text-cafe hover:bg-crema ${clasesFoco}`}>
                {c.archivada ? <ArchiveRestore aria-hidden="true" size={17} /> : <Archive aria-hidden="true" size={17} />}
                {c.archivada ? 'Sacar del archivo' : 'Archivar conversación'}
              </button>
              <button role="menuitem" type="button" onClick={() => { setMenu(false); void accion(() => bloquearUsuario(c.otroId, !c.bloqueado)) }} className={`flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-semibold text-cafe hover:bg-crema ${clasesFoco}`}>
                {c.bloqueado ? <ShieldCheck aria-hidden="true" size={17} /> : <ShieldBan aria-hidden="true" size={17} />}
                {c.bloqueado ? 'Desbloquear a esta persona' : 'Bloquear a esta persona'}
              </button>
              <button role="menuitem" type="button" onClick={() => { setMenu(false); setReporteEnviado(false); setReportando(true); setTimeout(() => dialogoReporte.current?.showModal(), 0) }} className={`flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-semibold text-cafe hover:bg-crema ${clasesFoco}`}>
                <Flag aria-hidden="true" size={17} />
                Reportar la conversación
              </button>
            </div>
          )}
        </div>
      </header>

      <ol className="m-0 flex min-h-0 flex-1 list-none flex-col gap-2 overflow-y-auto p-3 md:p-4" aria-live="polite" aria-label="Mensajes">
        {mensajes.length === 0 && <li className="m-auto max-w-xs text-center text-sm text-cafe-suave">Aún no hay mensajes. Escribe el primero o usa un mensaje rápido.</li>}
        {mensajes.map((m) => {
          const d = dia.format(new Date(m.creadoEn))
          const separador = d !== diaActual
          diaActual = d
          return (
            <li key={m.id} className="contents">
              {separador && <span className="my-1 self-center rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize text-cafe-suave">{d}</span>}
              <ul className="m-0 list-none p-0"><Burbuja m={m} otroLeidoEn={c.otroLeidoEn} /></ul>
            </li>
          )
        })}
        <li ref={fin} aria-hidden="true" className="h-px" />
      </ol>

      <div className="border-t border-borde-calido bg-white p-3">
        {bloqueada ? (
          <p role="status" className="rounded-2xl bg-aviso-fondo p-3 text-sm text-cafe">
            {c.bloqueado ? 'Bloqueaste a esta persona: no pueden escribirse. Puedes desbloquearla desde el menú.' : 'Esta persona no puede recibir tus mensajes.'}
          </p>
        ) : (
          <>
            {rapidos && (
              <ul aria-label="Mensajes rápidos" className="m-0 mb-2 flex list-none flex-wrap gap-2 p-0">
                {PREDEFINIDOS[c.tipo].map((p) => (
                  <li key={p}>
                    <button type="button" onClick={() => { setTexto(p); setRapidos(false) }} className={`min-h-11 rounded-full border border-borde-calido bg-crema-clara px-3.5 text-[13px] font-semibold text-cafe ${clasesFoco}`}>
                      {p}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {error && <div className="mb-2"><MensajeError id="error-chat">{error}</MensajeError></div>}
            <form onSubmit={enviar} className="flex items-end gap-1.5">
              <button type="button" aria-label="Mensajes rápidos" aria-pressed={rapidos} onClick={() => setRapidos((r) => !r)} className={`flex size-11 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${rapidos ? 'bg-naranja text-white' : 'bg-crema text-cafe'} ${clasesFoco}`}>
                Aa
              </button>
              <button type="button" aria-label="Enviar una foto" disabled={enviando} onClick={() => archivo.current?.click()} className={`flex size-11 shrink-0 items-center justify-center rounded-full bg-crema text-cafe ${clasesFoco}`}>
                <ImagePlus aria-hidden="true" size={20} />
              </button>
              <input ref={archivo} type="file" accept="image/*" onChange={elegirFoto} className="sr-only" tabIndex={-1} aria-label="Elegir una foto" />
              <button type="button" aria-label="Enviar mi ubicación aproximada" disabled={enviando} onClick={pedirUbicacion} className={`flex size-11 shrink-0 items-center justify-center rounded-full bg-crema text-cafe ${clasesFoco}`}>
                <MapPin aria-hidden="true" size={20} />
              </button>
              <label htmlFor="texto-chat" className="sr-only">Escribe un mensaje</label>
              <textarea
                id="texto-chat"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={alTeclear}
                maxLength={1000}
                rows={1}
                placeholder="Escribe un mensaje"
                className="max-h-28 min-h-11 flex-1 resize-none rounded-2xl border border-borde-calido bg-crema-clara px-3.5 py-2.5 text-[15px] text-cafe outline-none focus-visible:border-naranja focus-visible:ring-2 focus-visible:ring-naranja/25"
              />
              <button type="submit" aria-label="Enviar mensaje" disabled={enviando || !texto.trim()} className={`flex size-11 shrink-0 items-center justify-center rounded-full bg-naranja text-white disabled:opacity-50 ${clasesFoco}`}>
                <Send aria-hidden="true" size={19} />
              </button>
            </form>
            <p className="mt-1.5 text-[11px] text-cafe-suave">No compartas tu teléfono ni datos privados. Las ubicaciones se redondean (unos 1,000 m).</p>
          </>
        )}
      </div>

      <dialog ref={dialogoUbicacion} aria-labelledby="titulo-ubicacion" className="m-auto w-[min(380px,calc(100%-32px))] rounded-[24px] bg-crema p-5 text-cafe shadow-tarjeta backdrop:bg-cafe/50" onClose={() => setUbicacion(null)}>
        <div className="flex items-start justify-between gap-2">
          <h3 id="titulo-ubicacion" className="font-titulo text-lg font-bold">Enviar ubicación aproximada</h3>
          <button type="button" aria-label="Cerrar" onClick={() => dialogoUbicacion.current?.close()} className="-mr-2 -mt-1 flex size-11 items-center justify-center rounded-full"><X aria-hidden="true" size={20} /></button>
        </div>
        <p className="mt-1 text-sm text-cafe-suave">Compartiremos un punto redondeado (no tu ubicación exacta). Puedes ponerle un nombre de zona.</p>
        <label htmlFor="zona-ubicacion" className="mt-3 block text-sm font-semibold">Zona (colonia o calle principal)</label>
        <input id="zona-ubicacion" value={zona} onChange={(e) => setZona(e.target.value)} maxLength={120} className="mt-1 h-12 w-full rounded-2xl border border-borde-calido bg-white px-4 text-[15px] outline-none focus-visible:border-naranja focus-visible:ring-2 focus-visible:ring-naranja/25" />
        <div className="mt-4 flex flex-col gap-2">
          <BotonPrincipal onClick={mandarUbicacion}>Enviar ubicación</BotonPrincipal>
        </div>
      </dialog>

      {reportando && (
        <dialog ref={dialogoReporte} aria-labelledby="titulo-reporte-chat" onClose={() => setReportando(false)} className="m-auto w-[min(420px,calc(100%-32px))] rounded-[24px] bg-crema p-5 text-cafe shadow-tarjeta backdrop:bg-cafe/50">
          <div className="flex items-start justify-between gap-2">
            <h3 id="titulo-reporte-chat" className="font-titulo text-lg font-bold">Reportar la conversación</h3>
            <button type="button" aria-label="Cerrar" onClick={() => dialogoReporte.current?.close()} className="-mr-2 -mt-1 flex size-11 items-center justify-center rounded-full"><X aria-hidden="true" size={20} /></button>
          </div>
          {reporteEnviado ? (
            <div role="status" className="mt-3 flex flex-col gap-3">
              <p className="text-sm">Recibimos tu reporte. Un moderador lo revisará. Mientras tanto, puedes bloquear a la otra persona desde el menú.</p>
              <BotonPrincipal onClick={() => dialogoReporte.current?.close()}>Listo</BotonPrincipal>
            </div>
          ) : (
            <form onSubmit={reportar} className="mt-3 flex flex-col gap-3">
              <fieldset className="m-0 flex min-w-0 flex-col gap-1.5 border-0 p-0">
                <legend className="mb-1 text-sm font-semibold">Motivo</legend>
                {(Object.keys(NOMBRE_MOTIVO) as MotivoReporteChat[]).map((m) => (
                  <label key={m} className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm">
                    <input type="radio" name="motivo-chat" value={m} checked={motivo === m} onChange={() => setMotivo(m)} className="size-5 accent-naranja" />
                    {NOMBRE_MOTIVO[m]}
                  </label>
                ))}
              </fieldset>
              <div>
                <label htmlFor="detalle-reporte-chat" className="text-sm font-semibold">Cuéntanos más (opcional)</label>
                <textarea id="detalle-reporte-chat" value={detalle} onChange={(e) => setDetalle(e.target.value)} maxLength={500} rows={3} className="mt-1 w-full rounded-2xl border border-borde-calido bg-white p-3 text-[15px] outline-none focus-visible:border-naranja focus-visible:ring-2 focus-visible:ring-naranja/25" />
              </div>
              {error && <MensajeError id="error-reporte-chat">{error}</MensajeError>}
              <BotonPrincipal type="submit">Enviar reporte</BotonPrincipal>
            </form>
          )}
        </dialog>
      )}
    </section>
  )
}
