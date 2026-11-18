import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import BotonSecundario from '../../components/ui/BotonSecundario'
import CampoTexto from '../../components/ui/CampoTexto'
import EncabezadoCurvo from '../../components/ui/EncabezadoCurvo'
import IndicadorPasos from '../../components/ui/IndicadorPasos'
import MensajeError from '../../components/ui/MensajeError'
import {
  validarContrasenaNueva,
  validarCorreo,
  validarNombre,
  validarTelefono,
} from '../../lib/validaciones'
import CampoContrasena from './CampoContrasena'
import { useSesion } from './contextoSesion'
import { useCampos } from './useCampos'
import type { Reglas } from './useCampos'

type Valores = {
  nombre: string
  apellido: string
  telefono: string
  correo: string
  contrasena: string
  acepto: string
}

const reglas: Reglas<Valores> = {
  nombre: (v) => validarNombre(v, 'nombre'),
  apellido: (v) => validarNombre(v, 'apellido'),
  telefono: validarTelefono,
  correo: validarCorreo,
  contrasena: validarContrasenaNueva,
  acepto: (v) => (v ? null : 'Para crear tu cuenta, acepta el aviso de privacidad.'),
}

const PASOS = ['Tus datos', 'Tu cuenta', 'Privacidad']
const CAMPOS_POR_PASO: (keyof Valores)[][] = [
  ['nombre', 'apellido', 'telefono'],
  ['correo', 'contrasena'],
  ['acepto'],
]

export default function Registro() {
  const [paso, setPaso] = useState(1)
  const { registrar } = useSesion()
  const navigate = useNavigate()
  const { valores, errores, campo, cambiar, validar } = useCampos<Valores>(
    { nombre: '', apellido: '', telefono: '', correo: '', contrasena: '', acepto: '' },
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

  function enviar(e: FormEvent<HTMLFormElement>) {
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
    registrar({
      nombre: valores.nombre.trim(),
      apellido: valores.apellido.trim(),
      correo: valores.correo.trim(),
      telefono: valores.telefono.replace(/[\s-]/g, ''),
    })
    navigate('/', { replace: true })
  }

  const nombrePaso = PASOS[paso - 1]

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
              className="font-titulo text-lg font-semibold outline-none"
            >
              {nombrePaso}
            </h2>
            {paso < PASOS.length && (
              <p className="text-[13px] text-cafe-suave">Todos los campos son obligatorios.</p>
            )}
          </div>

          {paso === 1 && (
            <>
              <CampoTexto
                label="Nombre"
                autoComplete="given-name"
                enterKeyHint="next"
                required
                {...campo('nombre')}
              />
              <CampoTexto
                label="Apellido"
                autoComplete="family-name"
                enterKeyHint="next"
                required
                {...campo('apellido')}
              />
              <CampoTexto
                label="WhatsApp"
                ayuda="10 dígitos, sin lada internacional. Es para que te contacte quien encuentre a tu mascota."
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                enterKeyHint="next"
                required
                {...campo('telefono')}
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
                ayuda="Mínimo 8 caracteres."
                autoComplete="new-password"
                enterKeyHint="next"
                required
                {...campo('contrasena')}
              />
            </>
          )}

          {paso === 3 && (
            <>
              <p className="text-sm text-cafe-suave">
                Usaremos tus datos para identificar a tu mascota y para que quien la encuentre pueda
                avisarte por WhatsApp. Tu teléfono nunca se muestra en pantalla.
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
                    Acepto el{' '}
                    <Link
                      to="/privacidad"
                      target="_blank"
                      className="font-semibold text-naranja-sombra underline"
                    >
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
            <BotonPrincipal type="submit">
              {paso < PASOS.length ? 'Siguiente' : 'Crear cuenta'}
            </BotonPrincipal>
            {paso > 1 && (
              <BotonSecundario onClick={() => setPaso(paso - 1)}>Atrás</BotonSecundario>
            )}
          </div>
        </form>

        {paso === 1 && (
          <p className="text-center text-sm text-cafe-suave">
            ¿Ya tienes cuenta?{' '}
            <Link to="/iniciar-sesion" className="font-semibold text-naranja-sombra underline">
              Inicia sesión
            </Link>
          </p>
        )}
      </main>
    </>
  )
}
