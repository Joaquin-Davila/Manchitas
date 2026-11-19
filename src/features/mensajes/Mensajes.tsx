import { MessageCircle } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { listarBandeja, marcarEntregados, marcarLeida, mensajesDeConversacion, suscribirChat } from '../../lib/chat'
import { haySupabase } from '../../lib/supabase'
import { useCarga } from '../../lib/useCarga'
import { useSesion } from '../auth/contextoSesion'
import { Aparecer, clasesFoco, clasesTarjeta } from '../mascotas/inicio/comun'
import HiloConversacion from './HiloConversacion'
import ListaConversaciones from './ListaConversaciones'

/**
 * Mensajes. En móvil son dos pantallas (/mensajes y /mensajes/:id); desde `lg`, la lista y la
 * conversación van lado a lado. Se actualiza en tiempo real con Supabase Realtime.
 */
export default function Mensajes() {
  const { id } = useParams()
  const { sesion } = useSesion()
  const usuarioId = sesion?.id
  const [ahora, setAhora] = useState(() => new Date())
  const bandeja = useCarga(`bandeja-${usuarioId ?? ''}`, listarBandeja)
  const mensajes = useCarga(`hilo-${id ?? 'ninguno'}-${usuarioId ?? ''}`, () => (id ? mensajesDeConversacion(id, usuarioId) : Promise.resolve([])))

  const recargarBandeja = bandeja.recargar
  const recargarMensajes = mensajes.recargar
  const abierta = useRef(id)
  useEffect(() => {
    abierta.current = id
  }, [id])

  // Al abrir la bandeja los mensajes pendientes pasan a "recibido".
  useEffect(() => {
    if (haySupabase) void marcarEntregados()
  }, [])

  // Tiempo real: cada mensaje nuevo o lectura recarga la bandeja y, si está abierta, la conversación.
  const alCambiar = useCallback(() => {
    setAhora(new Date())
    recargarBandeja()
    if (abierta.current) {
      recargarMensajes()
      void marcarLeida(abierta.current)
    }
  }, [recargarBandeja, recargarMensajes])
  useEffect(() => suscribirChat(alCambiar), [alCambiar])

  // Al abrir una conversación se marca como leída.
  const conversacionId = id
  useEffect(() => {
    if (!conversacionId || !haySupabase) return
    let vigente = true
    marcarLeida(conversacionId).then(() => {
      if (vigente) recargarBandeja()
    })
    return () => {
      vigente = false
    }
  }, [conversacionId, recargarBandeja])

  if (!haySupabase) {
    return (
      <div role="status" className={`p-5 text-sm ${clasesTarjeta}`}>
        Los mensajes requieren conexión con la base de datos de Manchitas y no están disponibles en modo local.
      </div>
    )
  }

  const conversaciones = bandeja.datos ?? []
  const actual = conversaciones.find((c) => c.id === id)

  const lista = bandeja.cargando ? (
    <p role="status" className="text-sm text-cafe-suave">Cargando conversaciones…</p>
  ) : bandeja.error && conversaciones.length === 0 ? (
    <div role="alert" className={`flex flex-col items-start gap-3 p-5 text-sm ${clasesTarjeta}`}>
      {bandeja.error}
      <button type="button" onClick={bandeja.recargar} className="min-h-11 font-semibold text-naranja-sombra underline">Reintentar</button>
    </div>
  ) : (
    <ListaConversaciones conversaciones={conversaciones} activaId={id} ahora={ahora} />
  )

  const hilo = !id ? (
    <div className={`hidden h-full min-h-[420px] flex-col items-center justify-center gap-3 p-8 text-center lg:flex ${clasesTarjeta}`}>
      <span aria-hidden="true" className="flex size-14 items-center justify-center rounded-2xl bg-menta-suave text-salud-trazo"><MessageCircle size={28} /></span>
      <p className="font-titulo text-lg font-bold text-cafe">Elige una conversación</p>
      <p className="max-w-xs text-sm text-cafe-suave">Aquí verás tus mensajes con tutores, rescatistas y veterinarias. Nunca mostramos tu teléfono.</p>
    </div>
  ) : bandeja.cargando || mensajes.cargando ? (
    <p role="status" className="text-sm text-cafe-suave">Cargando conversación…</p>
  ) : !actual ? (
    <div role="status" className={`flex flex-col items-start gap-3 p-5 text-sm ${clasesTarjeta}`}>
      No encontramos esta conversación o no participas en ella.
      <Link to="/mensajes" className={`font-semibold text-naranja-sombra underline ${clasesFoco}`}>Ver mis conversaciones</Link>
    </div>
  ) : (
    <HiloConversacion
      c={actual}
      mensajes={mensajes.datos ?? []}
      onCambio={() => {
        recargarBandeja()
        recargarMensajes()
      }}
      volverA="/mensajes"
    />
  )

  return (
    <div className="flex flex-col gap-4">
      <Aparecer className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-titulo text-[26px] font-bold leading-tight text-cafe md:text-[32px]">Mensajes</h2>
          <p className="text-[15px] text-cafe-suave">Habla con la comunidad sin compartir tu teléfono.</p>
        </div>
      </Aparecer>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-stretch">
        {/* En móvil se ve la lista o la conversación, no las dos. */}
        <div className={id ? 'hidden lg:block' : ''}>{lista}</div>
        <div className={`${id ? '' : 'hidden lg:block'} h-[calc(100dvh-17rem)] min-h-[420px] lg:h-[calc(100dvh-14rem)]`}>{hilo}</div>
      </div>
    </div>
  )
}
