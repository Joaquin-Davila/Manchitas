import { useCallback, useEffect, useRef, useState } from 'react'

type Resultado<T> = { clave: string; llave: string; datos: T | null; error: string }

/**
 * Carga datos asíncronos al montar y cada vez que cambia `clave`. `recargar` vuelve a pedirlos SIN
 * vaciar lo que ya se ve (así un diálogo abierto o la posición de lectura no se pierden); solo
 * `cargando` es true en la primera carga y cuando cambia la clave. El mensaje de error es el del
 * Error lanzado, ya en español.
 */
export function useCarga<T>(clave: string, cargar: () => Promise<T>) {
  const funcion = useRef(cargar)
  useEffect(() => {
    funcion.current = cargar
  })
  const [intento, setIntento] = useState(0)
  const [resultado, setResultado] = useState<Resultado<T> | null>(null)
  const llave = `${clave}#${intento}`
  // Estable entre renders: se puede usar como dependencia de un efecto (p. ej. una suscripción en tiempo real).
  const recargar = useCallback(() => setIntento((n) => n + 1), [])

  useEffect(() => {
    let vigente = true
    funcion
      .current()
      .then((datos) => {
        if (vigente) setResultado({ clave, llave, datos, error: '' })
      })
      .catch((e: unknown) => {
        if (vigente) {
          setResultado({ clave, llave, datos: null, error: e instanceof Error ? e.message : 'No pudimos cargar la información.' })
        }
      })
    return () => {
      vigente = false
    }
  }, [clave, llave])

  const cargando = resultado === null || resultado.clave !== clave
  return {
    datos: cargando ? null : resultado.datos,
    cargando,
    error: cargando ? '' : resultado.error,
    recargar,
  }
}
