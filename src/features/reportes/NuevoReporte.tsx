import { Camera, CircleAlert, Dog, HeartCrack, MapPin, ShieldAlert, ShoppingBag, Siren, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ComponentType, FormEvent, ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AreaTexto from '../../components/ui/AreaTexto'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import BotonSecundario from '../../components/ui/BotonSecundario'
import CampoBase from '../../components/ui/CampoBase'
import CampoTexto from '../../components/ui/CampoTexto'
import EncabezadoCurvo from '../../components/ui/EncabezadoCurvo'
import IndicadorPasos from '../../components/ui/IndicadorPasos'
import MensajeError from '../../components/ui/MensajeError'
import Tarjeta from '../../components/ui/Tarjeta'
import { hoyISO } from '../../lib/edad'
import { formatearFecha } from '../../lib/fechas'
import { reducirImagen } from '../../lib/imagen'
import { enviarReporte, enviosDisponibles } from '../../lib/reportes'
import {
  validarCalle,
  validarColonia,
  validarDescripcionReporte,
  validarFechaHechos,
  validarReferencias,
  validarTelefonoOpcional,
} from '../../lib/validaciones'
import { TIPOS_REPORTE, tituloTipo } from '../../types/reporte'
import type { TipoReporte } from '../../types/reporte'
import { useCampos } from '../auth/useCampos'
import type { Reglas } from '../auth/useCampos'
import { useRutaAtras } from './useRutaAtras'

type Valores = {
  colonia: string
  calle: string
  referencias: string
  descripcion: string
  fecha: string
  telefono: string
  /** Campo trampa para bots: las personas nunca lo ven ni lo llenan. */
  web: string
}

const reglas: Reglas<Valores> = {
  colonia: validarColonia,
  calle: validarCalle,
  referencias: validarReferencias,
  descripcion: validarDescripcionReporte,
  fecha: (v) => validarFechaHechos(v),
  telefono: validarTelefonoOpcional,
  web: () => null,
}

const PASOS = ['Tipo', 'Ubicación', 'Evidencia', 'Enviar']
const CAMPOS_POR_PASO: (keyof Valores)[][] = [
  [],
  ['colonia', 'calle', 'referencias'],
  ['descripcion', 'fecha'],
  ['telefono'],
]
const MAX_FOTOS = 3

type Icono = ComponentType<{ size?: number; 'aria-hidden'?: boolean | 'true' | 'false'; className?: string }>
const ICONOS: Record<TipoReporte, { icono: Icono; clase: string }> = {
  maltrato: { icono: ShieldAlert, clase: 'text-coral' },
  abandono: { icono: HeartCrack, clase: 'text-naranja' },
  herido: { icono: Siren, clase: 'text-coral' },
  suelto: { icono: Dog, clase: 'text-naranja' },
  venta: { icono: ShoppingBag, clase: 'text-naranja' },
  otro: { icono: CircleAlert, clase: 'text-naranja' },
}

const mensajeDe = (e: unknown, porDefecto: string) =>
  // Los DOMException del navegador vienen en inglés: se cambian por un mensaje claro.
  e instanceof Error && !(e instanceof DOMException) ? e.message : porDefecto

export default function NuevoReporte() {
  const [paso, setPaso] = useState(1)
  /** Cuando se corrige algo desde el resumen, al terminar ese paso se regresa al resumen. */
  const [corrigiendo, setCorrigiendo] = useState(false)
  const [tipo, setTipo] = useState<TipoReporte>()
  const [errorTipo, setErrorTipo] = useState<string>()
  const [coords, setCoords] = useState<{ lat: number; lng: number }>()
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false)
  const [errorUbicacion, setErrorUbicacion] = useState<string>()
  const [fotos, setFotos] = useState<string[]>([])
  const [errorFotos, setErrorFotos] = useState<string>()
  const [procesandoFoto, setProcesandoFoto] = useState(false)
  const [acepta, setAcepta] = useState(false)
  const [errorAcepta, setErrorAcepta] = useState<string>()
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState<string>()
  const [disponibles, setDisponibles] = useState<number>()
  const [hoy] = useState(() => new Date())
  const entradaFotos = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const atras = useRutaAtras()
  const { valores, campo, cambiar, validar } = useCampos<Valores>(
    { colonia: '', calle: '', referencias: '', descripcion: '', fecha: hoyISO(hoy), telefono: '', web: '' },
    reglas,
  )

  // Al cambiar de paso, el foco pasa al título del paso nuevo.
  const tituloPaso = useRef<HTMLHeadingElement>(null)
  const primerRender = useRef(true)
  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false
      return
    }
    tituloPaso.current?.focus()
  }, [paso])

  // Se avisa de entrada si ya se llegó al límite, para no hacer llenar todo en vano.
  useEffect(() => {
    enviosDisponibles().then(setDisponibles)
  }, [])

  function usarUbicacion() {
    if (!('geolocation' in navigator)) {
      setErrorUbicacion('Tu navegador no permite obtener la ubicación. Escribe la dirección.')
      return
    }
    setErrorUbicacion(undefined)
    setBuscandoUbicacion(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: Math.round(pos.coords.latitude * 1e4) / 1e4,
          lng: Math.round(pos.coords.longitude * 1e4) / 1e4,
        })
        setBuscandoUbicacion(false)
      },
      (error) => {
        setBuscandoUbicacion(false)
        setErrorUbicacion(
          error.code === error.PERMISSION_DENIED
            ? 'No diste permiso para usar tu ubicación. Escribe la dirección.'
            : 'No pudimos obtener tu ubicación. Escribe la dirección.',
        )
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    )
  }

  async function elegirFotos(archivos: FileList | null) {
    if (!archivos?.length) return
    setErrorFotos(undefined)
    setProcesandoFoto(true)
    const nuevas: string[] = []
    let error: string | undefined
    try {
      for (const archivo of Array.from(archivos).slice(0, MAX_FOTOS - fotos.length)) {
        try {
          // Al redibujarla se descartan los metadatos, incluida la ubicación de la foto.
          nuevas.push(await reducirImagen(archivo, 1000))
        } catch (e) {
          error = mensajeDe(e, 'No pudimos leer una de las imágenes. Prueba con otra foto.')
        }
      }
      if (archivos.length > MAX_FOTOS - fotos.length) error ??= `Solo puedes agregar ${MAX_FOTOS} fotos.`
    } finally {
      setFotos((f) => [...f, ...nuevas])
      setErrorFotos(error)
      setProcesandoFoto(false)
      if (entradaFotos.current) entradaFotos.current.value = ''
    }
  }

  function irA(destino: number, corregir = false) {
    setCorrigiendo(corregir)
    setPaso(destino)
  }

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (paso === 1 && !tipo) {
      setErrorTipo('Elige el tipo de reporte.')
      return
    }
    const primero = validar(CAMPOS_POR_PASO[paso - 1])
    if (primero) {
      ;(e.currentTarget.elements.namedItem(primero) as HTMLElement | null)?.focus()
      return
    }
    if (paso < PASOS.length) {
      setPaso(corrigiendo ? PASOS.length : paso + 1)
      setCorrigiendo(false)
      return
    }
    if (!acepta) {
      setErrorAcepta('Para enviar el reporte debes aceptar el aviso de privacidad.')
      return
    }
    if (!tipo || procesandoFoto) return

    setEnviando(true)
    setErrorEnvio(undefined)
    try {
      const folio = await enviarReporte(
        {
          tipo,
          colonia: valores.colonia.trim(),
          calle: valores.calle.trim(),
          referencias: valores.referencias.trim(),
          ...coords,
          descripcion: valores.descripcion.trim(),
          fechaHechos: valores.fecha,
          fotos,
          telefono: valores.telefono.trim() || undefined,
        },
        valores.web,
      )
      navigate('/reportar/enviado', { replace: true, state: { folio } })
    } catch (error) {
      setErrorEnvio(mensajeDe(error, 'No pudimos enviar tu reporte. Inténtalo de nuevo.'))
      setEnviando(false)
    }
  }

  const sinEnvios = disponibles === 0

  return (
    <>
      <EncabezadoCurvo titulo="Hacer un reporte" atras={atras} />
      <main className="flex flex-col gap-6 px-5 pb-10 pt-6">
        <IndicadorPasos pasos={PASOS} actual={paso} etiqueta="Progreso del reporte" />

        {sinEnvios ? (
          <Tarjeta role="alert" className="flex items-start gap-3 p-4 text-sm">
            <CircleAlert aria-hidden="true" size={20} className="mt-0.5 shrink-0 text-coral" />
            <p>
              Ya enviaste el máximo de reportes de las últimas 24 horas desde este dispositivo. Si es una
              emergencia, llama al <strong>911</strong>.
            </p>
          </Tarjeta>
        ) : (
          <form noValidate onSubmit={enviar} aria-labelledby="titulo-paso" className="flex flex-col gap-6">
            <div>
              <h2
                id="titulo-paso"
                ref={tituloPaso}
                tabIndex={-1}
                className="font-titulo text-lg font-semibold outline-none"
              >
                {['¿Qué quieres reportar?', '¿Dónde está?', 'Cuéntanos qué pasó', 'Revisa y envía'][paso - 1]}
              </h2>
              <p className="text-[13px] text-cafe-suave">
                {paso === 1
                  ? 'Elige la opción que más se parezca.'
                  : paso === 4
                    ? 'No necesitas cuenta. Tu reporte es anónimo, salvo que dejes un teléfono.'
                    : 'Los campos con * son obligatorios.'}
              </p>
            </div>

            {/* Campo trampa: oculto para personas y lectores de pantalla; los bots lo llenan. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>
                No llenar
                <input
                  type="text"
                  name="referido"
                  tabIndex={-1}
                  autoComplete="off"
                  value={valores.web}
                  onChange={(e) => cambiar('web', e.target.value)}
                />
              </label>
            </div>

            {paso === 1 && (
              <>
                <Tarjeta className="flex items-start gap-3 p-4 text-sm">
                  <Siren aria-hidden="true" size={22} className="mt-0.5 shrink-0 text-coral" />
                  <p>
                    Si hay una persona en peligro o una emergencia, llama al <strong>911</strong>. Este
                    reporte no sustituye a la autoridad.
                  </p>
                </Tarjeta>
                <fieldset aria-describedby={errorTipo ? 'error-tipo' : undefined} className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
                  <legend className="sr-only">Tipo de reporte</legend>
                  {TIPOS_REPORTE.map((t) => {
                    const { icono: Icono, clase } = ICONOS[t.id]
                    return (
                      <label
                        key={t.id}
                        className="flex min-h-16 cursor-pointer items-center gap-3 rounded-dato border-2 border-barra-borde bg-white px-4 py-3 shadow-tarjeta has-checked:border-naranja has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-naranja"
                      >
                        <input
                          type="radio"
                          name="tipo"
                          value={t.id}
                          checked={tipo === t.id}
                          onChange={() => {
                            setTipo(t.id)
                            setErrorTipo(undefined)
                          }}
                          className="size-5 shrink-0 accent-naranja"
                        />
                        <Icono aria-hidden="true" size={24} className={`shrink-0 ${clase}`} />
                        <span>
                          <span className="block text-sm font-semibold leading-snug">{t.titulo}</span>
                          <span className="block text-[13px] leading-snug text-cafe-suave">{t.detalle}</span>
                        </span>
                      </label>
                    )
                  })}
                </fieldset>
                {errorTipo && <MensajeError id="error-tipo">{errorTipo}</MensajeError>}
              </>
            )}

            {paso === 2 && (
              <>
                <CampoTexto label="Colonia o sector *" autoComplete="off" enterKeyHint="next" required {...campo('colonia')} />
                <CampoTexto
                  label="Calle, número o cruce *"
                  autoComplete="off"
                  enterKeyHint="next"
                  required
                  {...campo('calle')}
                />
                <AreaTexto
                  label="Referencias (opcional)"
                  ayuda="Por ejemplo: «Frente a la tienda, junto al lote baldío»."
                  maxLength={200}
                  {...campo('referencias')}
                />

                <div className="flex flex-col gap-2">
                  <BotonSecundario className="gap-2" disabled={buscandoUbicacion} onClick={usarUbicacion}>
                    <MapPin aria-hidden="true" size={20} />
                    {buscandoUbicacion ? 'Buscando ubicación…' : 'Usar mi ubicación'}
                  </BotonSecundario>
                  <p className="text-[13px] text-cafe-suave">
                    Opcional. Úsala solo si el animal está donde tú estás; te pedirá permiso.
                  </p>
                  <div role="status" className="text-sm font-semibold text-salud-trazo empty:hidden">
                    {coords && 'Guardamos tu ubicación actual.'}
                  </div>
                  {errorUbicacion && <MensajeError id="error-ubicacion">{errorUbicacion}</MensajeError>}
                  {coords && (
                    <button
                      type="button"
                      onClick={() => setCoords(undefined)}
                      className="min-h-11 w-fit text-sm font-semibold text-naranja-sombra underline"
                    >
                      Quitar ubicación
                    </button>
                  )}
                </div>
              </>
            )}

            {paso === 3 && (
              <>
                <AreaTexto
                  label="Descripción de los hechos *"
                  ayuda="Qué viste, cuántos animales, desde cuándo y cómo están."
                  rows={5}
                  maxLength={800}
                  required
                  {...campo('descripcion')}
                />
                <CampoTexto
                  label="Fecha aproximada *"
                  type="date"
                  max={hoyISO(hoy)}
                  autoComplete="off"
                  required
                  {...campo('fecha')}
                />

                <CampoBase label={`Fotos (opcional, máximo ${MAX_FOTOS})`} error={errorFotos}>
                  {(control) => (
                    <input
                      {...control}
                      ref={entradaFotos}
                      name="fotos"
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={fotos.length >= MAX_FOTOS || procesandoFoto}
                      onChange={(e) => elegirFotos(e.target.files)}
                      className="block w-full text-sm text-cafe-suave file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-boton file:border-2 file:border-barra-borde file:bg-white file:px-4 file:text-[15px] file:font-semibold file:text-cafe focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-naranja disabled:opacity-60"
                    />
                  )}
                </CampoBase>
                <p className="-mt-3 flex items-start gap-2 text-[13px] text-cafe-suave">
                  <Camera aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
                  Quitamos de las fotos los datos ocultos, como la ubicación donde se tomaron.
                </p>

                {procesandoFoto && (
                  <p role="status" className="text-sm text-cafe-suave">
                    Preparando las fotos…
                  </p>
                )}
                {fotos.length > 0 && (
                  <ul className="m-0 grid list-none grid-cols-3 gap-2 p-0">
                    {fotos.map((f, i) => (
                      <li key={f.slice(-40) + i} className="relative">
                        <img
                          src={f}
                          alt={`Foto de evidencia ${i + 1}`}
                          className="h-24 w-full rounded-dato object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFotos((fs) => fs.filter((_, j) => j !== i))}
                          aria-label={`Quitar foto de evidencia ${i + 1}`}
                          className="absolute -right-1 -top-1 flex size-11 items-center justify-center"
                        >
                          <span className="flex size-7 items-center justify-center rounded-full bg-cafe text-white">
                            <X aria-hidden="true" size={16} />
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {paso === 4 && (
              <>
                <Tarjeta className="flex flex-col gap-3 p-4">
                  <Resumen titulo="Tipo" onCambiar={() => irA(1, true)} etiqueta="el tipo de reporte">
                    {tipo && tituloTipo(tipo)}
                  </Resumen>
                  <Resumen titulo="Ubicación" onCambiar={() => irA(2, true)} etiqueta="la ubicación">
                    {valores.calle.trim()}, {valores.colonia.trim()}
                    {valores.referencias.trim() && ` (${valores.referencias.trim()})`}
                    {coords && ' · con tu ubicación actual'}
                  </Resumen>
                  <Resumen titulo="Hechos" onCambiar={() => irA(3, true)} etiqueta="la descripción y las fotos">
                    <span className="block">{formatearFecha(valores.fecha)}</span>
                    <span className="block">{valores.descripcion.trim()}</span>
                    <span className="block text-cafe-suave">
                      {fotos.length === 0 ? 'Sin fotos' : `${fotos.length} ${fotos.length === 1 ? 'foto' : 'fotos'}`}
                    </span>
                  </Resumen>
                </Tarjeta>

                <CampoTexto
                  label="Teléfono de contacto (opcional)"
                  ayuda="Si lo dejas, la autoridad podrá llamarte para dar seguimiento. Si no, el reporte es anónimo."
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  enterKeyHint="done"
                  {...campo('telefono')}
                />

                <div className="flex flex-col gap-1">
                  <div className="flex items-start gap-3">
                    <input
                      id="acepta-aviso"
                      name="acepta"
                      type="checkbox"
                      checked={acepta}
                      aria-invalid={errorAcepta ? true : undefined}
                      aria-describedby={errorAcepta ? 'error-acepta' : undefined}
                      onChange={(e) => {
                        setAcepta(e.target.checked)
                        setErrorAcepta(undefined)
                      }}
                      className="mt-1.5 size-6 shrink-0 accent-naranja"
                    />
                    <label htmlFor="acepta-aviso" className="py-1.5 text-sm">
                      Leí el{' '}
                      <Link
                        to="/privacidad?desde=reportar"
                        target="_blank"
                        rel="noopener"
                        className="font-semibold text-naranja-sombra underline"
                      >
                        aviso de privacidad
                        <span className="sr-only"> (se abre en otra pestaña)</span>
                      </Link>{' '}
                      y acepto que mi reporte se canalice a la autoridad competente.
                    </label>
                  </div>
                  {errorAcepta && <MensajeError id="error-acepta">{errorAcepta}</MensajeError>}
                </div>
              </>
            )}

            {errorEnvio && <MensajeError id="error-envio">{errorEnvio}</MensajeError>}

            <div className="mt-2 flex flex-col gap-4">
              <BotonPrincipal type="submit" disabled={enviando || procesandoFoto}>
                {paso < PASOS.length
                  ? corrigiendo
                    ? 'Guardar y volver al resumen'
                    : 'Siguiente'
                  : enviando
                    ? 'Enviando…'
                    : 'Enviar reporte'}
              </BotonPrincipal>
              {paso > 1 && (
                <BotonSecundario onClick={() => irA(corrigiendo ? PASOS.length : paso - 1)}>
                  {corrigiendo ? 'Cancelar cambios' : 'Atrás'}
                </BotonSecundario>
              )}
            </div>
          </form>
        )}
      </main>
    </>
  )
}

function Resumen({
  titulo,
  etiqueta,
  onCambiar,
  children,
}: {
  titulo: string
  etiqueta: string
  onCambiar: () => void
  children: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b-2 border-barra-borde pb-3 last:border-0 last:pb-0">
      <div className="min-w-0 text-sm">
        <p className="text-[13px] font-semibold text-cafe-suave">{titulo}</p>
        <div className="break-words">{children}</div>
      </div>
      <button
        type="button"
        onClick={onCambiar}
        aria-label={`Cambiar ${etiqueta}`}
        className="min-h-11 shrink-0 text-sm font-semibold text-naranja-sombra underline"
      >
        Cambiar
      </button>
    </div>
  )
}
