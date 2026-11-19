import { MessageCircle } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { contarNoLeidos, suscribirChat } from '../../lib/chat'
import { haySupabase } from '../../lib/supabase'
import { useCarga } from '../../lib/useCarga'
import { useSesion } from '../auth/contextoSesion'

/** Botón del encabezado hacia Mensajes, con el número de mensajes sin leer (en tiempo real). */
export default function BotonMensajes() {
  const { sesion } = useSesion()
  const { datos, recargar } = useCarga(`no-leidos-${sesion?.id ?? ''}`, contarNoLeidos)
  const alCambiar = useCallback(() => recargar(), [recargar])
  useEffect(() => (haySupabase ? suscribirChat(alCambiar) : undefined), [alCambiar])
  if (!haySupabase) return null
  const n = datos ?? 0
  return (
    <Link
      to="/mensajes"
      aria-label={n > 0 ? `Mensajes, ${n} sin leer` : 'Mensajes'}
      className="relative flex size-11 items-center justify-center rounded-full bg-crema text-cafe focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naranja-sombra"
    >
      <MessageCircle aria-hidden="true" size={24} />
      {n > 0 && (
        <span aria-hidden="true" className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-naranja px-1 text-[11px] font-bold leading-5 text-white">
          {n > 9 ? '9+' : n}
        </span>
      )}
    </Link>
  )
}
