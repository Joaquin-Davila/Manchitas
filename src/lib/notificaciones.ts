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
