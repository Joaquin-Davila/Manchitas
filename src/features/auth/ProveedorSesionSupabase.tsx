import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { clienteRemoto } from '../../lib/supabase'
import { ContextoSesion } from './contextoSesion'
import type { Sesion, ValorSesion } from './contextoSesion'

// Versión del aviso de privacidad que se acepta al registrarse (el texto sigue en borrador
// hasta la revisión legal; al cambiarlo, subir esta versión).
const VERSION_AVISO = 'borrador-1'

type Usuario = { id: string; correo: string; meta: Record<string, unknown> }

/** Traduce los errores de Supabase Auth a mensajes en español para quien usa la app. */
function mensajeError(error: { message: string; code?: string; status?: number }): string {
  const texto = `${error.code ?? ''} ${error.message}`.toLowerCase()
  if (texto.includes('invalid login') || texto.includes('invalid_credentials'))
    return 'El correo o la contraseña no son correctos.'
  if (texto.includes('email not confirmed') || texto.includes('email_not_confirmed'))
    return 'Aún no confirmas tu correo. Revisa tu bandeja de entrada.'
  if (texto.includes('already registered') || texto.includes('user_already_exists'))
    return 'Ya existe una cuenta con ese correo. Prueba iniciar sesión.'
  if (texto.includes('weak_password') || texto.includes('password'))
    return 'La contraseña no es válida. Usa al menos 8 caracteres.'
  if (texto.includes('rate limit') || texto.includes('too many') || error.status === 429)
    return 'Hiciste demasiados intentos. Espera unos minutos e inténtalo de nuevo.'
  if (texto.includes('fetch') || texto.includes('network'))
    return 'No pudimos conectarnos. Revisa tu internet e inténtalo de nuevo.'
  return 'No pudimos completar la operación. Inténtalo de nuevo.'
}

function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor : ''
}

export default function ProveedorSesionSupabase({ children }: { children: ReactNode }) {
  // undefined = todavía restaurando la sesión; null = sin sesión.
  const [usuario, setUsuario] = useState<Usuario | null | undefined>(undefined)
  const [perfil, setPerfil] = useState<(Sesion & { id: string }) | null>(null)

  // Estado de Auth: sesión guardada al abrir y cambios posteriores (inicio, cierre, renovación).
  useEffect(() => {
    const supabase = clienteRemoto()
    const aUsuario = (u: { id: string; email?: string; user_metadata?: Record<string, unknown> } | undefined) =>
      u ? { id: u.id, correo: u.email ?? '', meta: u.user_metadata ?? {} } : null

    supabase.auth.getSession().then(({ data }) => {
      setUsuario((previo) => previo ?? aUsuario(data.session?.user))
    })
    const { data } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      const nuevo = aUsuario(sesion?.user)
      // La renovación del token no debe provocar recargas: se conserva el mismo objeto.
      setUsuario((previo) => (previo && nuevo && previo.id === nuevo.id ? previo : nuevo))
    })
    return () => data.subscription.unsubscribe()
  }, [])

  // Perfil del tutor (nombre, apellido, WhatsApp). Si falla la lectura se usan los datos del registro.
  const idUsuario = usuario?.id
  useEffect(() => {
    if (!usuario || !idUsuario) return
    let vigente = true
    const respaldo: Sesion & { id: string } = {
      id: usuario.id,
      nombre: texto(usuario.meta.nombre) || 'Tutor',
      apellido: texto(usuario.meta.apellido),
      correo: usuario.correo,
      telefono: texto(usuario.meta.telefono) || undefined,
    }
    clienteRemoto()
      .from('perfiles')
      .select('nombre, apellido, telefono, rol')
      .eq('id', idUsuario)
      .maybeSingle()
      .then(({ data }) => {
        if (!vigente) return
        setPerfil(
          data
            ? {
                ...respaldo,
                nombre: data.nombre,
                apellido: data.apellido ?? '',
                telefono: data.telefono ?? undefined,
                rol: data.rol === 'autoridad' ? 'autoridad' : 'tutor',
              }
            : respaldo,
        )
      })
    return () => {
      vigente = false
    }
    // `usuario` cambia de objeto solo cuando cambia la persona (ver onAuthStateChange).
  }, [usuario, idUsuario])

  const valor = useMemo<ValorSesion>(() => {
    const sesion = usuario && perfil && perfil.id === usuario.id ? perfil : null
    return {
      sesion,
      cargando: usuario === undefined || (usuario !== null && sesion === null),
      async iniciarSesion(correo, contrasena) {
        const { error } = await clienteRemoto().auth.signInWithPassword({ email: correo, password: contrasena })
        if (error) throw new Error(mensajeError(error))
      },
      async registrar(datos, contrasena) {
        const { data, error } = await clienteRemoto().auth.signUp({
          email: datos.correo,
          password: contrasena,
          options: {
            data: {
              nombre: datos.nombre,
              apellido: datos.apellido,
              telefono: datos.telefono ?? '',
              acepto_privacidad: true,
              version_aviso: VERSION_AVISO,
            },
          },
        })
        if (error) throw new Error(mensajeError(error))
        return { requiereConfirmacion: !data.session }
      },
      async cerrarSesion() {
        await clienteRemoto().auth.signOut()
        setPerfil(null)
      },
    }
  }, [usuario, perfil])

  return <ContextoSesion value={valor}>{children}</ContextoSesion>
}
