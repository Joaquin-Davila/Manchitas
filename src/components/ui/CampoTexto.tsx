import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import CampoBase, { claseControl } from './CampoBase'

type Props = Omit<ComponentPropsWithoutRef<'input'>, 'id'> & {
  label: string
  /** Mensaje de error; si existe, el campo se marca como inválido. */
  error?: string
  ayuda?: string
  /** Elemento al final del campo (p. ej. el botón de mostrar contraseña). */
  adorno?: ReactNode
}

export default function CampoTexto({ label, error, ayuda, adorno, className = '', ...input }: Props) {
  return (
    <CampoBase label={label} error={error} ayuda={ayuda} adorno={adorno}>
      {(control) => (
        <input
          {...control}
          className={`${claseControl} ${adorno ? 'pr-12' : ''} ${className}`}
          {...input}
        />
      )}
    </CampoBase>
  )
}
