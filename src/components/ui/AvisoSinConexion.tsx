import { WifiOff } from 'lucide-react'
import { useEnLinea } from '../../lib/enLinea'

// Franja fija arriba, solo mientras no hay red. El texto acompaña al ícono: no depende del color.
export default function AvisoSinConexion() {
  const enLinea = useEnLinea()
  return (
    <div role="status" className="print:hidden">
      {!enLinea && (
        <p className="sticky top-0 z-50 m-0 flex items-center justify-center gap-2 bg-cafe px-5 py-2 text-center text-[13px] font-semibold text-crema">
          <WifiOff aria-hidden="true" size={16} className="shrink-0" />
          Sin conexión. Algunas funciones no están disponibles.
        </p>
      )}
    </div>
  )
}
