import type { ComponentPropsWithoutRef } from 'react'
import { Link } from 'react-router-dom'
import type { LinkProps } from 'react-router-dom'

const clases =
  'flex h-[50px] w-full items-center justify-center rounded-boton bg-naranja px-6 text-[15px] font-semibold text-white shadow-boton transition-transform active:translate-y-[3px] active:shadow-[0_1px_0_#2c5582] disabled:opacity-60 disabled:active:translate-y-0 disabled:active:shadow-boton'

// Se muestra como enlace si recibe `to`; si no, como botón.
type PropsEnlace = LinkProps & { to: LinkProps['to'] }
type PropsBoton = ComponentPropsWithoutRef<'button'> & { to?: undefined }

export default function BotonPrincipal(props: PropsEnlace | PropsBoton) {
  if (props.to !== undefined) {
    const { className = '', ...resto } = props as PropsEnlace
    return <Link className={`${clases} ${className}`} {...resto} />
  }
  const { className = '', type = 'button', ...resto } = props as PropsBoton
  return <button type={type} className={`${clases} ${className}`} {...resto} />
}
