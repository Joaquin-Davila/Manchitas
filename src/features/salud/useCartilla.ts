import { useCallback, useEffect, useState } from 'react'
import {
  definirRecordatorio,
  eliminarVacuna,
  guardarFotoCartilla,
  obtenerCartilla,
  registrarVacuna,
} from '../../lib/cartillas'
import type { Cartilla, DatosVacuna } from '../../types/cartilla'

/** Cartilla de una mascota. Las acciones devuelven una promesa que falla con un mensaje en español. */
export function useCartilla(mascotaId: string | undefined) {
  const [estado, setEstado] = useState<{ id: string; cartilla: Cartilla } | null>(null)

  useEffect(() => {
    if (!mascotaId) return
    let vigente = true
    obtenerCartilla(mascotaId).then((cartilla) => {
      if (vigente) setEstado({ id: mascotaId, cartilla })
    })
    return () => {
      vigente = false
    }
  }, [mascotaId])

  const aplicar = useCallback(
    async (accion: Promise<Cartilla>) => {
      const cartilla = await accion
      if (mascotaId) setEstado({ id: mascotaId, cartilla })
    },
    [mascotaId],
  )

  const cargando = mascotaId !== undefined && estado?.id !== mascotaId
  return {
    cartilla: estado && estado.id === mascotaId ? estado.cartilla : undefined,
    cargando,
    registrarVacuna: (datos: DatosVacuna) => aplicar(registrarVacuna(mascotaId!, datos)),
    eliminarVacuna: (id: string) => aplicar(eliminarVacuna(mascotaId!, id)),
    guardarFoto: (foto: string | undefined) => aplicar(guardarFotoCartilla(mascotaId!, foto)),
    definirRecordatorio: (activo: boolean) => aplicar(definirRecordatorio(mascotaId!, activo)),
  }
}
