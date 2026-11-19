import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { haySupabase } from '../../lib/supabase'
import { ContextoSesion } from './contextoSesion'
import type { Sesion, ValorSesion } from './contextoSesion'
import ProveedorSesionSupabase from './ProveedorSesionSupabase'

// Con Supabase configurado (.env) la sesión es real (Supabase Auth). Sin él, el prototipo
// sigue en modo local: sesión simulada, sin verificar contraseñas.
export default function ProveedorSesion({ children }: { children: ReactNode }) {
  return haySupabase ? (
    <ProveedorSesionSupabase>{children}</ProveedorSesionSupabase>
  ) : (
    <ProveedorSesionLocal>{children}</ProveedorSesionLocal>
  )
}

// --- Modo local (sin Supabase) -----------------------------------------------------------
// No se verifica ninguna contraseña ni se guarda en ningún lado. Solo se recuerda nombre y correo.
const CLAVE_SESION = 'manchitas.sesion'
const CLAVE_CUENTA = 'manchitas.cuenta'

function leer(clave: string): Sesion | null {
  try {
    const texto = localStorage.getItem(clave)
    return texto ? (JSON.parse(texto) as Sesion) : null
  } catch {
    return null
  }
}

function guardar(clave: string, valor: Sesion | null) {
  try {
    if (valor) localStorage.setItem(clave, JSON.stringify(valor))
    else localStorage.removeItem(clave)
  } catch {
    // Sin almacenamiento (modo privado): la sesión dura solo mientras la pestaña esté abierta.
  }
}

/** "joaquin.davila6@correo.com" → "Joaquin" (solo para la simulación) */
function nombreDesdeCorreo(correo: string): string {
  const base = correo.split('@')[0].split(/[._-]/)[0].replace(/\d+/g, '')
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : 'Tutor'
}

function ProveedorSesionLocal({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(() => leer(CLAVE_SESION))

  const valor = useMemo<ValorSesion>(
    () => ({
      sesion,
      cargando: false,
      async iniciarSesion(correo) {
        const cuenta = leer(CLAVE_CUENTA)
        const nueva: Sesion =
          cuenta && cuenta.correo.toLowerCase() === correo.toLowerCase()
            ? cuenta
            : { nombre: nombreDesdeCorreo(correo), apellido: '', correo }
        guardar(CLAVE_SESION, nueva)
        setSesion(nueva)
      },
      async registrar(datos) {
        guardar(CLAVE_CUENTA, datos)
        guardar(CLAVE_SESION, datos)
        setSesion(datos)
        return { requiereConfirmacion: false }
      },
      async cerrarSesion() {
        guardar(CLAVE_SESION, null)
        setSesion(null)
      },
      // Modo local: no hay correo ni contraseñas reales.
      async recuperarContrasena() {},
      async actualizarContrasena() {
        throw new Error('La recuperación de contraseña requiere conectar Supabase.')
      },
    }),
    [sesion],
  )

  return <ContextoSesion value={valor}>{children}</ContextoSesion>
}
