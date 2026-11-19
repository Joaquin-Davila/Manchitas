import { Navigate, Outlet } from 'react-router-dom'
import { haySupabase } from '../../lib/supabase'
import { useSesion } from '../auth/contextoSesion'

// Solo entra quien tiene el rol de autoridad. Sin Supabase (modo local) nadie lo tiene, así que
// /autoridad lleva al inicio. Es una comodidad: la protección real son las políticas de la base.
export default function RutaAutoridad() {
  const { sesion } = useSesion()
  return haySupabase && sesion?.rol === 'autoridad' ? <Outlet /> : <Navigate to="/" replace />
}
