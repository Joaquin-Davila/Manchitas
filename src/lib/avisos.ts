import type { Sesion } from '../features/auth/contextoSesion'
import type { Cartilla } from '../types/cartilla'
import type { Mascota } from '../types/mascota'
import type { Campana } from './campanasEjemplo'
import { formatearFecha } from './fechas'

// Centro de avisos calculado: no hay una tabla de notificaciones. Cada aviso se deriva de datos que
// el usuario ya puede leer (sus mascotas, sus cartillas, su sesión y las campañas), así que no hay
// nada que insertar ni duplicar: el id es estable y depende de los datos que lo originan. Lo leído
// y lo eliminado se guarda por usuario en este dispositivo (ver estadoAvisos).

export type CategoriaAviso = 'salud' | 'comunidad' | 'adopciones' | 'mascotas' | 'cuenta'

export type Aviso = {
  /** Estable: si el dato que lo origina cambia, es otro aviso. */
  id: string
  categoria: CategoriaAviso
  importante: boolean
  titulo: string
  descripcion: string
  /** AAAA-MM-DD: desde cuándo es relevante (ordena la lista, de lo más reciente a lo más antiguo). */
  fecha: string
  /** Ruta existente de la app; sin ella el aviso es solo informativo. */
  ruta?: string
  accion?: string
}

export const NOMBRE_CATEGORIA: Record<CategoriaAviso, string> = {
  salud: 'Salud',
  comunidad: 'Comunidad',
  adopciones: 'Adopciones',
  mascotas: 'Mascotas',
  cuenta: 'Cuenta',
}

/** Suma días a una fecha AAAA-MM-DD sin pasar por la zona horaria. */
export function sumarDias(iso: string, dias: number): string {
  const [a, m, d] = iso.split('-').map(Number)
  const f = new Date(Date.UTC(a, m - 1, d + dias))
  return f.toISOString().slice(0, 10)
}

export function diasEntre(desde: string, hasta: string): number {
  const ms = Date.parse(`${hasta}T00:00:00Z`) - Date.parse(`${desde}T00:00:00Z`)
  return Math.round(ms / 86_400_000)
}

type Datos = {
  hoy: string
  sesion: Sesion | null
  mascotas: Mascota[]
  cartillas: Record<string, Cartilla | undefined>
  campanas: Campana[]
}

export function generarAvisos({ hoy, sesion, mascotas, cartillas, campanas }: Datos): Aviso[] {
  const avisos: Aviso[] = []
  const anio = hoy.slice(0, 4)
  const fecha = (iso: string) => formatearFecha(iso, iso.slice(0, 4) !== anio)

  for (const m of mascotas) {
    const registro = m.creadaEn.slice(0, 10)
    const cartilla = cartillas[m.id]

    // Mascotas
    avisos.push({
      id: `mascota-registrada-${m.id}`,
      categoria: 'mascotas',
      importante: false,
      titulo: `${m.nombre} ya tiene su identificación`,
      descripcion: `Su folio es ${m.folio}. Imprime la etiqueta del collar para que puedan avisarte si alguien la encuentra.`,
      fecha: registro,
      ruta: `/mascotas/${m.id}#etiqueta`,
      accion: 'Ver etiqueta',
    })
    if (!m.fotoUrl) {
      avisos.push({
        id: `mascota-sin-foto-${m.id}`,
        categoria: 'mascotas',
        importante: false,
        titulo: `Agrega una foto de ${m.nombre}`,
        descripcion: 'Una foto clara ayuda a que quien la encuentre la reconozca en su ficha pública.',
        fecha: registro,
        ruta: `/mascotas/${m.id}/editar`,
        accion: 'Agregar foto',
      })
    }

    // Salud: solo con la cartilla cargada (si falló, no se inventa nada)
    if (!cartilla) continue
    const proxima = cartilla.proxima
    if (proxima) {
      const dias = diasEntre(hoy, proxima.fecha)
      if (dias < 0) {
        avisos.push({
          id: `salud-vencida-${m.id}-${proxima.nombre}-${proxima.fecha}`,
          categoria: 'salud',
          importante: true,
          titulo: `Ya pasó la fecha de ${proxima.nombre} de ${m.nombre}`,
          descripcion: `La tenías para el ${fecha(proxima.fecha)}. Consulta a tu veterinario y registra la dosis cuando se aplique.`,
          fecha: proxima.fecha,
          ruta: `/salud?mascota=${m.id}`,
          accion: 'Ver cartilla',
        })
      } else if (dias <= 30 && cartilla.recordatorio) {
        // Respeta "Recordarme en Inicio": si el tutor lo apagó, no se avisa.
        avisos.push({
          id: `salud-proxima-${m.id}-${proxima.nombre}-${proxima.fecha}`,
          categoria: 'salud',
          importante: dias <= 7,
          titulo: dias === 0 ? `Hoy toca ${proxima.nombre} de ${m.nombre}` : `Se acerca ${proxima.nombre} de ${m.nombre}`,
          descripcion:
            dias === 0
              ? 'Es la fecha que registraste en su cartilla.'
              : `Faltan ${dias === 1 ? '1 día' : `${dias} días`}: ${fecha(proxima.fecha)}.`,
          fecha: sumarDias(proxima.fecha, -30) > registro ? sumarDias(proxima.fecha, -30) : registro,
          ruta: `/salud?mascota=${m.id}`,
          accion: 'Ver cartilla',
        })
      }
    }
    if (cartilla.vacunas.length === 0 && !proxima) {
      avisos.push({
        id: `salud-cartilla-vacia-${m.id}`,
        categoria: 'salud',
        importante: false,
        titulo: `Completa la cartilla de ${m.nombre}`,
        descripcion: 'Registra sus vacunas para llevar su historial y recibir el aviso de la siguiente.',
        fecha: registro,
        ruta: `/salud?mascota=${m.id}`,
        accion: 'Ir a la cartilla',
      })
    }
  }

  // Comunidad: campañas de los próximos 14 días (son datos de ejemplo y se dice)
  for (const c of campanas) {
    const dias = diasEntre(hoy, c.fecha)
    if (dias < 0 || dias > 14) continue
    avisos.push({
      id: `comunidad-campana-${c.id}-${c.fecha}`,
      categoria: 'comunidad',
      importante: false,
      titulo: dias === 0 ? `Hoy: ${c.titulo}` : `${c.titulo} el ${fecha(c.fecha)}`,
      descripcion: `${c.horario} · ${c.lugar}. Dato de ejemplo.`,
      fecha: sumarDias(c.fecha, -14),
      ruta: '/comunidad',
      accion: 'Ver campañas',
    })
  }

  // Cuenta: sin WhatsApp, quien encuentre a la mascota no puede avisar. Aún no hay pantalla para
  // editar el teléfono, así que el aviso no lleva botón.
  if (sesion && !sesion.telefono && mascotas.length > 0) {
    avisos.push({
      id: 'cuenta-sin-whatsapp',
      categoria: 'cuenta',
      importante: true,
      titulo: 'Tu cuenta no tiene WhatsApp registrado',
      descripcion:
        'Quien escanee el QR de tus mascotas no podrá avisarte. Poder agregarlo desde la app está pendiente de integración.',
      fecha: mascotas.map((m) => m.creadaEn.slice(0, 10)).sort()[0],
    })
  }

  // Ningún aviso "del futuro": todo lo que aún no es relevante se queda fuera.
  return avisos
    .filter((a) => a.fecha <= hoy)
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || Number(b.importante) - Number(a.importante))
}
