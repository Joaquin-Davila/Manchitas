import { clienteRemoto, haySupabase } from './supabase'

// Notificaciones del usuario (tabla `notificaciones`). Las crea el servidor (triggers y la
// automatización); el cliente solo las lee. Sin Supabase no hay ninguna.

export type Notificacion = {
  id: string
  tipo: string
  titulo: string
  texto: string
  enlace?: string
  leida: boolean
  /** Fecha y hora ISO. */
  creadaEn: string
  demo: boolean
}

export async function listarNotificaciones(limite = 50): Promise<Notificacion[]> {
  if (!haySupabase) return []
  const { data, error } = await clienteRemoto()
    .from('notificaciones')
    .select('id, tipo, titulo, texto, enlace, leida, es_demo, creado_en')
    .order('creado_en', { ascending: false })
    .limit(limite)
  if (error) throw new Error('No pudimos cargar tus notificaciones. Revisa tu conexión.')
  return data.map((n) => ({
    id: n.id,
    tipo: n.tipo,
    titulo: n.titulo,
    texto: n.texto,
    enlace: n.enlace ?? undefined,
    leida: n.leida,
    creadaEn: n.creado_en,
    demo: n.es_demo,
  }))
}

/** Marca una notificación como leída en la base (solo se puede cambiar ese campo). */
export async function marcarNotificacionLeida(id: string): Promise<void> {
  if (!haySupabase) return
  await clienteRemoto().from('notificaciones').update({ leida: true }).eq('id', id)
}

export async function marcarTodasLeidas(): Promise<void> {
  if (!haySupabase) return
  await clienteRemoto().from('notificaciones').update({ leida: true }).eq('leida', false)
}

/** Se entera en tiempo real de notificaciones nuevas (RLS: solo llegan las tuyas). */
export function suscribirNotificaciones(alCambiar: () => void): () => void {
  if (!haySupabase) return () => undefined
  const db = clienteRemoto()
  const canal = db
    .channel(`notificaciones-${Math.random().toString(36).slice(2, 10)}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'notificaciones' }, alCambiar)
    .subscribe()
  return () => {
    void db.removeChannel(canal)
  }
}
