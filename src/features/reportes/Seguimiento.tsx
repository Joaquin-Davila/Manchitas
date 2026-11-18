import { useState } from 'react'
import type { FormEvent } from 'react'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import CampoTexto from '../../components/ui/CampoTexto'
import EncabezadoCurvo from '../../components/ui/EncabezadoCurvo'
import MensajeError from '../../components/ui/MensajeError'
import Tarjeta from '../../components/ui/Tarjeta'
import { hoyISO } from '../../lib/edad'
import { formatearFecha } from '../../lib/fechas'
import { normalizarFolioReporte, seguimientoPorFolio } from '../../lib/reportes'
import { tituloTipo } from '../../types/reporte'
import type { SeguimientoReporte } from '../../types/reporte'
import { useCampos } from '../auth/useCampos'
import type { Reglas } from '../auth/useCampos'
import { useRutaAtras } from './useRutaAtras'

type Valores = { folio: string }

const reglas: Reglas<Valores> = {
  folio: (v) =>
    normalizarFolioReporte(v) ? null : 'Escribe el folio completo, por ejemplo REP-4M8Q2X.',
}

const ESTADOS = {
  recibido: 'Recibido. Está pendiente de canalizarse a la autoridad.',
  canalizado: 'Canalizado a la autoridad competente.',
} as const

// Consulta sin cuenta: solo con el folio exacto, y solo devuelve estado, tipo y fecha.
export default function Seguimiento() {
  const atras = useRutaAtras()
  const { campo, valores, validar } = useCampos<Valores>({ folio: '' }, reglas)
  const [buscando, setBuscando] = useState(false)
  const [noEncontrado, setNoEncontrado] = useState(false)
  const [errorRed, setErrorRed] = useState('')
  const [resultado, setResultado] = useState<SeguimientoReporte>()

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setNoEncontrado(false)
    setResultado(undefined)
    const primero = validar(['folio'])
    if (primero) {
      ;(e.currentTarget.elements.namedItem(primero) as HTMLElement | null)?.focus()
      return
    }
    setBuscando(true)
    setErrorRed('')
    try {
      const encontrado = await seguimientoPorFolio(valores.folio)
      if (encontrado) setResultado(encontrado)
      else setNoEncontrado(true)
    } catch (error) {
      setErrorRed(error instanceof Error ? error.message : 'No pudimos consultar el folio.')
    } finally {
      setBuscando(false)
    }
  }

  return (
    <>
      <EncabezadoCurvo titulo="Seguimiento" atras={atras} />
      <main className="flex flex-col gap-6 px-5 pb-10 pt-8">
        <form noValidate onSubmit={enviar} aria-label="Consultar seguimiento" className="flex flex-col gap-6">
          <p className="text-sm text-cafe-suave">
            Escribe el folio que recibiste al enviar tu reporte.
          </p>
          <CampoTexto
            label="Folio de seguimiento"
            ayuda="Empieza con REP-. No distingue mayúsculas."
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            enterKeyHint="search"
            required
            {...campo('folio')}
          />
          {noEncontrado && (
            <MensajeError id="error-seguimiento">
              No encontramos ese folio. Revisa que esté completo y vuelve a intentarlo.
            </MensajeError>
          )}
          {errorRed && <MensajeError id="error-seguimiento-red">{errorRed}</MensajeError>}
          <BotonPrincipal type="submit" disabled={buscando}>
            {buscando ? 'Buscando…' : 'Consultar'}
          </BotonPrincipal>
        </form>

        <div role="status" className="empty:hidden">
          {resultado && (
            <Tarjeta className="flex flex-col gap-2 p-4">
              <p className="font-titulo text-lg font-bold">{resultado.folio}</p>
              <dl className="m-0 flex flex-col gap-2 text-sm">
                <div>
                  <dt className="text-[13px] font-semibold text-cafe-suave">Tipo</dt>
                  <dd className="m-0">{tituloTipo(resultado.tipo)}</dd>
                </div>
                <div>
                  <dt className="text-[13px] font-semibold text-cafe-suave">Enviado el</dt>
                  <dd className="m-0">{formatearFecha(hoyISO(new Date(resultado.creadoEn)))}</dd>
                </div>
                <div>
                  <dt className="text-[13px] font-semibold text-cafe-suave">Estado</dt>
                  <dd className="m-0">{ESTADOS[resultado.estado]}</dd>
                </div>
              </dl>
            </Tarjeta>
          )}
        </div>
      </main>
    </>
  )
}
