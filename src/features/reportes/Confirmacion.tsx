import { CircleCheck, Copy } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import BotonSecundario from '../../components/ui/BotonSecundario'
import EncabezadoCurvo from '../../components/ui/EncabezadoCurvo'
import Tarjeta from '../../components/ui/Tarjeta'

export default function Confirmacion() {
  const folio = (useLocation().state as { folio?: string } | null)?.folio
  const [copiado, setCopiado] = useState<'si' | 'no'>()

  // Sin folio (por ejemplo, al recargar la página) no hay nada que confirmar.
  if (!folio) return <Navigate to="/reportar/seguimiento" replace />

  async function copiar() {
    try {
      await navigator.clipboard.writeText(folio!)
      setCopiado('si')
    } catch {
      setCopiado('no')
    }
  }

  return (
    <>
      <EncabezadoCurvo titulo="Reporte enviado" />
      <main className="flex flex-col gap-4 px-5 pb-10 pt-6">
        <Tarjeta
          role="status"
          className="flex items-center gap-3 bg-salud-fondo p-4 text-sm font-semibold text-salud-trazo shadow-none"
        >
          <CircleCheck aria-hidden="true" size={22} className="shrink-0" />
          Recibimos tu reporte. Gracias por cuidar a los animales de Hermosillo.
        </Tarjeta>

        <Tarjeta className="flex flex-col items-center gap-2 p-5 text-center">
          <p className="text-[13px] font-semibold text-cafe-suave">Tu folio de seguimiento</p>
          <p className="font-titulo text-3xl font-bold tracking-wide">{folio}</p>
          <p className="text-[13px] text-cafe-suave">
            Guárdalo: con este folio puedes consultar el estado de tu reporte. No lo compartas con
            personas que no quieras que lo consulten.
          </p>
          <BotonSecundario className="mt-2 gap-2" onClick={copiar}>
            <Copy aria-hidden="true" size={20} />
            Copiar folio
          </BotonSecundario>
          <div role="status" className="text-sm font-semibold empty:hidden">
            {copiado === 'si' && <span className="text-salud-trazo">Folio copiado.</span>}
            {copiado === 'no' && (
              <span className="text-error">No pudimos copiarlo. Anótalo: {folio}</span>
            )}
          </div>
        </Tarjeta>

        <Tarjeta className="flex flex-col gap-2 p-4">
          <h2 className="font-titulo text-base font-semibold">¿Qué sigue?</h2>
          <p className="text-sm text-cafe-suave">
            Tu reporte se canalizará a la autoridad competente. Manchitas no sustituye a la autoridad: si
            hay una emergencia, llama al 911.
          </p>
        </Tarjeta>

        <div className="mt-2 flex flex-col gap-4">
          <BotonPrincipal to="/reportar/seguimiento">Consultar seguimiento</BotonPrincipal>
          <BotonSecundario to="/">Volver al inicio</BotonSecundario>
        </div>
      </main>
    </>
  )
}
