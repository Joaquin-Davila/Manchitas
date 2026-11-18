import { useEffect, useState } from 'react'
import { listarMascotas } from '../../lib/mascotas'
import type { Mascota } from '../../types/mascota'
import { useSesion } from '../auth/contextoSesion'

/** Mascotas de la persona con sesión iniciada. */
export function useMascotas() {
  const { sesion } = useSesion()
  const correo = sesion?.correo
  const [estado, setEstado] = useState<{ mascotas: Mascota[]; cargando: boolean }>({
    mascotas: [],
    cargando: true,
  })

  useEffect(() => {
    if (!correo) return
    let vigente = true
    listarMascotas(correo).then((mascotas) => {
      if (vigente) setEstado({ mascotas, cargando: false })
    })
    return () => {
      vigente = false
    }
  }, [correo])

  return estado
}
