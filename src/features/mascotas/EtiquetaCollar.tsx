type Props = {
  folio: string
  /** QR como data URL; mientras se genera se muestra un recuadro vacío. */
  qr: string | null
}

// Etiqueta de 6 × 4 cm para el collar. Solo lleva el QR y el ID: nada de teléfono ni de "perdido".
export default function EtiquetaCollar({ folio, qr }: Props) {
  return (
    <div className="flex h-[4cm] w-[6cm] items-center gap-[0.2cm] rounded-[0.3cm] border border-dashed border-cafe bg-white p-[0.25cm] text-cafe">
      {qr ? (
        <img src={qr} alt="" className="size-[3.2cm] shrink-0" />
      ) : (
        <div className="size-[3.2cm] shrink-0 bg-crema" />
      )}
      <div className="flex min-w-0 flex-1 flex-col items-center gap-[0.1cm] text-center">
        <p className="font-titulo text-[9pt] font-semibold leading-tight">Escanéame</p>
        <p className="text-[6.5pt] leading-tight">o escribe mi ID</p>
        <p className="font-titulo text-[8pt] font-bold leading-tight">{folio}</p>
        <p className="text-[5.5pt] leading-tight">Manchitas</p>
      </div>
    </div>
  )
}
