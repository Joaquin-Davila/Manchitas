import type { ComponentPropsWithoutRef } from 'react'

export default function Tarjeta({
  className = '',
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={`rounded-tarjeta bg-white shadow-tarjeta ${className}`}
      {...props}
    />
  )
}
