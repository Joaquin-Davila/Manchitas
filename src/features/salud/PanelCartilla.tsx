import {
  ArrowRight,
  Bell,
  BellOff,
  CalendarClock,
  ClipboardList,
  Expand,
  FileImage,
  ImagePlus,
  Info,
  Lock,
  Plus,
  ShieldCheck,
  Stethoscope,
  Syringe,
  Trash2,
  UserPen,
} from 'lucide-react'
import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import { clasesBotonSecundario } from '../../components/ui/BotonSecundario'
import Huella from '../../components/ui/Huella'
import MensajeError from '../../components/ui/MensajeError'
import { hoyISO, textoEdad } from '../../lib/edad'
import { NOMBRE_ESPECIE } from '../../lib/especies'
import { formatearFecha } from '../../lib/fechas'
import { reducirImagen } from '../../lib/imagen'
import type { Cartilla, VacunaAplicada } from '../../types/cartilla'
import type { Mascota } from '../../types/mascota'
import { Aparecer, HuellasDecorativas, clasesTarjeta } from '../mascotas/inicio/comun'
import Dialogo from './Dialogo'
import FormularioVacuna from './FormularioVacuna'
import type { useCartilla } from './useCartilla'

type Props = {
  mascota: Mascota
  cartilla: Cartilla
  acciones: Omit<ReturnType<typeof useCartilla>, 'cartilla' | 'cargando' | 'error'>
}

const foco = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naranja-sombra'

function mensajeDe(error: unknown, porDefecto: string): string {
  // Los DOMException del navegador vienen en inglés: se cambian por un mensaje claro.
  return error instanceof Error && !(error instanceof DOMException) ? error.message : porDefecto
}

/** Origen del dato. Hoy todo lo captura el tutor: no hay validación veterinaria todavía. */
function EtiquetaOrigen() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-aviso-fondo px-2.5 py-1 text-[11px] font-semibold text-cafe">
      <UserPen aria-hidden="true" size={12} />
      Registrado por ti
    </span>
  )
}

function Indicador({ icono, fondo, etiqueta, valor }: { icono: ReactNode; fondo: string; etiqueta: string; valor: ReactNode }) {
  return (
    <li className={`flex flex-col gap-3 p-4 ${clasesTarjeta}`}>
      <span className={`flex size-10 items-center justify-center rounded-xl ${fondo}`}>{icono}</span>
      <div>
        <p className="font-titulo text-2xl font-bold leading-none text-cafe">{valor}</p>
        <p className="mt-1 text-[13px] font-semibold text-cafe-suave">{etiqueta}</p>
      </div>
    </li>
  )
}

function TituloSeccion({ id, children, derecha }: { id: string; children: ReactNode; derecha?: ReactNode }) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h3 id={id} className="font-titulo text-lg font-bold text-cafe md:text-xl">
        {children}
      </h3>
      {derecha}
    </div>
  )
}

export default function PanelCartilla({ mascota, cartilla, acciones }: Props) {
  const [formulario, setFormulario] = useState(false)
  const [detalle, setDetalle] = useState<VacunaAplicada | null>(null)
  const [confirmando, setConfirmando] = useState(false)
  const [verFoto, setVerFoto] = useState(false)
  const [aviso, setAviso] = useState<string>()
  const [error, setError] = useState<string>()
  const [procesandoFoto, setProcesandoFoto] = useState(false)
  const [nueva, setNueva] = useState<string>()
  const entradaFoto = useRef<HTMLInputElement>(null)
  const [hoy] = useState(() => hoyISO())

  const { vacunas, proxima, fotoCartilla } = cartilla
  const vencida = proxima ? proxima.fecha < hoy : false
  const anio = hoy.slice(0, 4)

  async function guardarVacuna(datos: Parameters<typeof acciones.registrarVacuna>[0]) {
    await acciones.registrarVacuna(datos)
    setFormulario(false)
    setError(undefined)
    setAviso(`Registramos ${datos.nombre} en el historial de ${mascota.nombre}.`)
    // Se resalta el registro nuevo en la línea de tiempo.
    setNueva(`${datos.nombre.trim()}|${datos.fecha}`)
  }

  async function eliminar(v: VacunaAplicada) {
    setError(undefined)
    try {
      await acciones.eliminarVacuna(v.id)
      setDetalle(null)
      setAviso(`Eliminamos ${v.nombre} del historial.`)
    } catch (e) {
      setError(mensajeDe(e, 'No pudimos eliminar el registro.'))
    }
  }

  async function elegirFoto(archivo: File | undefined) {
    if (!archivo) return
    setError(undefined)
    setAviso(undefined)
    setProcesandoFoto(true)
    try {
      // 1200 px: más que la foto de la mascota, para que el texto de la cartilla siga legible.
      await acciones.guardarFoto(await reducirImagen(archivo, 1200))
      setAviso('Guardamos la foto de la cartilla en Mis documentos.')
    } catch (e) {
      setError(mensajeDe(e, 'No pudimos leer esa imagen. Prueba con otra foto.'))
    } finally {
      setProcesandoFoto(false)
      if (entradaFoto.current) entradaFoto.current.value = ''
    }
  }

  async function quitarFoto() {
    setError(undefined)
    try {
      await acciones.guardarFoto(undefined)
      setAviso('Quitamos la foto de la cartilla.')
    } catch (e) {
      setError(mensajeDe(e, 'No pudimos quitar la foto.'))
    }
  }

  async function cambiarRecordatorio() {
    setError(undefined)
    try {
      await acciones.definirRecordatorio(!cartilla.recordatorio)
    } catch (e) {
      setError(mensajeDe(e, 'No pudimos cambiar el recordatorio.'))
    }
  }

  const detalleEdad = [NOMBRE_ESPECIE[mascota.especie], mascota.raza, textoEdad(mascota.nacimiento, undefined, mascota.especie)].filter(Boolean).join(' · ')

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Mensajes: siempre en el DOM para que los lectores de pantalla los anuncien. */}
      <div role="status" className="empty:hidden">
        {aviso && (
          <p className="aparecer flex items-center gap-2 rounded-2xl bg-menta-suave px-4 py-3 text-sm font-semibold text-salud-trazo">
            <ShieldCheck aria-hidden="true" size={18} className="shrink-0" />
            {aviso}
          </p>
        )}
      </div>
      {error && <MensajeError id="error-cartilla">{error}</MensajeError>}

      {/* A. Perfil de salud */}
      <Aparecer>
        <section
          aria-labelledby="titulo-perfil-salud"
          className={`relative flex flex-col gap-5 overflow-hidden p-5 md:flex-row md:items-center md:p-6 ${clasesTarjeta}`}
        >
          <HuellasDecorativas huellas={[{ top: '-12px', right: '8%', size: 64, giro: 18 }]} />
          <div className="relative flex items-center gap-4 md:flex-1">
            <div className="size-24 shrink-0 overflow-hidden rounded-[22px] border-4 border-white bg-foto-vacia shadow-suave md:size-28">
              {mascota.fotoUrl ? (
                <img src={mascota.fotoUrl} alt={`Foto de ${mascota.nombre}`} className="size-full object-cover" />
              ) : (
                <span className="flex size-full items-center justify-center text-huella">
                  <Huella aria-hidden="true" size={44} relleno />
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-menta-suave px-2.5 py-1 text-[11px] font-semibold text-salud-trazo">
                  <ClipboardList aria-hidden="true" size={13} />
                  Expediente digital
                </span>
                <span className="rounded-full bg-menta-suave px-2.5 py-1 text-[11px] font-semibold tracking-wide text-salud-trazo">
                  {mascota.folio}
                </span>
              </p>
              <h3 id="titulo-perfil-salud" className="mt-1.5 truncate font-titulo text-[26px] font-bold leading-tight text-cafe md:text-3xl">
                {mascota.nombre}
              </h3>
              <p className="text-sm text-cafe-suave">{detalleEdad}</p>
              <Link
                to={`/mascotas/${mascota.id}`}
                className={`mt-1 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-naranja-sombra hover:underline ${foco}`}
              >
                Ver perfil de {mascota.nombre}
                <ArrowRight aria-hidden="true" size={15} />
              </Link>
            </div>
          </div>
          <div className="relative flex flex-col gap-2 md:w-72">
            <BotonPrincipal
              onClick={() => {
                setAviso(undefined)
                setFormulario(true)
              }}
              className="gap-2"
            >
              <Plus aria-hidden="true" size={20} />
              Registrar atención
            </BotonPrincipal>
            <p className="flex items-start gap-1.5 text-xs text-cafe-suave">
              <Info aria-hidden="true" size={14} className="mt-px shrink-0" />
              La cartilla la llenas tú: no es un certificado veterinario.
            </p>
          </div>
        </section>
      </Aparecer>

      {/* B. Resumen: solo datos guardados en la cartilla */}
      <Aparecer retraso={80}>
        <section aria-labelledby="titulo-resumen">
          <h3 id="titulo-resumen" className="sr-only">
            Resumen de salud
          </h3>
          <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 lg:grid-cols-4 lg:gap-4">
            <Indicador
              icono={<Syringe aria-hidden="true" size={20} />}
              fondo="bg-menta-suave text-salud-trazo"
              etiqueta="Vacunas registradas"
              valor={vacunas.length}
            />
            <Indicador
              icono={<CalendarClock aria-hidden="true" size={20} />}
              fondo="bg-celeste text-naranja-sombra"
              etiqueta="Próximos cuidados"
              valor={proxima ? 1 : 0}
            />
            <Indicador
              icono={<FileImage aria-hidden="true" size={20} />}
              fondo="bg-aviso-fondo text-naranja-sombra"
              etiqueta="Documentos"
              valor={fotoCartilla ? 1 : 0}
            />
            <Indicador
              icono={cartilla.recordatorio ? <Bell aria-hidden="true" size={20} /> : <BellOff aria-hidden="true" size={20} />}
              fondo="bg-amarillo-suave text-cafe"
              etiqueta="Recordatorio en Inicio"
              valor={<span className="text-lg">{cartilla.recordatorio ? 'Activo' : 'Apagado'}</span>}
            />
          </ul>
        </section>
      </Aparecer>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start">
        {/* C. Próximos cuidados */}
        <Aparecer retraso={140}>
          <section aria-labelledby="titulo-proximos">
            <TituloSeccion id="titulo-proximos">Próximos cuidados</TituloSeccion>
            {proxima ? (
              <div className={`flex flex-col gap-4 p-5 ${clasesTarjeta}`}>
                <div className="flex items-start gap-3">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-menta-suave text-salud-trazo">
                    <Syringe aria-hidden="true" size={24} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap gap-1.5">
                      {vencida ? (
                        <span className="rounded-full bg-rosa px-2.5 py-1 text-[11px] font-semibold text-error-oscuro">Vencido</span>
                      ) : (
                        <span className="rounded-full bg-celeste px-2.5 py-1 text-[11px] font-semibold text-naranja-sombra">Próximo</span>
                      )}
                      <span className="rounded-full bg-crema px-2.5 py-1 text-[11px] font-semibold text-cafe-suave">Vacunación</span>
                    </p>
                    <p className="mt-1.5 font-titulo text-lg font-bold text-cafe">{proxima.nombre}</p>
                    <p className="text-sm text-cafe-suave">
                      {vencida ? 'Fecha indicada: ' : 'Fecha recomendada: '}
                      {formatearFecha(proxima.fecha, proxima.fecha.slice(0, 4) !== anio)}
                    </p>
                    {vencida && (
                      <p className="mt-1 text-[13px] text-cafe-suave">
                        La fecha que registraste ya pasó. Consulta a tu veterinario y registra la dosis cuando se aplique.
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-borde-calido pt-3">
                  <span id="etiqueta-recordatorio" className="flex items-center gap-2 text-sm font-semibold">
                    <Bell aria-hidden="true" size={18} className="text-naranja" />
                    Recordarme en Inicio
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={cartilla.recordatorio}
                    aria-labelledby="etiqueta-recordatorio"
                    onClick={cambiarRecordatorio}
                    className={`flex min-h-11 min-w-14 shrink-0 items-center justify-center rounded-full ${foco}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`flex h-8 w-14 items-center rounded-full border-2 px-0.5 transition-colors ${
                        cartilla.recordatorio ? 'justify-end border-naranja bg-naranja' : 'justify-start border-cafe-suave bg-white'
                      }`}
                    >
                      <span className={`size-6 rounded-full ${cartilla.recordatorio ? 'bg-white' : 'bg-cafe-suave'}`} />
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className={`relative flex flex-col items-center gap-2 overflow-hidden p-6 text-center ${clasesTarjeta}`}>
                <HuellasDecorativas huellas={[{ bottom: '-8px', left: '6%', size: 46, giro: -16 }]} />
                <span className="relative flex size-12 items-center justify-center rounded-full bg-menta-suave text-salud-trazo">
                  <CalendarClock aria-hidden="true" size={22} />
                </span>
                <p className="relative font-titulo text-base font-semibold text-cafe">¡Todo comienza con una buena organización!</p>
                <p className="relative max-w-sm text-sm text-cafe-suave">
                  Cuando registres una atención o recomendación veterinaria, podrás consultar aquí los próximos cuidados
                  de tu mascota.
                </p>
              </div>
            )}
          </section>
        </Aparecer>

        {/* F. Documentos: la foto de la cartilla (bucket privado, URL firmada de 1 hora) */}
        <Aparecer retraso={200}>
          <section aria-labelledby="titulo-documentos">
            <TituloSeccion
              id="titulo-documentos"
              derecha={
                <span className="inline-flex items-center gap-1 rounded-full bg-crema px-2.5 py-1 text-[11px] font-semibold text-cafe-suave">
                  <Lock aria-hidden="true" size={12} />
                  Privados: solo tú los ves
                </span>
              }
            >
              Mis documentos
            </TituloSeccion>
            <input
              ref={entradaFoto}
              type="file"
              accept="image/*"
              hidden
              aria-label="Elegir foto de la cartilla"
              onChange={(e) => elegirFoto(e.target.files?.[0])}
            />
            {fotoCartilla ? (
              <article aria-label="Foto de la cartilla" className={`flex gap-4 p-4 ${clasesTarjeta}`}>
                <button
                  type="button"
                  onClick={() => setVerFoto(true)}
                  className={`group relative size-24 shrink-0 overflow-hidden rounded-2xl bg-foto-vacia ${foco}`}
                  aria-label="Ver la foto de la cartilla en grande"
                >
                  <img src={fotoCartilla} alt="" className="size-full object-cover transition-transform group-hover:scale-105" />
                  <span className="absolute bottom-1 right-1 flex size-7 items-center justify-center rounded-full bg-white/90 text-cafe">
                    <Expand aria-hidden="true" size={14} />
                  </span>
                </button>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-cafe">Foto de la cartilla</p>
                  <p className="text-[13px] text-cafe-suave">Imagen · cartilla de vacunación de {mascota.nombre}</p>
                  <div className="mt-2 flex flex-wrap gap-x-1">
                    <button
                      type="button"
                      onClick={() => entradaFoto.current?.click()}
                      disabled={procesandoFoto}
                      className={`min-h-11 rounded-full px-2 text-sm font-semibold text-naranja-sombra hover:underline disabled:opacity-60 ${foco}`}
                    >
                      {procesandoFoto ? 'Preparando…' : 'Cambiar'}
                    </button>
                    <button type="button" onClick={quitarFoto} className={`min-h-11 rounded-full px-2 text-sm font-semibold text-cafe-suave hover:underline ${foco}`}>
                      Quitar foto
                    </button>
                  </div>
                </div>
              </article>
            ) : (
              <div className={`flex flex-col items-center gap-3 border-dashed p-6 text-center ${clasesTarjeta}`}>
                <span className="flex size-12 items-center justify-center rounded-full bg-aviso-fondo text-naranja">
                  <FileImage aria-hidden="true" size={22} />
                </span>
                <p className="max-w-xs text-sm text-cafe-suave">
                  Guarda una foto de la cartilla de papel para tenerla a la mano. Solo tú puedes verla.
                </p>
                <button
                  type="button"
                  onClick={() => entradaFoto.current?.click()}
                  disabled={procesandoFoto}
                  className={`${clasesBotonSecundario} h-11! gap-2 disabled:opacity-60 sm:w-fit`}
                >
                  <ImagePlus aria-hidden="true" size={18} />
                  {procesandoFoto ? 'Preparando la foto…' : 'Subir foto de cartilla'}
                </button>
              </div>
            )}
            <p className="mt-2 text-xs text-cafe-suave">
              Por ahora se guarda un documento por mascota. Los comprobantes por cada atención llegarán después.
            </p>
          </section>
        </Aparecer>
      </div>

      {/* D. Historial en línea de tiempo */}
      <Aparecer retraso={260}>
        <section aria-labelledby="titulo-historial">
          <TituloSeccion
            id="titulo-historial"
            derecha={
              vacunas.length > 0 && (
                <span className="text-[13px] text-cafe-suave">
                  {vacunas.length === 1 ? '1 registro' : `${vacunas.length} registros`}
                </span>
              )
            }
          >
            Historial de salud
          </TituloSeccion>
          {vacunas.length === 0 ? (
            <div className={`flex flex-col items-center gap-2 p-8 text-center ${clasesTarjeta}`}>
              <span className="flex size-12 items-center justify-center rounded-full bg-menta-suave text-salud-trazo">
                <Stethoscope aria-hidden="true" size={22} />
              </span>
              <p className="font-titulo text-base font-semibold text-cafe">Su historial empieza aquí</p>
              <p className="max-w-sm text-sm text-cafe-suave">
                Registra la primera vacuna de {mascota.nombre} con «Registrar atención» y la verás en esta línea de tiempo.
              </p>
            </div>
          ) : (
            <ol className={`m-0 list-none p-4 md:p-6 ${clasesTarjeta}`}>
              {vacunas.map((v, i) => {
                const ultimo = i === vacunas.length - 1
                const resaltar = nueva === `${v.nombre}|${v.fecha}`
                return (
                  <li key={v.id} className="relative flex gap-4 pb-5 last:pb-0">
                    {!ultimo && <span aria-hidden="true" className="absolute left-[21px] top-12 bottom-0 w-0.5 bg-borde-calido" />}
                    <span className="relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full border-4 border-white bg-menta-suave text-salud-trazo shadow-suave">
                      <Syringe aria-hidden="true" size={18} />
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmando(false)
                        setDetalle(v)
                      }}
                      className={`group flex min-w-0 flex-1 items-center justify-between gap-3 rounded-2xl border p-3 text-left transition-colors hover:bg-crema-clara ${
                        resaltar ? 'aparecer border-salud-trazo bg-menta-suave/40' : 'border-transparent'
                      } ${foco}`}
                    >
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold text-cafe-suave">
                          {formatearFecha(v.fecha, v.fecha.slice(0, 4) !== anio)}
                        </span>
                        <span className="block font-semibold text-cafe">{v.nombre}</span>
                        <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[13px] text-cafe-suave">
                          <span className="rounded-full bg-menta-suave px-2 py-0.5 text-[11px] font-semibold text-salud-trazo">Vacunación</span>
                          {v.veterinaria && <span>{v.veterinaria}</span>}
                        </span>
                      </span>
                      <ArrowRight aria-hidden="true" size={18} className="shrink-0 text-cafe-suave transition-transform motion-safe:group-hover:translate-x-1" />
                      <span className="sr-only">Ver detalle</span>
                    </button>
                  </li>
                )
              })}
            </ol>
          )}
        </section>
      </Aparecer>

      {formulario && (
        <Dialogo id="titulo-registrar" titulo={`Registrar atención de ${mascota.nombre}`} onCerrar={() => setFormulario(false)} ancho="max-w-[560px]">
          {(cerrar) => <FormularioVacuna especie={mascota.especie} nacimiento={mascota.nacimiento} onGuardar={guardarVacuna} onCancelar={cerrar} />}
        </Dialogo>
      )}

      {detalle && (
        <Dialogo id="titulo-detalle" titulo="Detalle del registro" onCerrar={() => setDetalle(null)}>
          {(cerrar) => (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-menta-suave text-salud-trazo">
                  <Syringe aria-hidden="true" size={24} />
                </span>
                <div>
                  <p className="flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-menta-suave px-2.5 py-1 text-[11px] font-semibold text-salud-trazo">Vacunación</span>
                    <EtiquetaOrigen />
                  </p>
                  <p className="mt-1.5 font-titulo text-xl font-bold">{detalle.nombre}</p>
                </div>
              </div>
              <dl className="m-0 grid grid-cols-1 gap-3 rounded-2xl bg-crema-clara p-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-[13px] font-semibold text-cafe-suave">Fecha de aplicación</dt>
                  <dd className="m-0">{formatearFecha(detalle.fecha)}</dd>
                </div>
                <div>
                  <dt className="text-[13px] font-semibold text-cafe-suave">Veterinaria</dt>
                  <dd className="m-0">{detalle.veterinaria ?? 'No se indicó'}</dd>
                </div>
              </dl>
              <p className="flex items-start gap-2 text-[13px] text-cafe-suave">
                <Info aria-hidden="true" size={15} className="mt-0.5 shrink-0" />
                Dato capturado por ti. No lo ha verificado una veterinaria.
              </p>
              {confirmando ? (
                <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-error/30 bg-rosa p-4">
                  <p className="text-sm font-semibold text-error-oscuro">¿Eliminar este registro? No se puede deshacer.</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => eliminar(detalle)}
                      className={`min-h-11 rounded-full bg-error px-4 text-sm font-semibold text-white ${foco}`}
                    >
                      Sí, eliminar
                    </button>
                    <button type="button" onClick={() => setConfirmando(false)} className={`min-h-11 rounded-full px-4 text-sm font-semibold text-cafe hover:bg-white ${foco}`}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    onClick={() => setConfirmando(true)}
                    className={`flex min-h-11 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-semibold text-error hover:bg-rosa ${foco}`}
                  >
                    <Trash2 aria-hidden="true" size={16} />
                    Eliminar registro
                  </button>
                  <button type="button" onClick={cerrar} className={`${clasesBotonSecundario} h-11! sm:w-auto`}>
                    Cerrar
                  </button>
                </div>
              )}
            </div>
          )}
        </Dialogo>
      )}

      {verFoto && fotoCartilla && (
        <Dialogo id="titulo-foto" titulo="Foto de la cartilla" onCerrar={() => setVerFoto(false)} ancho="max-w-[760px]">
          {() => (
            <img
              src={fotoCartilla}
              alt={`Foto de la cartilla de vacunación de ${mascota.nombre}`}
              className="max-h-[70dvh] w-full rounded-2xl bg-foto-vacia object-contain"
            />
          )}
        </Dialogo>
      )}
    </div>
  )
}
