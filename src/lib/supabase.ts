import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

// Cliente de Supabase. Si faltan las variables de entorno (.env, fuera de git) vale null y
// la app sigue en modo local: datos en localStorage y sesión simulada. Solo se usa la clave
// anónima, que es pública por diseño; la seguridad está en las políticas RLS de la base.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const claveAnonima = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase: SupabaseClient | null =
  url && claveAnonima ? createClient(url, claveAnonima) : null

export const haySupabase = supabase !== null

/** Para las implementaciones remotas: falla con claridad si se llaman sin configuración. */
export function clienteRemoto(): SupabaseClient {
  if (!supabase) throw new Error('Supabase no está configurado.')
  return supabase
}
