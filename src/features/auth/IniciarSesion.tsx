import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { FormEvent } from 'react'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import CampoTexto from '../../components/ui/CampoTexto'
import EncabezadoCurvo from '../../components/ui/EncabezadoCurvo'
import MensajeError from '../../components/ui/MensajeError'
import { validarContrasenaActual, validarCorreo } from '../../lib/validaciones'
import CampoContrasena from './CampoContrasena'
import { useSesion } from './contextoSesion'
import { useCampos } from './useCampos'
import type { Reglas } from './useCampos'

type Valores = { correo: string; contrasena: string }

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
          {errorGeneral && <MensajeError id="error-general">{errorGeneral}</MensajeError>}
          <BotonPrincipal type="submit" disabled={enviando} className="mt-2">
            {enviando ? 'Entrando…' : 'Iniciar sesión'}
          </BotonPrincipal>
        </form>
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
