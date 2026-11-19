import { FlaskConical, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import BotonSecundario from '../../components/ui/BotonSecundario'
import MensajeError from '../../components/ui/MensajeError'
import { pesos, registrarAportacion } from '../../lib/solidario'

const MONTOS = [50, 100, 200, 500, 1000]

/**
 * Aportar en MODO DEMOSTRACIÓN. No hay pasarela de pago: no se cobra nada y la aportación queda
 * "pendiente" y simulada, sin sumar al dinero recaudado. Cuando exista una pasarela, este diálogo
 * solo cambia el paso final (redirigir al pago) y el servidor confirmará la aportación.
 */
export default function DialogoAportar({
  colectaId,
  titulo,
  onCerrar,
  onListo,
}: {
  colectaId: string
  titulo: string
  onCerrar: () => void
  onListo: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const [monto, setMonto] = useState<number>(200)
  const [otro, setOtro] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [anonima, setAnonima] = useState(false)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [hecho, setHecho] = useState(false)

  useEffect(() => {
    const d = ref.current
    if (d && !d.open) d.showModal()
  }, [])

  const montoFinal = otro.trim() ? Number(otro) : monto

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (!Number.isInteger(montoFinal) || montoFinal < 10 || montoFinal > 100000) {
      setError('Elige un monto entero entre $10 y $100,000.')
      return
    }
    setError('')
    setEnviando(true)
    try {
      await registrarAportacion(colectaId, montoFinal, mensaje, anonima)
      setHecho(true)
      onListo()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos registrar tu aportación.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby="titulo-aportar"
      onClose={onCerrar}
      className="m-auto w-[min(440px,calc(100%-32px))] overscroll-contain rounded-[28px] bg-crema p-5 text-cafe shadow-tarjeta backdrop:overflow-hidden backdrop:bg-cafe/50"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 id="titulo-aportar" className="font-titulo text-xl font-bold">
          Aportar a esta campaña
        </h2>
        <button type="button" aria-label="Cerrar" onClick={() => ref.current?.close()} className="-mr-2 -mt-1 flex size-11 shrink-0 items-center justify-center rounded-full">
          <X aria-hidden="true" size={22} />
        </button>
      </div>
      <p className="mt-0.5 text-sm text-cafe-suave">{titulo}</p>

      <p role="note" className="mt-4 flex gap-2.5 rounded-2xl bg-amarillo-suave p-3 text-[13px] leading-snug">
        <FlaskConical aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-naranja-sombra" />
        <span>
          <strong>Modo de demostración.</strong> Todavía no se procesan pagos: no se cobra nada y tu aportación
          no suma al dinero recaudado.
        </span>
      </p>

      {hecho ? (
        <div role="status" className="mt-5 flex flex-col gap-3">
          <p className="text-sm">
            Registramos tu aportación de demostración de <strong>{pesos(montoFinal)}</strong> como <strong>pendiente</strong>. La
            puedes ver en la lista de aportaciones. No hubo ningún cargo.
          </p>
          <BotonPrincipal onClick={() => ref.current?.close()}>Listo</BotonPrincipal>
        </div>
      ) : (
        <form noValidate onSubmit={enviar} className="mt-4 flex flex-col gap-4">
          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend className="mb-2 text-sm font-semibold">Monto</legend>
            <div className="flex flex-wrap gap-2">
              {MONTOS.map((m) => (
                <label
                  key={m}
                  className={`flex min-h-11 cursor-pointer items-center rounded-full border-2 px-4 text-sm font-semibold has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-naranja-sombra ${
                    !otro.trim() && monto === m ? 'border-naranja bg-naranja text-white' : 'border-borde-calido bg-white text-cafe'
                  }`}
                >
                  <input type="radio" name="monto" value={m} checked={!otro.trim() && monto === m} onChange={() => { setMonto(m); setOtro('') }} className="sr-only" />
                  {pesos(m)}
                </label>
              ))}
            </div>
            <label htmlFor="otro-monto" className="mt-3 block text-sm font-semibold">Otro monto (MXN)</label>
            <input
              id="otro-monto"
              inputMode="numeric"
              value={otro}
              onChange={(e) => setOtro(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Por ejemplo, 350"
              className="mt-1 h-12 w-full rounded-2xl border border-borde-calido bg-white px-4 text-[15px] outline-none focus-visible:border-naranja focus-visible:ring-2 focus-visible:ring-naranja/25"
            />
          </fieldset>

          <div>
            <label htmlFor="mensaje-aporte" className="text-sm font-semibold">Mensaje (opcional)</label>
            <textarea
              id="mensaje-aporte"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              maxLength={300}
              rows={2}
              className="mt-1 w-full rounded-2xl border border-borde-calido bg-white p-3 text-[15px] outline-none focus-visible:border-naranja focus-visible:ring-2 focus-visible:ring-naranja/25"
            />
          </div>

          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input type="checkbox" checked={anonima} onChange={(e) => setAnonima(e.target.checked)} className="size-5 accent-naranja" />
            Aportar de forma anónima
          </label>

          {error && <MensajeError id="error-aporte">{error}</MensajeError>}
          <BotonPrincipal type="submit" disabled={enviando}>
            {enviando ? 'Registrando…' : `Registrar aportación de ${Number.isFinite(montoFinal) && montoFinal > 0 ? pesos(montoFinal) : 'demostración'}`}
          </BotonPrincipal>
          <BotonSecundario onClick={() => ref.current?.close()}>Cancelar</BotonSecundario>
        </form>
      )}
    </dialog>
  )
}
