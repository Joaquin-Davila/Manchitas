import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import type { FormEvent } from 'react'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import BotonSecundario from '../../components/ui/BotonSecundario'
import CampoTexto from '../../components/ui/CampoTexto'
import EncabezadoCurvo from '../../components/ui/EncabezadoCurvo'
import MensajeError from '../../components/ui/MensajeError'
import { haySupabase } from '../../lib/supabase'
import { validarContrasenaActual, validarCorreo } from '../../lib/validaciones'
import CampoContrasena from './CampoContrasena'
import { useSesion } from './contextoSesion'
import { useCampos } from './useCampos'
import type { Reglas } from './useCampos'

type Valores = { correo: string; contrasena: string }

// Cuenta de demostración para el jurado. Es PÚBLICA a propósito (se muestra en pantalla): solo
// tiene datos de ejemplo y, por RLS, no ve nada de otras personas. Sale de .env.
const CORREO_DEMO = (import.meta.env.VITE_DEMO_EMAIL as string | undefined) ?? ''
const CONTRASENA_DEMO = (import.meta.env.VITE_DEMO_PASSWORD as string | undefined) ?? ''
const HAY_DEMO = haySupabase && CORREO_DEMO !== '' && CONTRASENA_DEMO !== ''

const reglas: Reglas<Valores> = {
  correo: validarCorreo,
  contrasena: validarContrasenaActual,
}

export default function IniciarSesion() {
  const { iniciarSesion } = useSesion()
  const navigate = useNavigate()
  const [enviando, setEnviando] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState('')
  const { valores, campo, validar } = useCampos<Valores>({ correo: '', contrasena: '' }, reglas)

  async function entrarDemo() {
    setErrorGeneral('')
    setEnviando(true)
    try {
      await iniciarSesion(CORREO_DEMO, CONTRASENA_DEMO)
      navigate('/', { replace: true })
    } catch (error) {
      setErrorGeneral(error instanceof Error ? error.message : 'No pudimos abrir la cuenta de demostración.')
      setEnviando(false)
    }
  }

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const primero = validar(['correo', 'contrasena'])
    if (primero) {
      ;(e.currentTarget.elements.namedItem(primero) as HTMLElement | null)?.focus()
      return
    }
    setErrorGeneral('')
    setEnviando(true)
    try {
      await iniciarSesion(valores.correo.trim(), valores.contrasena)
      navigate('/', { replace: true })
    } catch (error) {
      setErrorGeneral(error instanceof Error ? error.message : 'No pudimos iniciar tu sesión.')
      setEnviando(false)
    }
  }

  return (
    <>
      <EncabezadoCurvo titulo="Iniciar sesión" atras="/bienvenida" />
      <main className="px-5 pb-10 pt-8">
        <form noValidate onSubmit={enviar} aria-label="Iniciar sesión" className="flex flex-col gap-6">
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
            autoComplete="current-password"
            enterKeyHint="done"
            required
            {...campo('contrasena')}
          />
          <Link
            to="/recuperar"
            className="-mt-3 inline-flex min-h-11 w-fit items-center self-end text-sm font-semibold text-naranja-sombra underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
          {errorGeneral && <MensajeError id="error-general">{errorGeneral}</MensajeError>}
          <BotonPrincipal type="submit" disabled={enviando} className="-mt-2">
            {enviando ? 'Entrando…' : 'Iniciar sesión'}
          </BotonPrincipal>
        </form>
        {HAY_DEMO && (
          <section
            aria-labelledby="titulo-demo"
            className="mt-8 rounded-[20px] border border-dashed border-amarillo-borde bg-amarillo-suave p-4"
          >
            <h2 id="titulo-demo" className="flex items-center gap-2 font-titulo text-base font-bold text-cafe">
              <FlaskConical aria-hidden="true" size={18} />
              Acceso de demostración
            </h2>
            <p className="mt-1 text-[13px] text-cafe-suave">
              Cuenta con datos de ejemplo para explorar Manchitas. No uses información real.
            </p>
            <dl className="m-0 mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[13px]">
              <dt className="font-semibold text-cafe-suave">Correo</dt>
              <dd className="m-0 break-all font-semibold text-cafe">{CORREO_DEMO}</dd>
              <dt className="font-semibold text-cafe-suave">Contraseña</dt>
              <dd className="m-0 break-all font-semibold text-cafe">{CONTRASENA_DEMO}</dd>
            </dl>
            <BotonSecundario onClick={entrarDemo} disabled={enviando} className="mt-3">
              Entrar con la cuenta demo
            </BotonSecundario>
          </section>
        )}
        <p className="mt-6 text-center text-sm text-cafe-suave">
          ¿Aún no tienes cuenta?{' '}
          <Link to="/registro" className="inline-flex min-h-11 items-center px-1 font-semibold text-naranja-sombra underline">
            Regístrate
          </Link>
        </p>
      </main>
    </>
  )
}
