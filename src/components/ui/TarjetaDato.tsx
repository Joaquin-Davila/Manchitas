const fondos = {
  rosa: 'bg-rosa',
  durazno: 'bg-durazno',
  lima: 'bg-lima',
  celeste: 'bg-celeste',
} as const

type Props = {
  etiqueta: string
  valor: string | number
  color: keyof typeof fondos
}

export default function TarjetaDato({ etiqueta, valor, color }: Props) {
  // Los valores largos (p. ej. "Registrada") se reducen para caber en la fila de 4.
  const texto = String(valor)
  const tamano = texto.length > 5 ? 'text-xs' : 'text-xl'

  return (
    <div
      className={`flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-dato px-1 py-2.5 text-center text-cafe ${fondos[color]}`}
    >
      <span className="text-[11px] font-semibold">{etiqueta}</span>
      <span className={`font-titulo font-bold leading-tight ${tamano}`}>{texto}</span>
    </div>
  )
}
