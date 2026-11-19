import { Check, HeartHandshake, PawPrint, Users } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ComponentType, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import BotonSecundario from '../../components/ui/BotonSecundario'
import CampoTexto from '../../components/ui/CampoTexto'
import EncabezadoCurvo from '../../components/ui/EncabezadoCurvo'
import IndicadorPasos from '../../components/ui/IndicadorPasos'
import MensajeError from '../../components/ui/MensajeError'
import {
  requisitosContrasena,
  validarCiudad,
  validarColonia,
  validarConfirmacionContrasena,
  validarContrasenaNueva,
  validarCorreo,
  validarNombre,
  validarTelefono,
} from '../../lib/validaciones'
import CampoContrasena from './CampoContrasena'
import { useSesion } from './contextoSesion'
import type { Sesion } from './contextoSesion'
import { useCampos } from './useCampos'
import type { Reglas } from './useCampos'

type Valores = {
  nombre: string
  apellido: string
  correo: string
  contrasena: string
  confirmacion: string
  ciudad: string
  colonia: string
  telefono: string
  tipo: string
  acepto: string
}

type TipoUsuario = NonNullable<Sesion['tipoUsuario']>

const reglas: Reglas<Valores> = {
  nombre: (v) => validarNombre(v, 'nombre'),
  apellido: (v) => validarNombre(v, 'apellido'),
  correo: validarCorreo,
  contrasena: validarContrasenaNueva,
  confirmacion: (v, todos) => validarConfirmacionContrasena(v, todos.contrasena),
  ciudad: validarCiudad,
  colonia: validarColonia,
  // El WhatsApp es opcional: sin él, quien encuentre a tu mascota no podrá escribirte.
  telefono: (v) => (v.trim() ? validarTelefono(v) : null),
  tipo: (v) => (v ? null : 'Elige cómo quieres participar.'),
  acepto: (v) => (v ? null : 'Para crear tu cuenta, acepta los términos y el aviso de privacidad.'),
}

const PASOS = ['Tus datos', 'Cuenta', 'Ubicación', 'Perfil', 'Privacidad']
const CAMPOS_POR_PASO: (keyof Valores)[][] = [
  ['nombre', 'apellido'],
  ['correo', 'contrasena', 'confirmacion'],
  ['ciudad', 'colonia', 'telefono'],
  ['tipo'],
  ['acepto'],
]

const SUBTITULOS = [
  'Dinos cómo te llamas.',
  'Con tu correo y tu contraseña iniciarás sesión.',
  'Así conectamos a tu comunidad más cercana.',
  '¿Cómo quieres participar en Manchitas?',
  'Un último paso: revisa y acepta.',
]

const TIPOS: { id: TipoUsuario; titulo: string; texto: string; icono: ComponentType<{ size?: number; 'aria-hidden'?: boolean | 'true' | 'false' }> }[] = [
  { id: 'tutor', titulo: 'Tutor', texto: 'Tengo una mascota y quiero identificarla y cuidarla.', icono: PawPrint },
  { id: 'rescatista', titulo: 'Rescatista', texto: 'Rescato o doy en adopción a perros y gatos.', icono: HeartHandshake },
  { id: 'ciudadano', titulo: 'Ciudadano', texto: 'Quiero ayudar, reportar y apoyar a mi comunidad.', icono: Users },
]

function Requisitos({ contrasena }: { contrasena: string }) {
  return (
    <ul aria-label="Requisitos de la contraseña" className="m-0 -mt-2 flex list-none flex-col gap-1 p-0 text-[13px]">
      {requisitosContrasena(contrasena).map(({ texto, cumple }) => (
        <li key={texto} className={`flex items-center gap-2 ${cumple ? 'text-salud-trazo' : 'text-cafe-suave'}`}>
          <span
            aria-hidden="true"
            className={`flex size-4 items-center justify-center rounded-full ${cumple ? 'bg-salud-trazo text-white' : 'border border-cafe-suave'}`}
          >
            {cumple && <Check size={11} strokeWidth={3} />}
          </span>
          {texto}
          <span className="sr-only">{cumple ? ' (cumplido)' : ' (pendiente)'}</span>
        </li>
      ))}
    </ul>
  )
}

export default function Registro() {
  const [paso, setPaso] = useState(1)
  const [enviando, setEnviando] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState('')
  const [pendienteConfirmar, setPendienteConfirmar] = useState(false)
  const { registrar } = useSesion()
  const navigate = useNavigate()
  const { valores, errores, campo, cambiar, validar } = useCampos<Valores>(
    {
      nombre: '',
      apellido: '',
      correo: '',
      contrasena: '',
      confirmacion: '',
      ciudad: 'Hermosillo',
      colonia: '',
      telefono: '',
      tipo: 'tutor',
      acepto: '',
    },
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
    setErrorGeneral('')
    setEnviando(true)
    try {
      const telefono = valores.telefono.replace(/[\s-]/g, '')
      const { requiereConfirmacion } = await registrar(
        {
          nombre: valores.nombre.trim(),
          apellido: valores.apellido.trim(),
          correo: valores.correo.trim(),
          telefono: telefono || undefined,
          ciudad: valores.ciudad.trim(),
          colonia: valores.colonia.trim(),
          tipoUsuario: valores.tipo as TipoUsuario,
        },
        valores.contrasena,
      )
      if (requiereConfirmacion) setPendienteConfirmar(true)
      else navigate('/', { replace: true })
    } catch (error) {
      setErrorGeneral(error instanceof Error ? error.message : 'No pudimos crear tu cuenta.')
    } finally {
      setEnviando(false)
    }
  }

  const nombrePaso = PASOS[paso - 1]

  if (pendienteConfirmar) {
    return (
      <>
        <EncabezadoCurvo titulo="Revisa tu correo" atras="/bienvenida" />
        <main className="flex flex-col gap-4 px-5 pb-10 pt-8" role="status">
          <p className="text-sm">
            Te enviamos un mensaje a <strong>{valores.correo.trim()}</strong>. Abre el enlace para confirmar tu
            cuenta y después inicia sesión.
          </p>
          <p className="text-[13px] text-cafe-suave">
            Si no lo ves, revisa la carpeta de correo no deseado. El mensaje puede tardar unos minutos.
          </p>
          <BotonPrincipal to="/iniciar-sesion">Ir a iniciar sesión</BotonPrincipal>
        </main>
      </>
    )
  }

  return (
    <>
      <EncabezadoCurvo titulo="Crea tu cuenta" atras="/bienvenida" />
      <main className="flex flex-col gap-6 px-5 pb-10 pt-6">
        <IndicadorPasos pasos={PASOS} actual={paso} />

        <form noValidate onSubmit={enviar} aria-labelledby="titulo-paso" className="flex flex-col gap-6">
          <div>
            <h2
              id="titulo-paso"
              ref={tituloPaso}
              tabIndex={-1}
              className="font-titulo text-xl font-bold outline-none"
            >
              {nombrePaso}
            </h2>
            <p className="mt-0.5 text-[13px] text-cafe-suave">{SUBTITULOS[paso - 1]}</p>
          </div>

          {paso === 1 && (
            <>
              <CampoTexto label="Nombre" autoComplete="given-name" enterKeyHint="next" required {...campo('nombre')} />
              <CampoTexto
                label="Apellidos"
                autoComplete="family-name"
                enterKeyHint="next"
                required
                {...campo('apellido')}
              />
            </>
          )}

          {paso === 2 && (
            <>
              <CampoTexto
                label="Correo electrónico"
                type="email"
                autoComplete="username"
                inputMode="email"
                enterKeyHint="next"
                spellCheck={false}
                required
                {...campo('correo')}
              />
              <CampoContrasena
                label="Contraseña"
                autoComplete="new-password"
                enterKeyHint="next"
                required
                {...campo('contrasena')}
              />
              <Requisitos contrasena={valores.contrasena} />
              <CampoContrasena
                label="Confirma tu contraseña"
                autoComplete="new-password"
                enterKeyHint="next"
                required
                {...campo('confirmacion')}
              />
            </>
          )}

          {paso === 3 && (
            <>
              <CampoTexto label="Ciudad" autoComplete="address-level2" enterKeyHint="next" required {...campo('ciudad')} />
              <CampoTexto label="Colonia" autoComplete="address-level3" enterKeyHint="next" required {...campo('colonia')} />
              <CampoTexto
                label="WhatsApp (opcional)"
                ayuda="10 dígitos. Es para que te contacte quien encuentre a tu mascota; nunca se muestra en pantalla. Sin él, no podrán escribirte."
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                enterKeyHint="next"
                {...campo('telefono')}
              />
            </>
          )}

          {paso === 4 && (
            <fieldset
              aria-describedby={errores.tipo ? 'tipo-error' : undefined}
              className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0"
            >
              <legend className="sr-only">Tipo de usuario</legend>
              {TIPOS.map(({ id, titulo, texto, icono: Icono }) => {
                const activo = valores.tipo === id
                return (
                  <label
                    key={id}
                    className={`flex min-h-16 cursor-pointer items-center gap-3 rounded-[20px] border-2 p-3.5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-naranja-sombra ${
                      activo ? 'border-naranja bg-amarillo-suave' : 'border-borde-calido bg-white hover:bg-crema-clara'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tipo"
                      value={id}
                      checked={activo}
                      onChange={() => cambiar('tipo', id)}
                      className="sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${activo ? 'bg-naranja text-white' : 'bg-menta-suave text-salud-trazo'}`}
                    >
                      <Icono size={22} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-cafe">{titulo}</span>
                      <span className="block text-[13px] text-cafe-suave">{texto}</span>
                    </span>
                    {activo && <Check aria-hidden="true" size={20} className="shrink-0 text-naranja" />}
                  </label>
                )
              })}
              {errores.tipo && <MensajeError id="tipo-error">{errores.tipo}</MensajeError>}
              <p className="text-[13px] text-cafe-suave">
                Esto solo personaliza tu experiencia. Puedes cambiarlo después y no da permisos especiales.
              </p>
            </fieldset>
          )}

          {paso === 5 && (
            <>
              <p className="text-sm text-cafe-suave">
                Usaremos tus datos para identificar a tu mascota y para que quien la encuentre pueda avisarte.
                Tu teléfono nunca se muestra en pantalla y no se piden datos de tus mascotas hasta que las
                registres.
              </p>
              <div className="flex flex-col gap-1">
                <div className="flex items-start gap-3">
                  <input
                    id="acepto"
                    name="acepto"
                    type="checkbox"
                    required
                    checked={valores.acepto === '1'}
                    onChange={(e) => cambiar('acepto', e.target.checked ? '1' : '')}
                    aria-invalid={errores.acepto ? true : undefined}
                    aria-describedby={errores.acepto ? 'acepto-error' : undefined}
                    className="mt-1.5 size-6 shrink-0 accent-naranja"
                  />
                  <label htmlFor="acepto" className="py-1.5 text-sm">
                    Acepto los{' '}
                    <Link to="/terminos" target="_blank" className="font-semibold text-naranja-sombra underline">
                      términos y condiciones
                      <span className="sr-only"> (se abre en otra pestaña)</span>
                    </Link>{' '}
                    y el{' '}
                    <Link to="/privacidad" target="_blank" className="font-semibold text-naranja-sombra underline">
                      aviso de privacidad
                      <span className="sr-only"> (se abre en otra pestaña)</span>
                    </Link>
                    .
                  </label>
                </div>
                {errores.acepto && <MensajeError id="acepto-error">{errores.acepto}</MensajeError>}
              </div>
            </>
          )}

          <div className="mt-2 flex flex-col gap-4">
            {errorGeneral && <MensajeError id="error-general">{errorGeneral}</MensajeError>}
            <BotonPrincipal type="submit" disabled={enviando}>
              {paso < PASOS.length ? 'Siguiente' : enviando ? 'Creando tu cuenta…' : 'Crear cuenta'}
            </BotonPrincipal>
            {paso > 1 && <BotonSecundario onClick={() => setPaso(paso - 1)}>Atrás</BotonSecundario>}
          </div>
        </form>

        {paso === 1 && (
          <p className="text-center text-sm text-cafe-suave">
            ¿Ya tienes cuenta?{' '}
            <Link to="/iniciar-sesion" className="inline-flex min-h-11 items-center px-1 font-semibold text-naranja-sombra underline">
              Inicia sesión
            </Link>
          </p>
        )}
      </main>
    </>
  )
}
