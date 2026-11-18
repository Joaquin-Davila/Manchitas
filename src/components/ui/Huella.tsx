type Props = {
  size?: number
  /** true = silueta rellena; false = solo contorno */
  relleno?: boolean
  'aria-hidden'?: boolean | 'true' | 'false'
}

// Huella de cuatro dedos y almohadilla. Toma el color de `currentColor`.
export default function Huella({ size = 24, relleno = false, ...resto }: Props) {
  const forma = relleno
    ? { fill: 'currentColor', stroke: 'none' }
    : { fill: 'none', stroke: 'currentColor', strokeWidth: 3.5, strokeLinejoin: 'round' as const }

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" {...forma} {...resto}>
      <ellipse cx="12" cy="31" rx="5.5" ry="8" transform="rotate(-20 12 31)" />
      <ellipse cx="25" cy="16" rx="6" ry="8.5" transform="rotate(-8 25 16)" />
      <ellipse cx="39" cy="16" rx="6" ry="8.5" transform="rotate(8 39 16)" />
      <ellipse cx="52" cy="31" rx="5.5" ry="8" transform="rotate(20 52 31)" />
      <path d="M32 31c-9 0-17 9-17 17 0 6 5 8.5 10 7.500 4-.8 5-1.800 7-1.800s3 1 7 1.800c5 1 10-1.500 10-7.500 0-8-8-17-17-17z" />
    </svg>
  )
}
