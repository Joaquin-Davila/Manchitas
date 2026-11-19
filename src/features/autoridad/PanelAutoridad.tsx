import { ChevronRight, ExternalLink, Eye, MapPin, Phone, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Encabezado from '../../components/ui/Encabezado'
import MensajeError from '../../components/ui/MensajeError'
import Tarjeta from '../../components/ui/Tarjeta'
import { hoyISO } from '../../lib/edad'
import { formatearFecha } from '../../lib/fechas'
import { enlaceUbicacion, listarReportes, urlsEvidencia } from '../../lib/panelAutoridad'
import type { ReporteAutoridad } from '../../lib/panelAutoridad'
import { tituloTipo } from '../../types/reporte'
import type { EstadoReporte } from '../../types/reporte'
import PanelAjustes from '../auth/PanelAjustes'

type Filtro = 'todos' | EstadoReporte
const FILTROS: { id: Filtro; texto: string }[] = [
  { id: 'todos', texto: 'Todos' },
  { id: 'recibido', texto: 'Recibidos' },
  { id: 'canalizado', texto: 'Canalizados' },
]
const TEXTO_ESTADO: Record<EstadoReporte, string> = { recibido: 'Recibido', canalizado: 'Canalizado' }

// Maltrato y animal herido son los urgentes. Coral va de fondo suave: el texto rojo oscuro
// mantiene el contraste de 4.5:1 y la etiqueta no depende solo del color.
const URGENTES = new Set(['maltrato', 'herido'])

const claseFoco = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naranja'

function fechaDeEnvio(iso: string): string {
  const d = new Date(iso)
  const hora = d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  return `${formatearFecha(hoyISO(d))}, ${hora}`
}

function lugar(r: ReporteAutoridad): string {
  return [r.calle, r.colonia].filter(Boolean).join(', ') || 'Sin dirección escrita'
}

function EtiquetaTipo({ r }: { r: ReporteAutoridad }) {
  const urgente = URGENTES.has(r.tipo)
  return (
    <span
      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${urgente ? 'bg-rosa text-error' : 'bg-aviso-fondo text-cafe'}`}
    >
      {tituloTipo(r.tipo)}
    </span>
  )
}

function Dato({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[13px] font-semibold text-cafe-suave">{titulo}</dt>
      <dd className="m-0 break-words text-sm">{children}</dd>
    </div>
  )
}

// Detalle en un modal nativo. Las URLs firmadas se piden solo al abrir y caducan en 5 minutos.
function DetalleReporte({ reporte, alCerrar }: { reporte: ReporteAutoridad; alCerrar: () => void }) {
  const dialogo = useRef<HTMLDialogElement>(null)
  const [fotos, setFotos] = useState<{ id: string; urls: string[]; error: string } | null>(null)

  useEffect(() => {
    dialogo.current?.showModal()
  }, [])

  useEffect(() => {
    if (reporte.fotosPaths.length === 0) return
    let vigente = true
    urlsEvidencia(reporte.fotosPaths)
      .then((urls) => vigente && setFotos({ id: reporte.id, urls, error: '' }))
      .catch((e: Error) => vigente && setFotos({ id: reporte.id, urls: [], error: e.message }))
    return () => {
      vigente = false
    }
  }, [reporte])

  const cargandoFotos = reporte.fotosPaths.length > 0 && fotos?.id !== reporte.id

  return (
    <dialog
      ref={dialogo}
      onClose={alCerrar}
      aria-labelledby="titulo-detalle"
      className="m-auto max-h-[90dvh] w-[min(350px,calc(100%-24px))] overflow-y-auto overscroll-contain rounded-tarjeta bg-crema p-5 text-cafe shadow-tarjeta backdrop:overflow-hidden backdrop:overscroll-contain backdrop:bg-cafe/50"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 id="titulo-detalle" className="font-titulo text-lg font-bold">
            {reporte.folio}
          </h2>
          <div className="mt-1 flex flex-wrap gap-2">
            <EtiquetaTipo r={reporte} />
            <span className="rounded-full bg-celeste px-3 py-1 text-[11px] font-semibold text-franja-texto">
              {TEXTO_ESTADO[reporte.estado]}
            </span>
          </div>
        </div>
        <button
          type="button"
          aria-label="Cerrar detalle"
          onClick={() => dialogo.current?.close()}
          className={`-mr-2 -mt-2 flex size-11 shrink-0 items-center justify-center rounded-full ${claseFoco}`}
        >
          <X aria-hidden="true" size={22} />
        </button>
      </div>

      <dl className="m-0 mt-4 flex flex-col gap-3">
        <Dato titulo="Descripción">
          <span className="whitespace-pre-line">{reporte.descripcion}</span>
        </Dato>
        <Dato titulo="Fecha de los hechos">{formatearFecha(reporte.fechaHechos)}</Dato>
        <Dato titulo="Enviado el">{fechaDeEnvio(reporte.creadoEn)}</Dato>
        <Dato titulo="Dirección">{lugar(reporte)}</Dato>
        {reporte.referencias && <Dato titulo="Referencias">{reporte.referencias}</Dato>}
        <Dato titulo="Contacto de quien reporta">
          {reporte.telefono ? (
            <a
              href={`tel:+52${reporte.telefono}`}
              className={`inline-flex min-h-11 items-center gap-2 font-semibold underline ${claseFoco}`}
            >
              <Phone aria-hidden="true" size={18} />
              {reporte.telefono}
            </a>
          ) : (
            'Reporte anónimo'
          )}
        </Dato>
      </dl>

      {reporte.lat !== null && reporte.lng !== null && (
        <a
          href={enlaceUbicacion(reporte.lat, reporte.lng)}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-salud-fondo px-4 text-[13px] font-semibold text-salud-trazo ${claseFoco}`}
        >
          <MapPin aria-hidden="true" size={18} />
          Ver ubicación en el mapa
          <ExternalLink aria-hidden="true" size={14} />
          <span className="sr-only">(se abre en otra pestaña)</span>
        </a>
      )}

      <section aria-label="Evidencia" className="mt-4">
        <h3 className="text-[13px] font-semibold text-cafe-suave">
          Evidencia ({reporte.fotosPaths.length})
        </h3>
        {reporte.fotosPaths.length === 0 && <p className="text-sm">Este reporte no trae fotos.</p>}
        {cargandoFotos && (
          <p role="status" className="text-sm text-cafe-suave">
            Cargando fotos…
          </p>
        )}
        {fotos?.error && <MensajeError id="error-evidencia">{fotos.error}</MensajeError>}
        {fotos && fotos.id === reporte.id && fotos.urls.length > 0 && (
          <ul className="m-0 mt-2 flex list-none flex-col gap-2 p-0">
            {fotos.urls.map((url, i) => (
              <li key={url}>
                <img
                  src={url}
                  alt={`Evidencia ${i + 1} del reporte ${reporte.folio}`}
                  loading="lazy"
                  className="w-full rounded-[16px] bg-foto-vacia"
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </dialog>
  )
}

type Lista = { filtro: Filtro; reportes: ReporteAutoridad[]; hayMas: boolean; error: string }

export default function PanelAutoridad() {
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [lista, setLista] = useState<Lista | null>(null)
  const [cargandoMas, setCargandoMas] = useState(false)
  const [errorMas, setErrorMas] = useState('')
  const [abierto, setAbierto] = useState<ReporteAutoridad | null>(null)
  const botonAbierto = useRef<HTMLElement | null>(null)

  // Primera página de cada filtro. La lista de otro filtro cuenta como "cargando".
  useEffect(() => {
    let vigente = true
    listarReportes(0, filtro === 'todos' ? undefined : filtro)
      .then((p) => vigente && setLista({ filtro, reportes: p.reportes, hayMas: p.hayMas, error: '' }))
      .catch((e: Error) => vigente && setLista({ filtro, reportes: [], hayMas: false, error: e.message }))
    return () => {
      vigente = false
    }
  }, [filtro])

  const cargando = lista?.filtro !== filtro

  async function cargarMas() {
    if (!lista) return
    setCargandoMas(true)
    setErrorMas('')
    try {
      const p = await listarReportes(
        Math.ceil(lista.reportes.length / 20),
        filtro === 'todos' ? undefined : filtro,
      )
      setLista({ ...lista, reportes: [...lista.reportes, ...p.reportes], hayMas: p.hayMas })
    } catch (e) {
      setErrorMas(e instanceof Error ? e.message : 'No pudimos cargar más reportes.')
    } finally {
      setCargandoMas(false)
    }
  }

  function cerrarDetalle() {
    setAbierto(null)
    botonAbierto.current?.focus()
  }

  return (
    <div className="mx-auto min-h-dvh max-w-[390px] bg-crema">
      <Encabezado titulo="Autoridad" derecha={<PanelAjustes />} />
      <main className="flex flex-col gap-4 px-5 pb-10 pt-[19px]">
        <p className="flex items-center gap-2 text-[13px] text-cafe-suave">
          <Eye aria-hidden="true" size={18} className="shrink-0" />
          Solo lectura. Aquí llegan los reportes ciudadanos para que la autoridad les dé seguimiento.
        </p>

        <div role="group" aria-label="Filtrar por estado" className="flex flex-wrap gap-2">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filtro === f.id}
              onClick={() => setFiltro(f.id)}
              className={`min-h-11 rounded-full px-4 text-[13px] font-semibold ${claseFoco} ${
                filtro === f.id ? 'bg-naranja text-white' : 'bg-aviso-fondo text-cafe'
              }`}
            >
              {f.texto}
            </button>
          ))}
        </div>

        <div role="status" aria-live="polite" className="empty:hidden">
          {cargando && <p className="text-sm text-cafe-suave">Cargando reportes…</p>}
          {!cargando && lista && !lista.error && (
            <p className="text-[13px] text-cafe-suave">
              {lista.reportes.length === 1 ? '1 reporte' : `${lista.reportes.length} reportes`}
              {lista.hayMas ? ' (hay más)' : ''}
            </p>
          )}
        </div>

        {!cargando && lista?.error && <MensajeError id="error-reportes">{lista.error}</MensajeError>}

        {!cargando && lista && !lista.error && lista.reportes.length === 0 && (
          <Tarjeta className="p-4 text-sm text-cafe-suave">No hay reportes con este filtro.</Tarjeta>
        )}

        {!cargando && lista && lista.reportes.length > 0 && (
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {lista.reportes.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  aria-haspopup="dialog"
                  onClick={(e) => {
                    botonAbierto.current = e.currentTarget
                    setAbierto(r)
                  }}
                  className={`flex min-h-11 w-full items-center gap-3 rounded-tarjeta bg-white p-4 text-left shadow-tarjeta ${claseFoco}`}
                >
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <EtiquetaTipo r={r} />
                      <span className="text-[11px] font-semibold text-cafe-suave">
                        {TEXTO_ESTADO[r.estado]}
                      </span>
                    </span>
                    <span className="font-titulo text-base font-semibold">{r.folio}</span>
                    <span className="truncate text-[13px] text-cafe-suave">{lugar(r)}</span>
                    <span className="text-[13px] text-cafe-suave">
                      {formatearFecha(hoyISO(new Date(r.creadoEn)))}
                      {r.fotosPaths.length > 0 &&
                        ` · ${r.fotosPaths.length === 1 ? '1 foto' : `${r.fotosPaths.length} fotos`}`}
                    </span>
                  </span>
                  <ChevronRight aria-hidden="true" size={22} className="shrink-0 text-naranja" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {errorMas && <MensajeError id="error-mas">{errorMas}</MensajeError>}
        {!cargando && lista?.hayMas && (
          <button
            type="button"
            onClick={cargarMas}
            disabled={cargandoMas}
            className={`min-h-11 self-center rounded-full bg-white px-6 text-sm font-semibold shadow-tarjeta ${claseFoco}`}
          >
            {cargandoMas ? 'Cargando…' : 'Ver más reportes'}
          </button>
        )}
      </main>

      {abierto && <DetalleReporte key={abierto.id} reporte={abierto} alCerrar={cerrarDetalle} />}
    </div>
  )
}
