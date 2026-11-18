import type { ComponentPropsWithoutRef } from 'react'
import { Link } from 'react-router-dom'
import type { LinkProps } from 'react-router-dom'

export const clasesBotonSecundario =
  'flex h-[50px] w-full items-center justify-center rounded-boton border-2 border-barra-borde bg-white px-6 text-[15px] font-semibold text-cafe shadow-tarjeta transition-transform active:translate-y-[2px] active:shadow-none'

// Botón blanco para acciones secundarias. Como BotonPrincipal, es enlace si recibe `to`.
type PropsEnlace = LinkProps & { to: LinkProps['to'] }
type PropsBoton = ComponentPropsWithoutRef<'button'> & { to?: undefined }

export default function BotonSecundario(props: PropsEnlace | PropsBoton) {
  if (props.to !== undefined) {
    const { className = '', ...resto } = props as PropsEnlace
    return <Link className={`${clasesBotonSecundario} ${className}`} {...resto} />
  }
  const { className = '', type = 'button', ...resto } = props as PropsBoton
  return <button type={type} className={`${clasesBotonSecundario} ${className}`} {...resto} />
}
