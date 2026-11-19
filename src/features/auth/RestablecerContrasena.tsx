import { LinkIcon } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import EncabezadoCurvo from '../../components/ui/EncabezadoCurvo'
import MensajeError from '../../components/ui/MensajeError'
import { requisitosContrasena, validarConfirmacionContrasena, validarContrasenaNueva } from '../../lib/validaciones'
import CampoContrasena from './CampoContrasena'
import { useSesion } from './contextoSesion'
import { useCampos } from './useCampos'
import type { Reglas } from './useCampos'

type Valores = { contrasena: string; confirmacion: string }
const reglas: Reglas<Valores> = {
  contrasena: validarContrasenaNueva,
  confirmacion: (v, todos) => validarConfirmacionContrasena(v, todos.contrasena),
}

// Paso 2: la persona llega desde el enlace del correo. Supabase abre una sesión temporal de
// recuperación al leer el enlace; con ella se fija la contraseña nueva. Sin esa sesión (enlace
// vencido o abierto sin correo) se explica qué hacer.
export default function RestablecerContrasena() {
  const { sesion, cargando, actualizarContrasena } = useSesion()
  const navigate = useNavigate()
  const [enviando, setEnviando] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState('')
  const { valores, campo, validar } = useCampos<Valores>({ contrasena: '', confirmacion: '' }, reglas)

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const primero = validar(['contrasena', 'confirmacion'])
    if (primero) {
      ;(e.currentTarget.elements.namedItem(primero) as HTMLElement | null)?.focus()
      return
    }
    setErrorGeneral('')
    setEnviando(true)
    try {
      await actualizarContrasena(valores.contrasena)
      navigate('/', { replace: true })
    } catch (error) {
      setErrorGeneral(error instanceof Error ? error.message : 'No pudimos cambiar tu contraseña.')
      setEnviando(false)
    }
  }

  return (
    <>
      <EncabezadoCurvo titulo="Nueva contraseña" atras="/iniciar-sesion" />
      <main className="px-5 pb-10 pt-8">
        {cargando ? (
          <p role="status" className="text-sm text-cafe-suave">
            Verificando tu enlace…
          </p>
        ) : !sesion ? (
          <div role="alert" className="flex flex-col items-start gap-4">
            <span aria-hidden="true" className="flex size-12 items-center justify-center rounded-2xl bg-aviso-fondo text-cafe">
              <LinkIcon size={24} />
            </span>
            <p className="text-sm">
              Este enlace ya no es válido o venció. Pide uno nuevo para elegir tu contraseña.
            </p>
            <BotonPrincipal to="/recuperar">Pedir otro enlace</BotonPrincipal>
          </div>
        ) : (
          <form noValidate onSubmit={enviar} aria-label="Elegir contraseña nueva" className="flex flex-col gap-6">
            <p className="text-sm text-cafe-suave">Elige una contraseña nueva para {sesion.correo}.</p>
            <CampoContrasena label="Contraseña nueva" autoComplete="new-password" required {...campo('contrasena')} />
            <ul aria-label="Requisitos de la contraseña" className="m-0 -mt-3 list-none p-0 text-[13px] text-cafe-suave">
              {requisitosContrasena(valores.contrasena).map(({ texto, cumple }) => (
                <li key={texto} className={cumple ? 'font-semibold text-salud-trazo' : ''}>
                  {texto}
                  <span className="sr-only">{cumple ? ' (cumplido)' : ' (pendiente)'}</span>
                </li>
              ))}
            </ul>
            <CampoContrasena label="Confirma tu contraseña" autoComplete="new-password" required {...campo('confirmacion')} />
            {errorGeneral && <MensajeError id="error-general">{errorGeneral}</MensajeError>}
            <BotonPrincipal type="submit" disabled={enviando}>
              {enviando ? 'Guardando…' : 'Guardar contraseña'}
            </BotonPrincipal>
          </form>
        )}
      </main>
    </>
  )
}
