import { useCallback, useEffect, useMemo, useState } from 'react'
import { generarAvisos } from '../../lib/avisos'
import type { Aviso } from '../../lib/avisos'
import { campanasProximas } from '../../lib/campanasEjemplo'
import { obtenerCartilla } from '../../lib/cartillas'
import { hoyISO } from '../../lib/edad'
import { listarNotificaciones } from '../../lib/notificaciones'
import { useCarga } from '../../lib/useCarga'
import type { Cartilla } from '../../types/cartilla'
import { useSesion } from '../auth/contextoSesion'
import { useMascotas } from '../mascotas/useMascotas'

type Marcas = { leidos: string[]; eliminados: string[] }
const VACIAS: Marcas = { leidos: [], eliminados: [] }

// Lo leído y lo eliminado se guarda por cuenta en este dispositivo: no hay tabla de notificaciones.
const clave = (correo: string) => `manchitas.avisos.${correo.toLowerCase()}`

function leer(correo: string): Marcas {
  try {
    const texto = localStorage.getItem(clave(correo))
    const datos = texto ? (JSON.parse(texto) as Partial<Marcas>) : {}
    return { leidos: datos.leidos ?? [], eliminados: datos.eliminados ?? [] }
  } catch {
    return VACIAS
  }
}

function escribir(correo: string, marcas: Marcas) {
  try {
    localStorage.setItem(clave(correo), JSON.stringify(marcas))
  } catch {
    // Sin almacenamiento (modo privado): las marcas duran mientras la pantalla esté abierta.
  }
}

export type AvisoConEstado = Aviso & { leido: boolean }

/** Avisos del usuario con sesión: solo sus mascotas y sus cartillas (RLS en Supabase). */
export function useAvisos() {
  const { sesion } = useSesion()
  const correo = sesion?.correo ?? ''
  const { mascotas, cargando: cargandoMascotas, error: errorMascotas } = useMascotas()
  const [hoy] = useState(() => hoyISO())
  const [cartillas, setCartillas] = useState<{ ids: string; datos: Record<string, Cartilla | undefined>; fallo: boolean } | null>(null)
  const [marcas, setMarcas] = useState<{ correo: string; valor: Marcas } | null>(null)

  const ids = mascotas.map((m) => m.id).join(',')
  // Las notificaciones del servidor se suman cuando llegan; si no cargan, el resto de los avisos sigue igual.
  const notificaciones = useCarga(`notificaciones-${correo}`, () => listarNotificaciones().catch(() => []))

  useEffect(() => {
    if (cargandoMascotas || errorMascotas) return
    let vigente = true
    const lista = ids ? ids.split(',') : []
    Promise.allSettled(lista.map((id) => obtenerCartilla(id))).then((resultados) => {
      if (!vigente) return
      const datos: Record<string, Cartilla | undefined> = {}
      lista.forEach((id, i) => {
        const r = resultados[i]
        datos[id] = r.status === 'fulfilled' ? r.value : undefined
      })
      setCartillas({ ids, datos, fallo: resultados.some((r) => r.status === 'rejected') })
    })
    return () => {
      vigente = false
    }
  }, [ids, cargandoMascotas, errorMascotas])

  const marcasActuales = marcas && marcas.correo === correo ? marcas.valor : correo ? leer(correo) : VACIAS

  const guardar = useCallback(
    (cambiar: (m: Marcas) => Marcas) => {
      if (!correo) return
      const siguiente = cambiar(marcas && marcas.correo === correo ? marcas.valor : leer(correo))
      escribir(correo, siguiente)
      setMarcas({ correo, valor: siguiente })
    },
    [correo, marcas],
  )

  const listos = !!cartillas && cartillas.ids === ids
  const avisos: AvisoConEstado[] = useMemo(() => {
    if (!listos) return []
    const eliminados = new Set(marcasActuales.eliminados)
    const leidos = new Set(marcasActuales.leidos)
    return generarAvisos({ hoy, sesion, mascotas, cartillas: cartillas.datos, campanas: campanasProximas(hoy), notificaciones: notificaciones.datos ?? [] })
      .filter((a) => !eliminados.has(a.id))
      .map((a) => ({ ...a, leido: leidos.has(a.id) }))
  }, [listos, cartillas, marcasActuales, hoy, sesion, mascotas, notificaciones.datos])

  return {
    avisos,
    hoy,
    cargando: cargandoMascotas || (!errorMascotas && !listos),
    error: errorMascotas,
    /** Alguna cartilla no cargó: sus avisos de salud no aparecen. */
    faltanCartillas: listos && cartillas.fallo,
    eliminados: marcasActuales.eliminados.length,
    marcarLeido: (id: string) => guardar((m) => (m.leidos.includes(id) ? m : { ...m, leidos: [...m.leidos, id] })),
    marcarTodos: () => guardar((m) => ({ ...m, leidos: [...new Set([...m.leidos, ...avisos.map((a) => a.id)])] })),
    eliminar: (id: string) => guardar((m) => ({ ...m, eliminados: [...m.eliminados, id] })),
    restaurar: () => guardar((m) => ({ ...m, eliminados: [] })),
  }
}
