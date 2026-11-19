import { ArrowLeft, Camera, Cat, Dog, Fingerprint, ImagePlus, MessageCircle, QrCode, ShieldCheck, TriangleAlert, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import AreaTexto from '../../components/ui/AreaTexto'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import BotonSecundario from '../../components/ui/BotonSecundario'
import CampoLista from '../../components/ui/CampoLista'
import CampoTexto from '../../components/ui/CampoTexto'
import Huella from '../../components/ui/Huella'
import IndicadorPasos from '../../components/ui/IndicadorPasos'
import MensajeError from '../../components/ui/MensajeError'
import { hoyISO, textoEdad } from '../../lib/edad'
import { reducirImagen } from '../../lib/imagen'
import {
  validarAnioNacimiento,
  validarFechaNacimiento,
  validarNombreMascota,
  validarRaza,
  validarTextoPublico,
} from '../../lib/validaciones'
import { ESPECIES, NOMBRE_ESPECIE } from '../../lib/especies'
import type { DatosMascota, Especie, Mascota } from '../../types/mascota'
import { useSesion } from '../auth/contextoSesion'
import { useCampos } from '../auth/useCampos'
import type { Reglas } from '../auth/useCampos'

type Valores = {
  nombre: string
  raza: string
  /** '1' si se conoce la fecha exacta de nacimiento; vacío si es aproximada. */
  fechaExacta: string
  anio: string
  fecha: string
  senas: string
  nota: string
}

const reglas: Reglas<Valores> = {
  nombre: validarNombreMascota,
  raza: validarRaza,
  fechaExacta: () => null,
  anio: (v, todos) => (todos.fechaExacta === '1' ? null : validarAnioNacimiento(v)),
  fecha: (v, todos) => (todos.fechaExacta === '1' ? validarFechaNacimiento(v) : null),
  senas: (v) => validarTextoPublico(v, 150),
  nota: (v) => validarTextoPublico(v, 200),
}

const PASOS = ['Información básica', 'Características', 'Identificación']
const DESCRIPCION = [
  'Nombre, raza, edad y foto son lo primero que verá quien escanee su QR.',
  'Todo es opcional. Lo que escribas aquí lo verá quien escanee el QR de tu mascota.',
  'Revisa cómo quedará su identificación y el contacto protegido antes de guardar.',
]
const CAMPOS_POR_PASO: (keyof Valores)[][] = [['nombre', 'raza', 'anio', 'fecha'], ['senas', 'nota'], []]

function valoresIniciales(m?: Mascota): Valores {
  const exacta = !!m && m.nacimiento.length > 4
  return {
    nombre: m?.nombre ?? '',
    raza: m?.raza ?? '',
    fechaExacta: exacta ? '1' : '',
    anio: m && !exacta ? m.nacimiento : '',
    fecha: m && exacta ? m.nacimiento : '',
    senas: m?.senas ?? '',
    nota: m?.nota ?? '',
  }
}

type Props = {
  /** Sin mascota = registro nuevo; con mascota = edición de su ficha. */
  mascota?: Mascota
  /** A dónde regresan "Cancelar" y la flecha. */
  volverA: string
  guardar: (datos: DatosMascota) => Promise<void>
}

function Bloque({ icono, titulo, children }: { icono: ReactNode; titulo: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-borde-calido bg-crema-clara p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-salud-trazo">{icono}</span>
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-semibold text-cafe">{titulo}</p>
        <div className="mt-0.5 text-cafe-suave">{children}</div>
      </div>
    </div>
  )
}

export default function FormularioMascota({ mascota, volverA, guardar }: Props) {
  const editando = !!mascota
  const [paso, setPaso] = useState(1)
  const [foto, setFoto] = useState<string | undefined>(mascota?.fotoUrl)
  const [especie, setEspecie] = useState<Especie>(mascota?.especie ?? 'perro')
  const [errorFoto, setErrorFoto] = useState<string>()
  const [procesandoFoto, setProcesandoFoto] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorGuardar, setErrorGuardar] = useState<string>()
  const entradaFoto = useRef<HTMLInputElement>(null)
  const { sesion } = useSesion()
  const [hoy] = useState(() => new Date())
  const { valores, campo, cambiar, validar } = useCampos<Valores>(valoresIniciales(mascota), reglas)

  // Al cambiar de paso, el foco pasa al encabezado del paso nuevo.
  const tituloPaso = useRef<HTMLHeadingElement>(null)
  const primerRender = useRef(true)
  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false
      return
    }
    tituloPaso.current?.focus()
  }, [paso])

  const anioActual = hoy.getFullYear()
  const anios = Array.from({ length: 21 }, (_, i) => anioActual - i)
  const fechaExacta = valores.fechaExacta === '1'
  const nacimiento = fechaExacta ? valores.fecha : valores.anio
  const nombre = valores.nombre.trim() || 'tu mascota'

  async function elegirFoto(archivo: File | undefined) {
    if (!archivo) return
    setErrorFoto(undefined)
    setProcesandoFoto(true)
    try {
      setFoto(await reducirImagen(archivo))
    } catch (error) {
      // Los DOMException del navegador vienen en inglés: se cambian por un mensaje claro.
      setErrorFoto(
        error instanceof Error && !(error instanceof DOMException)
          ? error.message
          : 'No pudimos leer esa imagen. Prueba con otra foto.',
      )
    } finally {
      setProcesandoFoto(false)
      if (entradaFoto.current) entradaFoto.current.value = ''
    }
  }

  function quitarFoto() {
    setFoto(undefined)
    setErrorFoto(undefined)
    if (entradaFoto.current) entradaFoto.current.value = ''
  }

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const primero = validar(CAMPOS_POR_PASO[paso - 1])
    if (primero) {
      ;(e.currentTarget.elements.namedItem(primero) as HTMLElement | null)?.focus()
      return
    }
    if (paso < PASOS.length) {
      setPaso(paso + 1)
      return
    }
    if (!sesion || procesandoFoto) return

    setGuardando(true)
    setErrorGuardar(undefined)
    try {
      await guardar({
        especie,
        nombre: valores.nombre.trim(),
        raza: valores.raza.trim(),
        nacimiento,
        senas: valores.senas.trim(),
        nota: valores.nota.trim(),
        fotoUrl: foto,
      })
    } catch (error) {
      setErrorGuardar(error instanceof Error ? error.message : 'No pudimos guardar a tu mascota.')
      setGuardando(false)
    }
  }

  const telefono = sesion?.telefono?.replace(/\D/g, '')

  return (
    <div className="flex flex-col gap-5">
      <Link to={volverA} className="flex min-h-11 w-fit items-center gap-2 text-sm font-semibold text-naranja-sombra">
        <ArrowLeft aria-hidden="true" size={18} />
        {editando ? `Volver a ${mascota.nombre}` : 'Mis mascotas'}
      </Link>

      <div>
        <h2 className="flex items-center gap-2 font-titulo text-2xl font-bold text-cafe">
          {editando ? `Editar a ${mascota.nombre}` : 'Registrar mascota'}
          <Huella aria-hidden="true" size={24} relleno />
        </h2>
        <p className="mt-1 text-[15px] text-cafe-suave">
          {editando
            ? 'Actualiza su ficha. Su folio y su QR no cambian.'
            : 'En tres pasos tendrá su ID de collar y su código QR.'}
        </p>
      </div>

      <div className="rounded-[24px] border border-borde-calido bg-white p-5 shadow-suave md:p-7">
        <IndicadorPasos
          pasos={PASOS}
          actual={paso}
          etiqueta={editando ? 'Progreso de la edición' : 'Progreso del registro de la mascota'}
        />

        <form noValidate onSubmit={enviar} aria-labelledby="titulo-paso" className="mt-6 flex flex-col gap-6">
          <div>
            <h3
              id="titulo-paso"
              ref={tituloPaso}
              tabIndex={-1}
              className="font-titulo text-lg font-semibold outline-none"
            >
              {`Paso ${paso}. ${PASOS[paso - 1]}`}
            </h3>
            <p className="text-[13px] text-cafe-suave">{DESCRIPCION[paso - 1]}</p>
          </div>

          {paso === 1 && (
            <>
              {/* Foto: vista previa grande y botones reales para elegir o quitar. */}
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-5">
                <div className="relative size-32 shrink-0 overflow-hidden rounded-[28px] border-4 border-white bg-foto-vacia shadow-suave">
                  {foto ? (
                    <img src={foto} alt={`Vista previa de la foto de ${nombre}`} className="size-full object-cover" />
                  ) : (
                    <span className="flex size-full items-center justify-center text-huella">
                      <Huella aria-hidden="true" size={56} relleno />
                    </span>
                  )}
                  {procesandoFoto && (
                    <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs font-semibold">
                      Preparando…
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-center gap-2 sm:items-start">
                  <p className="text-sm font-semibold text-cafe">Foto (opcional)</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <label
                      htmlFor="foto"
                      className="flex min-h-11 cursor-pointer items-center gap-2 rounded-boton border-2 border-barra-borde bg-white px-4 text-[15px] font-semibold text-cafe shadow-tarjeta has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-naranja-sombra"
                    >
                      {foto ? <Camera aria-hidden="true" size={18} /> : <ImagePlus aria-hidden="true" size={18} />}
                      {foto ? 'Cambiar foto' : 'Elegir foto'}
                      <input
                        ref={entradaFoto}
                        id="foto"
                        name="foto"
                        type="file"
                        accept="image/*"
                        aria-describedby={errorFoto ? 'error-foto' : 'ayuda-foto'}
                        onChange={(e) => elegirFoto(e.target.files?.[0])}
                        className="sr-only"
                      />
                    </label>
                    {foto && (
                      <button
                        type="button"
                        onClick={quitarFoto}
                        className="flex min-h-11 items-center gap-1.5 rounded-boton px-3 text-sm font-semibold text-naranja-sombra hover:bg-amarillo-suave"
                      >
                        <X aria-hidden="true" size={16} />
                        Quitar foto
                      </button>
                    )}
                  </div>
                  {errorFoto ? (
                    <MensajeError id="error-foto">{errorFoto}</MensajeError>
                  ) : (
                    <p id="ayuda-foto" className="text-center text-[13px] text-cafe-suave sm:text-left">
                      Una foto clara de su cara y su cuerpo ayuda a reconocerlo.
                    </p>
                  )}
                </div>
              </div>

              <CampoTexto label="Nombre" autoComplete="off" enterKeyHint="next" required {...campo('nombre')} />

              {/* Radios reales con aspecto de píldora: flechas para cambiar, una sola parada de Tab. */}
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-2 text-sm font-semibold text-cafe">Especie</legend>
                <div className="flex flex-wrap gap-2">
                  {ESPECIES.map((e) => {
                    const Icono = e === 'gato' ? Cat : Dog
                    return (
                      <label
                        key={e}
                        className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-2 px-4 text-sm font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-naranja-sombra ${
                          especie === e ? 'border-naranja bg-naranja text-white' : 'border-borde-calido bg-white text-cafe hover:bg-crema'
                        }`}
                      >
                        <input
                          type="radio"
                          name="especie"
                          value={e}
                          checked={especie === e}
                          onChange={() => setEspecie(e)}
                          className="sr-only"
                        />
                        <Icono aria-hidden="true" size={18} />
                        {NOMBRE_ESPECIE[e]}
                      </label>
                    )
                  })}
                </div>
              </fieldset>

              <CampoTexto
                label="Raza"
                ayuda='Si no la sabes, escribe "Mestizo".'
                autoComplete="off"
                enterKeyHint="next"
                required
                {...campo('raza')}
              />

              {fechaExacta ? (
                <CampoTexto
                  label="Fecha de nacimiento"
                  type="date"
                  min={`${anioActual - 25}-01-01`}
                  max={hoyISO(hoy)}
                  autoComplete="off"
                  required
                  {...campo('fecha')}
                />
              ) : (
                <CampoLista
                  label="Año de nacimiento aproximado"
                  ayuda="Si no lo sabes, elige el año más cercano."
                  required
                  {...campo('anio')}
                >
                  <option value="">Elige el año</option>
                  {anios.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </CampoLista>
              )}

              <div className="flex items-start gap-3">
                <input
                  id="fecha-exacta"
                  name="fechaExacta"
                  type="checkbox"
                  checked={fechaExacta}
                  onChange={(e) => cambiar('fechaExacta', e.target.checked ? '1' : '')}
                  className="mt-1.5 size-6 shrink-0 accent-naranja"
                />
                <label htmlFor="fecha-exacta" className="py-1.5 text-sm">
                  Conozco su fecha de nacimiento exacta
                </label>
              </div>
            </>
          )}

          {paso === 2 && (
            <>
              <AreaTexto
                label="Señas particulares"
                ayuda="Color, tamaño, manchas, cicatrices, collar… ayudan a reconocerlo."
                maxLength={150}
                {...campo('senas')}
              />
              <AreaTexto
                label="Nota para quien lo encuentre"
                ayuda="Por ejemplo: «Es muy amigable, pero le dan miedo los cohetes»."
                maxLength={200}
                {...campo('nota')}
              />
            </>
          )}

          {paso === 3 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4 rounded-2xl bg-amarillo-suave p-4">
                <div className="size-16 shrink-0 overflow-hidden rounded-2xl bg-foto-vacia">
                  {foto ? (
                    <img src={foto} alt="" className="size-full object-cover" />
                  ) : (
                    <span className="flex size-full items-center justify-center text-huella">
                      <Huella aria-hidden="true" size={30} relleno />
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-titulo text-xl font-bold text-cafe">{nombre}</p>
                  <p className="text-sm text-cafe-suave">
                    {NOMBRE_ESPECIE[especie]} · {valores.raza.trim()}
                    {nacimiento && ` · ${textoEdad(nacimiento, hoy, especie)}`}
                  </p>
                </div>
              </div>

              <Bloque icono={<QrCode aria-hidden="true" size={20} />} titulo="Identificación Manchitas">
                {editando ? (
                  <>
                    Folio <strong className="text-cafe">{mascota.folio}</strong>. No cambia al editar: su QR y su
                    etiqueta impresa siguen funcionando.
                  </>
                ) : (
                  'Al registrarlo recibirá un folio aleatorio (por ejemplo MCH-7K3P9Q) y un QR único para su collar.'
                )}
              </Bloque>

              <Bloque icono={<Fingerprint aria-hidden="true" size={20} />} titulo="Tutor responsable">
                {sesion ? `${sesion.nombre} ${sesion.apellido}`.trim() : 'Tu cuenta'}. En su ficha pública solo se
                ve tu primer apellido, como máximo.
              </Bloque>

              {telefono ? (
                <Bloque icono={<MessageCircle aria-hidden="true" size={20} />} titulo="Contacto protegido por WhatsApp">
                  Quien lo encuentre podrá escribirte al WhatsApp que termina en{' '}
                  <strong className="text-cafe">{telefono.slice(-2)}</strong>. Tu número completo nunca aparece en
                  pantalla.
                </Bloque>
              ) : (
                <div className="flex gap-3 rounded-2xl border border-durazno bg-aviso-fondo p-4 text-sm">
                  <TriangleAlert aria-hidden="true" size={20} className="mt-0.5 shrink-0 text-naranja-sombra" />
                  <p className="text-cafe">
                    Tu cuenta no tiene un WhatsApp registrado. Podrás registrarlo, pero quien lo encuentre no tendrá
                    cómo avisarte.
                  </p>
                </div>
              )}

              <p className="flex items-start gap-2 text-[13px] text-cafe-suave">
                <ShieldCheck aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-salud-trazo" />
                La ficha pública nunca dice «perdido» y solo se abre con el QR o el folio exacto.
              </p>
            </div>
          )}

          {errorGuardar && <MensajeError id="error-guardar">{errorGuardar}</MensajeError>}

          <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            {paso > 1 ? (
              <BotonSecundario onClick={() => setPaso(paso - 1)} className="sm:w-auto">
                Atrás
              </BotonSecundario>
            ) : (
              <BotonSecundario to={volverA} className="sm:w-auto">
                Cancelar
              </BotonSecundario>
            )}
            <BotonPrincipal type="submit" disabled={guardando || procesandoFoto} className="sm:w-auto">
              {paso < PASOS.length
                ? 'Siguiente'
                : guardando
                  ? 'Guardando…'
                  : editando
                    ? 'Guardar cambios'
                    : 'Registrar mascota'}
            </BotonPrincipal>
          </div>
        </form>
      </div>
    </div>
  )
}
