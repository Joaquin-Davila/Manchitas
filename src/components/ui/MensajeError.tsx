import { CircleAlert } from 'lucide-react'
import type { ReactNode } from 'react'

// El ícono y el texto "Error:" evitan depender solo del color.
export default function MensajeError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="flex items-start gap-1.5 text-[13px] font-medium text-error">
      <CircleAlert aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
      <span>
        <span className="sr-only">Error: </span>
        {children}
      </span>
    </p>
  )
}
