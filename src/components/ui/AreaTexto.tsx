import type { ComponentPropsWithoutRef } from 'react'
import CampoBase, { claseControl } from './CampoBase'

type Props = Omit<ComponentPropsWithoutRef<'textarea'>, 'id'> & {
  label: string
  error?: string
  ayuda?: string
}

export default function AreaTexto({ label, error, ayuda, className = '', ...area }: Props) {
  return (
    <CampoBase label={label} error={error} ayuda={ayuda}>
      {(control) => (
        <textarea
          rows={3}
          {...control}
          className={`${claseControl} resize-y border-b-2 leading-snug ${className}`}
          {...area}
        />
      )}
    </CampoBase>
  )
}
