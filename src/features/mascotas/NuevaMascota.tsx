import { ArrowLeft } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AreaTexto from '../../components/ui/AreaTexto'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import BotonSecundario from '../../components/ui/BotonSecundario'
import CampoBase from '../../components/ui/CampoBase'
import CampoLista from '../../components/ui/CampoLista'
import CampoTexto from '../../components/ui/CampoTexto'
import IndicadorPasos from '../../components/ui/IndicadorPasos'
import MensajeError from '../../components/ui/MensajeError'
import { hoyISO } from '../../lib/edad'
import { reducirImagen } from '../../lib/imagen'
import { crearMascota } from '../../lib/mascotas'
import {
  validarAnioNacimiento,
  validarFechaNacimiento,
  validarNombreMascota,
  validarRaza,
  validarTextoPublico,
} from '../../lib/validaciones'
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

const PASOS = ['Tu perro', 'Señas y foto']
const CAMPOS_POR_PASO: (keyof Valores)[][] = [
  ['nombre', 'raza', 'anio', 'fecha'],
  ['senas', 'nota'],
]

export default function NuevaMascota() {
  const [paso, setPaso] = useState(1)
  const [foto, setFoto] = useState<string>()
  const [errorFoto, setErrorFoto] = useState<string>()
  const [procesandoFoto, setProcesandoFoto] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorGuardar, setErrorGuardar] = useState<string>()
  const entradaFoto = useRef<HTMLInputElement>(null)
  const { sesion } = useSesion()
  const navigate = useNavigate()
  const [hoy] = useState(() => new Date())
  const { valores, campo, cambiar, validar } = useCampos<Valores>(
    { nombre: '', raza: '', fechaExacta: '', anio: '', fecha: '', senas: '', nota: '' },
    reglas,
  )

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
      if (entradaFoto.current) entradaFoto.current.value = ''
    } finally {
      setProcesandoFoto(false)
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
      const mascota = await crearMascota(
        {
          nombre: valores.nombre.trim(),
          raza: valores.raza.trim(),
          nacimiento: fechaExacta ? valores.fecha : valores.anio,
          senas: valores.senas.trim(),
          nota: valores.nota.trim(),
          fotoUrl: foto,
        },
        sesion.correo,
      )
      navigate(`/mascotas/${mascota.id}`, { replace: true, state: { nueva: true } })
    } catch (error) {
      setErrorGuardar(error instanceof Error ? error.message : 'No pudimos guardar a tu mascota.')
      setGuardando(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/mascotas"
        className="flex min-h-11 w-fit items-center gap-2 text-sm font-semibold text-naranja-sombra"
      >
        <ArrowLeft aria-hidden="true" size={18} />
        Mis perros
      </Link>

      <IndicadorPasos pasos={PASOS} actual={paso} etiqueta="Progreso del registro de la mascota" />

      <form noValidate onSubmit={enviar} aria-labelledby="titulo-paso" className="flex flex-col gap-6">
        <div>
          <h2
            id="titulo-paso"
            ref={tituloPaso}
            tabIndex={-1}
            className="font-titulo text-lg font-semibold outline-none"
          >
            {PASOS[paso - 1]}
          </h2>
          <p className="text-[13px] text-cafe-suave">
            {paso === 1
              ? 'Todos los campos son obligatorios.'
              : 'Todo es opcional. Lo que escribas aquí lo verá quien escanee el QR de tu perro.'}
          </p>
        </div>

        {paso === 1 && (
          <>
            <CampoTexto
              label="Nombre"
              autoComplete="off"
              enterKeyHint="next"
              required
              {...campo('nombre')}
            />
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
              ayuda="Colores, manchas, cicatrices, tamaño… ayudan a reconocerlo."
              maxLength={150}
              {...campo('senas')}
            />
            <AreaTexto
              label="Nota para quien lo encuentre"
              ayuda="Por ejemplo: «Es muy amigable, pero le dan miedo los cohetes»."
              maxLength={200}
              {...campo('nota')}
            />

            <CampoBase label="Foto (opcional)" error={errorFoto}>
              {(control) => (
                <input
                  {...control}
                  ref={entradaFoto}
                  name="foto"
                  type="file"
                  accept="image/*"
                  onChange={(e) => elegirFoto(e.target.files?.[0])}
                  className="block w-full text-sm text-cafe-suave file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-boton file:border-2 file:border-barra-borde file:bg-white file:px-4 file:text-[15px] file:font-semibold file:text-cafe focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-naranja"
                />
              )}
            </CampoBase>

            {procesandoFoto && (
              <p role="status" className="text-sm text-cafe-suave">
                Preparando la foto…
              </p>
            )}
            {foto && (
              <div className="flex flex-col gap-2">
                <img
                  src={foto}
                  alt="Vista previa de la foto de tu perro"
                  className="h-40 w-full rounded-dato object-cover"
                />
                <button
                  type="button"
                  onClick={quitarFoto}
                  className="min-h-11 w-fit text-sm font-semibold text-naranja-sombra underline"
                >
                  Quitar foto
                </button>
              </div>
            )}
          </>
        )}

        {errorGuardar && <MensajeError id="error-guardar">{errorGuardar}</MensajeError>}

        <div className="mt-2 flex flex-col gap-4">
          <BotonPrincipal type="submit" disabled={guardando || procesandoFoto}>
            {paso < PASOS.length ? 'Siguiente' : guardando ? 'Guardando…' : 'Registrar a mi perro'}
          </BotonPrincipal>
          {paso > 1 && <BotonSecundario onClick={() => setPaso(paso - 1)}>Atrás</BotonSecundario>}
        </div>
      </form>
    </div>
  )
}
