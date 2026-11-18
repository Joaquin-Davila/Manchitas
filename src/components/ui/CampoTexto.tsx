import { useId } from 'react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import MensajeError from './MensajeError'

type Props = Omit<ComponentPropsWithoutRef<'input'>, 'id'> & {
  label: string
  /** Mensaje de error; si existe, el campo se marca como inválido. */
  error?: string
  /** Texto de ayuda persistente, arriba del campo para que el teclado no lo tape. */
  ayuda?: string
  /** Elemento al final del campo (p. ej. el botón de mostrar contraseña). */
  adorno?: ReactNode
}

export default function CampoTexto({
  label,
  error,
  ayuda,
  adorno,
  className = '',
  ...input
}: Props) {
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
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={descripcion || undefined}
          className={`min-h-12 w-full border-0 border-b-2 border-cafe-suave bg-transparent py-2 text-base text-cafe focus:border-naranja focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-naranja aria-invalid:border-error ${adorno ? 'pr-12' : ''} ${className}`}
          {...input}
        />
        {adorno && <div className="absolute inset-y-0 right-0 flex items-center">{adorno}</div>}
      </div>
      {error && <MensajeError id={idError}>{error}</MensajeError>}
    </div>
  )
}
