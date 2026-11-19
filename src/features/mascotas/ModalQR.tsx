import { Download, Printer, QrCode, Share2, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { clasesBotonSecundario } from '../../components/ui/BotonSecundario'
import Huella from '../../components/ui/Huella'
import { generarQR, urlPerfilPublico } from '../../lib/qr'
import type { Mascota } from '../../types/mascota'

type Props = {
  mascota: Mascota
  className?: string
}

/** Convierte el PNG del QR (data URL) en un archivo para compartirlo. */
async function archivoQR(dataUrl: string, folio: string): Promise<File> {
  const blob = await (await fetch(dataUrl)).blob()
  return new File([blob], `QR-${folio}.png`, { type: 'image/png' })
}

/**
 * Botón "Ver QR" y su modal. El QR es el mismo de la ficha: codifica la URL pública con el token
 * de la mascota (no el folio ni datos del tutor). Se genera solo al abrir el modal.
 */
export default function ModalQR({ mascota, className = '' }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null)
  const [qr, setQr] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string>()
  const [puedeCompartir, setPuedeCompartir] = useState(false)

  async function abrir() {
    setAviso(undefined)
    dialogo.current?.showModal()
    if (qr) return
    try {
      const imagen = await generarQR(urlPerfilPublico(mascota.token))
      setQr(imagen)
      const archivo = await archivoQR(imagen, mascota.folio)
      setPuedeCompartir(!!navigator.canShare?.({ files: [archivo] }))
    } catch {
      setAviso('No pudimos generar el QR. Inténtalo de nuevo.')
    }
  }

  async function compartir() {
    if (!qr) return
    try {
      await navigator.share({
        files: [await archivoQR(qr, mascota.folio)],
        title: `QR de ${mascota.nombre}`,
        text: `Identificación Manchitas de ${mascota.nombre} (${mascota.folio})`,
      })
    } catch (error) {
      // Cancelar el menú de compartir no es un error.
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        setAviso('No se pudo compartir. Prueba con "Descargar QR".')
      }
    }
  }

  const titulo = `titulo-qr-${mascota.id}`

  return (
    <>
      <button type="button" aria-haspopup="dialog" onClick={abrir} className={className}>
        <QrCode aria-hidden="true" size={18} />
        Ver QR
      </button>

      <dialog
        ref={dialogo}
        aria-labelledby={titulo}
        className="m-auto w-[min(400px,calc(100%-32px))] overscroll-contain rounded-[28px] bg-white p-0 text-cafe shadow-elevada backdrop:bg-cafe/55"
      >
        <div className="relative flex items-center gap-3 bg-amarillo px-5 pb-12 pt-5">
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => dialogo.current?.close()}
            className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-full bg-white/70 text-cafe hover:bg-white"
          >
            <X aria-hidden="true" size={22} />
          </button>
          <div className="size-16 shrink-0 overflow-hidden rounded-2xl border-[3px] border-white bg-foto-vacia shadow-suave">
            {mascota.fotoUrl ? (
              <img src={mascota.fotoUrl} alt={`Foto de ${mascota.nombre}`} className="size-full object-cover" />
            ) : (
              <span className="flex size-full items-center justify-center text-huella">
                <Huella aria-hidden="true" size={28} relleno />
              </span>
            )}
          </div>
          <div className="min-w-0 pr-12">
            <p className="text-xs font-semibold text-cafe-suave">Identificación Manchitas</p>
            <h2 id={titulo} className="truncate font-titulo text-2xl font-bold leading-tight">
              {mascota.nombre}
            </h2>
            <p className="font-titulo text-base font-semibold tracking-wide text-cafe-suave">{mascota.folio}</p>
          </div>
        </div>

        {/* relative: sin él, el encabezado (posicionado) se pintaría encima del QR. */}
        <div className="relative -mt-8 flex flex-col items-center gap-4 px-5 pb-5">
          <div>
            <div className="rounded-3xl border border-borde-calido bg-white p-3 shadow-suave">
              {qr ? (
                <img src={qr} alt={`Código QR de ${mascota.nombre}`} width={200} height={200} className="size-[200px]" />
              ) : (
                <div role="status" className="flex size-[200px] items-center justify-center text-sm text-cafe-suave">
                  {aviso ? '' : 'Generando QR…'}
                </div>
              )}
            </div>
          </div>

          <p className="rounded-2xl bg-menta-suave px-4 py-3 text-center text-sm text-cafe">
            Si encuentras a esta mascota, escanea su código para contactar a su tutor.
          </p>

          {aviso && (
            <p role="alert" className="text-center text-sm text-error">
              {aviso}
            </p>
          )}

          <div className="grid w-full gap-2.5 sm:grid-cols-2">
            {qr && (
              <a href={qr} download={`QR-${mascota.folio}.png`} className={`${clasesBotonSecundario} gap-2 px-3!`}>
                <Download aria-hidden="true" size={18} />
                Descargar QR
              </a>
            )}
            {qr && puedeCompartir && (
              <button type="button" onClick={compartir} className={`${clasesBotonSecundario} gap-2 px-3!`}>
                <Share2 aria-hidden="true" size={18} />
                Compartir
              </button>
            )}
            <Link
              to={`/mascotas/${mascota.id}#etiqueta`}
              onClick={() => dialogo.current?.close()}
              className={`${clasesBotonSecundario} gap-2 ${qr && puedeCompartir ? 'sm:col-span-2' : ''}`}
            >
              <Printer aria-hidden="true" size={18} />
              Etiqueta para el collar
            </Link>
          </div>
        </div>
      </dialog>
    </>
  )
}
