import { generarToken } from './identificadores'
import { clienteRemoto, haySupabase } from './supabase'

// Chat 1 a 1 con contexto. Todo vive en Supabase y las reglas de acceso están en la base (RLS):
// solo quienes participan leen o escriben. El cliente solo inserta mensajes; el resto (iniciar,
// leer, archivar, bloquear, reportar) son funciones del servidor.

export type TipoChat = 'comunidad' | 'extraviado' | 'adopcion' | 'veterinaria'

export const NOMBRE_TIPO_CHAT: Record<TipoChat, string> = {
  comunidad: 'Comunidad',
  extraviado: 'Mascota extraviada',
  adopcion: 'Adopción',
  veterinaria: 'Veterinaria',
}

export type Conversacion = {
  id: string
  tipo: TipoChat
  contextoId?: string
  contextoTitulo: string
  contextoFoto?: string
  /** Fecha y hora ISO del último mensaje. */
  ultimoEn: string
  ultimoTexto: string
  archivada: boolean
  ultimoLeidoEn: string
  otroId: string
  otroNombre: string
  /** Hasta cuándo leyó la otra persona (para mostrar "Leído"). */
  otroLeidoEn: string
  noLeidos: number
  /** Tú bloqueaste a la otra persona. */
  bloqueado: boolean
  /** La otra persona te bloqueó. */
  meBloqueo: boolean
  demo: boolean
}

export type MensajeChat = {
  id: string
  mio: boolean
  tipo: 'texto' | 'foto' | 'ubicacion'
  texto: string
  /** Ruta en el bucket privado, o "/..." si es una imagen de la app. */
  foto?: string
  lat?: number
  lng?: number
  zona: string
  entregadoEn?: string
  creadoEn: string
  demo: boolean
}

export type EstadoMensaje = 'enviado' | 'recibido' | 'leido'

type FilaBandeja = {
  id: string
  tipo: string
  contexto_id: string | null
  contexto_titulo: string
  contexto_foto: string | null
  ultimo_mensaje_en: string
  ultimo_mensaje_texto: string
  es_demo: boolean
  archivada: boolean
  ultimo_leido_en: string
  otro_id: string
  otro_nombre: string
  otro_leido_en: string
  no_leidos: number
  bloqueado: boolean
  me_bloqueo: boolean
}

function aConversacion(f: FilaBandeja): Conversacion {
  return {
    id: f.id,
    tipo: f.tipo as TipoChat,
    contextoId: f.contexto_id ?? undefined,
    contextoTitulo: f.contexto_titulo,
    contextoFoto: f.contexto_foto ?? undefined,
    ultimoEn: f.ultimo_mensaje_en,
    ultimoTexto: f.ultimo_mensaje_texto,
    archivada: f.archivada,
    ultimoLeidoEn: f.ultimo_leido_en,
    otroId: f.otro_id,
    otroNombre: f.otro_nombre,
    otroLeidoEn: f.otro_leido_en,
    noLeidos: f.no_leidos,
    bloqueado: f.bloqueado,
    meBloqueo: f.me_bloqueo,
    demo: f.es_demo,
  }
}

function mensajeDe(error: { message: string; code?: string }, porDefecto: string): string {
  if (error.message.includes('limite_excedido')) return 'Estás enviando demasiado rápido. Espera un rato e inténtalo de nuevo.'
  if (error.message.includes('bloqueado') || error.message.includes('no_disponible')) return 'No puedes enviar mensajes en esta conversación.'
  if (error.message.includes('sin_destinatario')) return 'Esta persona no está disponible para recibir mensajes por ahora.'
  return porDefecto
}

export async function listarBandeja(): Promise<Conversacion[]> {
  if (!haySupabase) return []
  const { data, error } = await clienteRemoto().from('chat_bandeja').select('*').order('ultimo_mensaje_en', { ascending: false })
  if (error) throw new Error('No pudimos cargar tus conversaciones. Revisa tu conexión.')
  return (data as FilaBandeja[]).map(aConversacion)
}

export async function obtenerConversacion(id: string): Promise<Conversacion | null> {
  if (!haySupabase) return null
  const { data, error } = await clienteRemoto().from('chat_bandeja').select('*').eq('id', id).maybeSingle()
  if (error && error.code !== '22P02') throw new Error('No pudimos cargar la conversación. Revisa tu conexión.')
  return data ? aConversacion(data as FilaBandeja) : null
}

export async function mensajesDeConversacion(id: string, usuarioId?: string): Promise<MensajeChat[]> {
  if (!haySupabase) return []
  const { data, error } = await clienteRemoto()
    .from('chat_mensajes')
    .select('id, autor_id, tipo, texto, foto, lat, lng, zona, entregado_en, es_demo, creado_en')
    .eq('conversacion_id', id)
    .order('creado_en', { ascending: true })
  if (error) throw new Error('No pudimos cargar los mensajes. Revisa tu conexión.')
  return data.map((m) => ({
    id: m.id,
    mio: !!usuarioId && m.autor_id === usuarioId,
    tipo: m.tipo as MensajeChat['tipo'],
    texto: m.texto,
    foto: m.foto ?? undefined,
    lat: m.lat ?? undefined,
    lng: m.lng ?? undefined,
    zona: m.zona,
    entregadoEn: m.entregado_en ?? undefined,
    creadoEn: m.creado_en,
    demo: m.es_demo,
  }))
}

/** Enviado → recibido (la otra persona lo recibió) → leído (la otra persona abrió la conversación). */
export function estadoDeMensaje(m: MensajeChat, otroLeidoEn: string): EstadoMensaje {
  if (Date.parse(otroLeidoEn) >= Date.parse(m.creadoEn)) return 'leido'
  return m.entregadoEn ? 'recibido' : 'enviado'
}

export async function enviarTexto(conversacionId: string, texto: string): Promise<void> {
  const { error } = await clienteRemoto().from('chat_mensajes').insert({ conversacion_id: conversacionId, tipo: 'texto', texto: texto.trim() })
  if (error) throw new Error(mensajeDe(error, 'No pudimos enviar tu mensaje. Inténtalo de nuevo.'))
}

function dataUrlABlob(dataUrl: string): Blob {
  const [cabecera, base64] = dataUrl.split(',')
  const tipo = /^data:(.*?);base64$/.exec(cabecera)?.[1] ?? 'image/jpeg'
  const binario = atob(base64)
  const bytes = new Uint8Array(binario.length)
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i)
  return new Blob([bytes], { type: tipo })
}

/** Sube la foto al bucket privado (carpeta = id de la conversación) y la envía como mensaje. */
export async function enviarFoto(conversacionId: string, dataUrl: string, texto = ''): Promise<void> {
  const ruta = `${conversacionId}/${generarToken()}.jpg`
  const { error: errSubida } = await clienteRemoto()
    .storage.from('chat-fotos')
    .upload(ruta, dataUrlABlob(dataUrl), { contentType: 'image/jpeg', cacheControl: '3600' })
  if (errSubida) throw new Error('No pudimos subir la foto. Revisa tu conexión e inténtalo de nuevo.')
  const { error } = await clienteRemoto()
    .from('chat_mensajes')
    .insert({ conversacion_id: conversacionId, tipo: 'foto', foto: ruta, texto: texto.trim() })
  if (error) throw new Error(mensajeDe(error, 'No pudimos enviar la foto. Inténtalo de nuevo.'))
}

/** Envía una ubicación APROXIMADA: el servidor redondea las coordenadas (~1 km). */
export async function enviarUbicacion(conversacionId: string, lat: number, lng: number, zona: string): Promise<void> {
  const { error } = await clienteRemoto()
    .from('chat_mensajes')
    .insert({ conversacion_id: conversacionId, tipo: 'ubicacion', lat, lng, zona: zona.trim() })
  if (error) throw new Error(mensajeDe(error, 'No pudimos enviar la ubicación. Inténtalo de nuevo.'))
}

/** Imagen de un mensaje: las de la app se usan tal cual; las del bucket privado, con URL firmada de 1 hora. */
export async function urlFotoChat(ruta: string | undefined): Promise<string | undefined> {
  if (!ruta) return undefined
  if (ruta.startsWith('/') || ruta.startsWith('http')) return ruta
  const { data } = await clienteRemoto().storage.from('chat-fotos').createSignedUrl(ruta, 3600)
  return data?.signedUrl
}

export async function iniciarConversacion(tipo: TipoChat, contextoId: string | null, con?: string): Promise<string> {
  const { data, error } = await clienteRemoto().rpc('iniciar_conversacion', { p_tipo: tipo, p_contexto: contextoId, p_con: con ?? null })
  if (error) throw new Error(mensajeDe(error, 'No pudimos abrir la conversación. Inténtalo de nuevo.'))
  return data as string
}

export async function marcarLeida(id: string): Promise<void> {
  await clienteRemoto().rpc('marcar_leida', { p_conv: id })
}

export async function marcarEntregados(): Promise<void> {
  await clienteRemoto().rpc('marcar_entregados')
}

export async function archivarConversacion(id: string, valor: boolean): Promise<void> {
  const { error } = await clienteRemoto().rpc('archivar_conversacion', { p_conv: id, p_valor: valor })
  if (error) throw new Error('No pudimos archivar la conversación. Inténtalo de nuevo.')
}

export async function bloquearUsuario(id: string, bloquear: boolean): Promise<void> {
  const { error } = bloquear
    ? await clienteRemoto().rpc('bloquear_usuario', { p_id: id })
    : await clienteRemoto().rpc('desbloquear_usuario', { p_id: id })
  if (error) throw new Error('No pudimos actualizar el bloqueo. Inténtalo de nuevo.')
}

export type MotivoReporteChat = 'spam' | 'acoso' | 'estafa' | 'contenido_inapropiado' | 'otro'
export const NOMBRE_MOTIVO: Record<MotivoReporteChat, string> = {
  spam: 'Mensajes no deseados (spam)',
  acoso: 'Acoso o agresiones',
  estafa: 'Intento de estafa',
  contenido_inapropiado: 'Contenido inapropiado',
  otro: 'Otro motivo',
}

export async function reportarConversacion(id: string, motivo: MotivoReporteChat, detalle: string): Promise<void> {
  const { error } = await clienteRemoto().rpc('reportar_conversacion', { p_conv: id, p_motivo: motivo, p_detalle: detalle })
  if (error) throw new Error(mensajeDe(error, 'No pudimos enviar tu reporte. Inténtalo de nuevo.'))
}

export async function contarNoLeidos(): Promise<number> {
  if (!haySupabase) return 0
  const { data, error } = await clienteRemoto().rpc('chat_no_leidos')
  return error ? 0 : ((data as number | null) ?? 0)
}

/**
 * Se entera en tiempo real de mensajes nuevos y de lecturas (RLS: solo llegan las de tus
 * conversaciones). Devuelve la función que cancela la suscripción.
 */
export function suscribirChat(alCambiar: () => void): () => void {
  if (!haySupabase) return () => undefined
  const db = clienteRemoto()
  const canal = db
    .channel(`chat-${generarToken().slice(0, 8)}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_mensajes' }, alCambiar)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_participantes' }, alCambiar)
    .subscribe()
  return () => {
    void db.removeChannel(canal)
  }
}

/** Mensajes rápidos según el contexto de la conversación. */
export const PREDEFINIDOS: Record<TipoChat, string[]> = {
  extraviado: ['Creo haber visto a tu mascota.', '¿Tienes más fotos para reconocerla?', 'Estoy cerca, ¿en qué te puedo ayudar?'],
  adopcion: ['Me interesa, ¿sigue disponible?', '¿Cómo es el proceso de adopción?', '¿Puedo agendar una visita?'],
  veterinaria: ['¿Tienen cita disponible esta semana?', '¿Qué documentos debo llevar?', '¿Cuál es el costo de la consulta?'],
  comunidad: ['Hola, vi tu publicación.', 'Gracias por tu ayuda.', '¿Puedes darme más información?'],
}

/** Enlace de OpenStreetMap a un punto aproximado, sin clave. */
export function enlaceUbicacionChat(lat: number, lng: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=14/${lat}/${lng}`
}
