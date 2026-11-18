import type { ComponentPropsWithoutRef } from 'react'
import CampoBase, { claseControl } from './CampoBase'

type Props = Omit<ComponentPropsWithoutRef<'select'>, 'id'> & {
  label: string
  error?: string
  ayuda?: string
}

// Lista desplegable nativa (<select>): en el celular abre el selector del sistema.
export default function CampoLista({ label, error, ayuda, className = '', children, ...lista }: Props) {
  return (
    <CampoBase label={label} error={error} ayuda={ayuda}>
      {(control) => (
        <select {...control} className={`${claseControl} ${className}`} {...lista}>
          {children}
        </select>
      )}
    </CampoBase>
  )
}
