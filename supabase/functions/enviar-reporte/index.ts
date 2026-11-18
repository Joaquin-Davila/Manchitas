// Función de Edge: recibe un reporte ciudadano sin cuenta.
//
// Hace en el servidor lo que el cliente no puede garantizar:
//   - valida todos los campos y las fotos (solo JPEG, máximo 3 y 2 MB cada una);
//   - aplica el límite de 3 envíos por IP cada 24 horas (la IP se guarda solo como hash);
//   - sube la evidencia al bucket privado `reportes-evidencia` y guarda el reporte con la
//     clave de servicio, que nunca sale de aquí;
//   - ignora los envíos que traen lleno el campo trampa, pero responde igual que a una persona.
// Devuelve solo el folio de seguimiento.
import { createClient } from 'npm:@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const TIPOS = ['maltrato', 'abandono', 'herido', 'suelto', 'venta', 'otro']
const MAX_FOTOS = 3
const MAX_BYTES_FOTO = 2 * 1024 * 1024
const MAX_BYTES_CUERPO = 8 * 1024 * 1024
const LIMITE_ENVIOS = 3
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

// `paso` dice en qué etapa falló un error del servidor (sin datos internos); el detalle va al registro.
function fallo(paso: string, detalle: unknown) {
  console.error(`enviar-reporte: falla en ${paso}:`, detalle)
  return responder(500, { error: 'No pudimos enviar tu reporte. Inténtalo de nuevo.', paso })
}

function responder(estado: number, cuerpo: Record<string, unknown>) {
  return new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

function folioFalso(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  return 'REP-' + Array.from(bytes, (b) => ALFABETO[b % 32]).join('')
}

function texto(valor: unknown, max: number, obligatorio = false): string | null {
  const t = typeof valor === 'string' ? valor.trim() : ''
  if (obligatorio && !t) return null
  return t.length <= max ? t : null
}

/** Decodifica una foto "data:image/jpeg;base64,..." y comprueba tipo, tamaño y firma del archivo. */
function decodificarFoto(valor: unknown): Uint8Array | null {
  if (typeof valor !== 'string') return null
  const prefijo = 'data:image/jpeg;base64,'
  if (!valor.startsWith(prefijo)) return null
  let bytes: Uint8Array
  try {
    bytes = Uint8Array.from(atob(valor.slice(prefijo.length)), (c) => c.charCodeAt(0))
  } catch {
    return null
  }
  if (bytes.length === 0 || bytes.length > MAX_BYTES_FOTO) return null
  // Todo JPEG empieza con FF D8 FF.
  return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff ? bytes : null
}

function ipDelCliente(req: Request): string {
  const reenviada = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return reenviada || req.headers.get('cf-connecting-ip') || 'sin-ip'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return responder(405, { error: 'Método no permitido.' })

  if (Number(req.headers.get('content-length') ?? 0) > MAX_BYTES_CUERPO) {
    return responder(413, { error: 'El reporte pesa demasiado. Prueba con menos fotos o más pequeñas.' })
  }

  let cuerpo: { datos?: Record<string, unknown>; trampa?: unknown }
  try {
    cuerpo = await req.json()
  } catch {
    return responder(400, { error: 'No pudimos leer tu reporte.' })
  }
  const d = cuerpo.datos ?? {}

  // --- Validación ---
  const tipo = typeof d.tipo === 'string' && TIPOS.includes(d.tipo) ? d.tipo : null
  const descripcion = texto(d.descripcion, 2000, true)
  const colonia = texto(d.colonia, 120)
  const calle = texto(d.calle, 160)
  const referencias = texto(d.referencias, 300)
  const telefonoCrudo = texto(d.telefono ?? '', 30)
  const telefono = telefonoCrudo ? telefonoCrudo.replace(/\D/g, '') : ''
  const fecha = typeof d.fechaHechos === 'string' ? d.fechaHechos : ''
  const lat = d.lat === undefined || d.lat === null ? null : Number(d.lat)
  const lng = d.lng === undefined || d.lng === null ? null : Number(d.lng)
  const fotosCrudas = Array.isArray(d.fotos) ? d.fotos : []

  const manana = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const fechaValida = /^\d{4}-\d{2}-\d{2}$/.test(fecha) && !Number.isNaN(Date.parse(fecha)) && fecha <= manana
  const coordenadasValidas =
    (lat === null && lng === null) ||
    (lat !== null && lng !== null && Math.abs(lat) <= 90 && Math.abs(lng) <= 180)
  const fotos = fotosCrudas.length <= MAX_FOTOS ? fotosCrudas.map(decodificarFoto) : []

  if (
    !tipo || !descripcion || colonia === null || calle === null || referencias === null ||
    !fechaValida || !coordenadasValidas || (telefono && telefono.length !== 10) ||
    fotosCrudas.length > MAX_FOTOS || fotos.some((f) => f === null)
  ) {
    return responder(400, { error: 'Revisa los datos del reporte e inténtalo de nuevo.' })
  }

  // Campo trampa: un bot lo llena. Se responde igual que a una persona, sin guardar nada.
  if (typeof cuerpo.trampa === 'string' && cuerpo.trampa.trim()) {
    return responder(200, { folio: folioFalso() })
  }

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  })

  // --- Límite de envíos por IP (se cuenta después de validar, para no gastar intentos en errores) ---
  const { error: errorLimite } = await admin.rpc('limitar', {
    p_accion: 'reporte',
    p_max: LIMITE_ENVIOS,
    p_ventana: '24 hours',
    p_ip: ipDelCliente(req),
  })
  if (errorLimite) {
    if (errorLimite.message.includes('limite_excedido')) {
      return responder(429, {
        error: `Ya enviaste ${LIMITE_ENVIOS} reportes en las últimas 24 horas. Si es una emergencia, llama al 911.`,
      })
    }
    return fallo('limite', errorLimite)
  }

  // --- Evidencia y reporte ---
  const carpeta = crypto.randomUUID()
  const rutas: string[] = []
  for (const [i, foto] of (fotos as Uint8Array[]).entries()) {
    const ruta = `${carpeta}/${i + 1}.jpg`
    const { error } = await admin.storage
      .from('reportes-evidencia')
      .upload(ruta, foto, { contentType: 'image/jpeg' })
    if (error) {
      if (rutas.length) await admin.storage.from('reportes-evidencia').remove(rutas)
      return fallo('subida', error)
    }
    rutas.push(ruta)
  }

  const { data, error } = await admin
    .from('reportes')
    .insert({
      tipo,
      colonia,
      calle,
      referencias,
      lat,
      lng,
      descripcion,
      fecha_hechos: fecha,
      fotos_paths: rutas,
      telefono: telefono || null,
    })
    .select('folio')
    .single()
  if (error || !data) {
    if (rutas.length) await admin.storage.from('reportes-evidencia').remove(rutas)
    return fallo('guardado', error)
  }

  return responder(200, { folio: data.folio })
})
