import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'

export type Reglas<T> = {
  [K in keyof T]: (valor: string, todos: T) => string | null
}

/**
 * Estado y validación de un formulario de campos de texto.
 * - input: solo limpia el error del campo (no regaña mientras se escribe).
 * - blur: valida el campo, pero solo si la persona ya lo editó.
 * - submit: `validar` revisa los campos pedidos y devuelve el primero con error.
 */
export function useCampos<T extends Record<string, string>>(inicial: T, reglas: Reglas<T>) {
  const [valores, setValores] = useState<T>(inicial)
  const [errores, setErrores] = useState<Partial<Record<keyof T, string>>>({})
  const editados = useRef(new Set<keyof T>())

  function cambiar(nombre: keyof T, valor: string) {
    editados.current.add(nombre)
    setValores((v) => ({ ...v, [nombre]: valor }))
    setErrores((e) => ({ ...e, [nombre]: undefined }))
  }

  function salir(nombre: keyof T) {
    if (!editados.current.has(nombre)) return
    const error = reglas[nombre](valores[nombre], valores)
    setErrores((e) => ({ ...e, [nombre]: error ?? undefined }))
  }

  function validar(campos: (keyof T)[]): keyof T | null {
    const nuevos: Partial<Record<keyof T, string>> = { ...errores }
    let primero: keyof T | null = null
    for (const campo of campos) {
      const error = reglas[campo](valores[campo], valores)
      nuevos[campo] = error ?? undefined
      if (error && primero === null) primero = campo
    }
    setErrores(nuevos)
    return primero
  }

  function campo(nombre: keyof T & string) {
    return {
      name: nombre,
      value: valores[nombre],
      error: errores[nombre],
      onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        cambiar(nombre, e.target.value),
      onBlur: () => salir(nombre),
    }
  }

  return { valores, errores, campo, cambiar, validar }
}
