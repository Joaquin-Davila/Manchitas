import { useEffect, useState } from 'react'
import { cargarInicioComunidad } from '../../../lib/comunidad'
import type { DatosInicio } from '../../../lib/comunidad'

type Estado = { datos: DatosInicio | null; cargando: boolean; error: boolean }

/** Lo que alimenta las secciones comunitarias del Inicio (anuncios, campañas, actividad, indicadores). */
export function useInicioComunidad(hoy: string): Estado {
  const [estado, setEstado] = useState<Estado>({ datos: null, cargando: true, error: false })

  useEffect(() => {
    let vigente = true
    cargarInicioComunidad(hoy)
      .then((datos) => {
        if (vigente) setEstado({ datos, cargando: false, error: false })
      })
      .catch(() => {
        if (vigente) setEstado({ datos: null, cargando: false, error: true })
      })
    return () => {
      vigente = false
    }
  }, [hoy])

  return estado
}
