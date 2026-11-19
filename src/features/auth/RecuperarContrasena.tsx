import { MailCheck } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import CampoTexto from '../../components/ui/CampoTexto'
import EncabezadoCurvo from '../../components/ui/EncabezadoCurvo'
import MensajeError from '../../components/ui/MensajeError'
import { validarCorreo } from '../../lib/validaciones'
import { useSesion } from './contextoSesion'
import { useCampos } from './useCampos'
import type { Reglas } from './useCampos'

type Valores = { correo: string }
const reglas: Reglas<Valores> = { correo: validarCorreo }

// Paso 1 de la recuperación: pide el correo y envía el enlace. La respuesta es la misma exista o no
// la cuenta, para no revelar quién está registrado.
export default function RecuperarContrasena() {
  const { recuperarContrasena } = useSesion()
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState('')
  const { valores, campo, validar } = useCampos<Valores>({ correo: '' }, reglas)

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const primero = validar(['correo'])
    if (primero) {
      ;(e.currentTarget.elements.namedItem(primero) as HTMLElement | null)?.focus()
      return
    }
    setErrorGeneral('')
    setEnviando(true)
    try {
      await recuperarContrasena(valores.correo.trim())
      setEnviado(true)
    } catch (error) {
      setErrorGeneral(error instanceof Error ? error.message : 'No pudimos enviar el enlace.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <EncabezadoCurvo titulo="Recupera tu contraseña" atras="/iniciar-sesion" />
      <main className="px-5 pb-10 pt-8">
        {enviado ? (
          <div role="status" className="flex flex-col items-start gap-4">
            <span aria-hidden="true" className="flex size-12 items-center justify-center rounded-2xl bg-menta-suave text-salud-trazo">
              <MailCheck size={24} />
            </span>
            <p className="text-sm">
              Si hay una cuenta con <strong>{valores.correo.trim()}</strong>, te enviamos un enlace para elegir una
              contraseña nueva. Puede tardar unos minutos; revisa también el correo no deseado.
            </p>
            <BotonPrincipal to="/iniciar-sesion">Volver a iniciar sesión</BotonPrincipal>
          </div>
        ) : (
          <form noValidate onSubmit={enviar} aria-label="Recuperar contraseña" className="flex flex-col gap-6">
            <p className="text-sm text-cafe-suave">
              Escribe el correo de tu cuenta y te enviaremos un enlace para elegir otra contraseña.
            </p>
            <CampoTexto
              label="Correo electrónico"
              type="email"
              autoComplete="username"
              inputMode="email"
              enterKeyHint="done"
              spellCheck={false}
              required
              {...campo('correo')}
            />
            {errorGeneral && <MensajeError id="error-general">{errorGeneral}</MensajeError>}
            <BotonPrincipal type="submit" disabled={enviando}>
              {enviando ? 'Enviando…' : 'Enviar enlace'}
            </BotonPrincipal>
            <p className="text-center text-sm text-cafe-suave">
              ¿La recordaste?{' '}
              <Link to="/iniciar-sesion" className="inline-flex min-h-11 items-center px-1 font-semibold text-naranja-sombra underline">
                Inicia sesión
              </Link>
            </p>
          </form>
        )}
      </main>
    </>
  )
}
