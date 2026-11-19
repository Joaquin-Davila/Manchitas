import { MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MensajeError from '../../components/ui/MensajeError'
import { iniciarConversacion } from '../../lib/chat'
import type { TipoChat } from '../../lib/chat'
import { haySupabase } from '../../lib/supabase'
import { clasesFoco } from '../mascotas/inicio/comun'

/**
 * Abre (o reutiliza) la conversación con quien corresponde según el contexto y va al chat. El
 * servidor decide con quién se habla: el cliente solo pide el contexto, no el destinatario (salvo
 * en conversaciones de comunidad).
 */
export default function BotonEscribir({
  tipo,
  contextoId,
  con,
  etiqueta,
  compacto = false,
}: {
  tipo: TipoChat
  contextoId: string | null
  /** Solo para conversaciones de comunidad: la otra persona. */
  con?: string
  etiqueta: string
  compacto?: boolean
}) {
  const navigate = useNavigate()
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  if (!haySupabase) return null

  async function abrir() {
    setError('')
    setCargando(true)
    try {
      const id = await iniciarConversacion(tipo, contextoId, con)
      navigate(`/mensajes/${id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos abrir la conversación.')
      setCargando(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={abrir}
        disabled={cargando}
        className={
          compacto
            ? `inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-semibold text-naranja-sombra underline ${clasesFoco}`
            : `inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-naranja px-6 text-[15px] font-semibold text-white shadow-boton ${clasesFoco}`
        }
      >
        <MessageCircle aria-hidden="true" size={compacto ? 15 : 18} />
        {cargando ? 'Abriendo…' : etiqueta}
      </button>
      {error && <MensajeError id={`error-escribir-${tipo}`}>{error}</MensajeError>}
    </div>
  )
}
