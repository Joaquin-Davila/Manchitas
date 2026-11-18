import { useId } from 'react'
import type { ReactNode } from 'react'
import MensajeError from './MensajeError'

/** Clases comunes de los controles de línea (campo, área de texto y lista). */
export const claseControl =
  'min-h-12 w-full border-0 border-b-2 border-cafe-suave bg-transparent py-2 text-base text-cafe focus:border-naranja focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-naranja aria-invalid:border-error'

type PropsControl = {
  id: string
  'aria-invalid'?: true
  'aria-describedby'?: string
}

type Props = {
  label: string
  error?: string
  /** Texto de ayuda persistente, arriba del control para que el teclado no lo tape. */
  ayuda?: string
  /** Elemento al final del control (p. ej. el botón de mostrar contraseña). */
  adorno?: ReactNode
  /** Dibuja el control con los atributos de accesibilidad ya resueltos. */
  children: (control: PropsControl) => ReactNode
}

// Etiqueta visible, ayuda y error enlazados con aria-describedby: lo comparten todos los campos.
export default function CampoBase({ label, error, ayuda, adorno, children }: Props) {
  const id = useId()
  const idAyuda = `${id}-ayuda`
  const idError = `${id}-error`
  const descripcion = [ayuda && idAyuda, error && idError].filter(Boolean).join(' ')

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[13px] font-semibold text-cafe-suave">
        {label}
      </label>
      {ayuda && (
        <p id={idAyuda} className="text-[13px] text-cafe-suave">
          {ayuda}
        </p>
      )}
      <div className="relative">
        {children({
          id,
          'aria-invalid': error ? true : undefined,
          'aria-describedby': descripcion || undefined,
        })}
        {adorno && <div className="absolute inset-y-0 right-0 flex items-center">{adorno}</div>}
      </div>
      {error && <MensajeError id={idError}>{error}</MensajeError>}
    </div>
  )
}
