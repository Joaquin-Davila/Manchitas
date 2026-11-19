import { Search, X } from 'lucide-react'
import { useState } from 'react'
import type { ReactNode } from 'react'
import Huella from '../../components/ui/Huella'
import type { EstadoCampana, TipoAliado, TipoCampana } from '../../lib/campanasEjemplo'
import { visualDe } from './visualComunidad'

// Piezas visuales compartidas por las pestañas de Comunidad.

export const clasesFocoComunidad =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naranja-sombra'

/** Buscador destacado con ícono y botón para borrar. La etiqueta existe para lectores de pantalla. */
export function Buscador({
  id,
  etiqueta,
  valor,
  onCambiar,
  placeholder,
}: {
  id: string
  etiqueta: string
  valor: string
  onCambiar: (v: string) => void
  placeholder: string
}) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {etiqueta}
      </label>
      <Search aria-hidden="true" size={20} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-cafe-suave" />
      <input
        id={id}
        type="search"
        value={valor}
        onChange={(e) => onCambiar(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="h-14 w-full rounded-full border border-borde-calido bg-white pl-13 pr-14 text-[15px] text-cafe shadow-suave outline-none transition-shadow placeholder:text-cafe-suave focus-visible:border-naranja focus-visible:ring-2 focus-visible:ring-naranja/25 [&::-webkit-search-cancel-button]:hidden"
      />
      {valor && (
        <button
          type="button"
          onClick={() => onCambiar('')}
          aria-label="Borrar búsqueda"
          className={`absolute right-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-cafe-suave hover:bg-crema ${clasesFocoComunidad}`}
        >
          <X aria-hidden="true" size={18} />
        </button>
      )}
    </div>
  )
}

/** Chip de filtro con estado presionado. */
export function Chip({
  activo,
  onClick,
  icono,
  children,
}: {
  activo: boolean
  onClick: () => void
  icono?: ReactNode
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      className={`flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-[13px] font-semibold transition-colors ${clasesFocoComunidad} ${
        activo ? 'bg-naranja text-white shadow-boton' : 'border border-borde-calido bg-aviso-fondo text-cafe hover:bg-white'
      }`}
    >
      {icono}
      {children}
    </button>
  )
}

/** Fila de chips: en móvil se desplaza a lo ancho dentro de su caja (la página nunca). */
export function FilaChips({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={etiqueta} className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1.5 pt-0.5 [scrollbar-width:thin] md:flex-wrap md:overflow-visible">
      {children}
    </div>
  )
}

export function BotonLimpiar({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-11 shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-3 text-[13px] font-semibold text-naranja-sombra underline-offset-2 hover:underline ${clasesFocoComunidad}`}
    >
      <X aria-hidden="true" size={16} />
      Limpiar filtros
    </button>
  )
}

const ESTILO_ESTADO: Record<EstadoCampana, string> = {
  Próxima: 'bg-celeste text-naranja-sombra',
  Hoy: 'bg-amarillo-suave text-cafe',
  'En curso': 'bg-menta-suave text-salud-trazo',
  Finalizada: 'bg-crema text-cafe-suave',
}

export function EtiquetaEstado({ estado }: { estado: EstadoCampana }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${ESTILO_ESTADO[estado]}`}>
      {estado === 'En curso' && <span aria-hidden="true" className="size-1.5 animate-pulse rounded-full bg-salud-trazo" />}
      {estado}
    </span>
  )
}

export function EtiquetaTipo({ tipo }: { tipo: TipoCampana | TipoAliado }) {
  const { fondo, texto, icono: Icono } = visualDe(tipo)
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${fondo} ${texto}`}>
      <Icono aria-hidden="true" size={13} />
      {tipo}
    </span>
  )
}

/**
 * Imagen representativa: ilustración con el ícono del tipo y huellitas. No hay fotos propias de las
 * campañas ni de los lugares, y una foto de banco se confundiría con la oficial; por eso se rotula.
 */
export function ImagenRepresentativa({
  tipo,
  className = '',
  rotulo = true,
}: {
  tipo: TipoCampana | TipoAliado
  className?: string
  rotulo?: boolean
}) {
  const { fondo, texto, icono: Icono } = visualDe(tipo)
  return (
    <div aria-hidden="true" className={`relative flex items-center justify-center overflow-hidden ${fondo} ${className}`}>
      <span className="absolute -left-2 top-2 rotate-[-18deg] text-white/70">
        <Huella size={34} relleno />
      </span>
      <span className="absolute -bottom-3 right-3 rotate-[16deg] text-white/70">
        <Huella size={44} relleno />
      </span>
      <span className={`relative flex size-14 items-center justify-center rounded-2xl bg-white/80 shadow-suave ${texto}`}>
        <Icono size={28} />
      </span>
      {rotulo && (
        <span className="absolute bottom-2 left-2 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-semibold text-cafe-suave">
          Imagen representativa
        </span>
      )}
    </div>
  )
}

/**
 * Foto de un aliado con las huellitas de las esquinas. Si no hay foto o no carga (sin conexión, archivo
 * roto), se muestra la ilustración de su tipo. La foto es de banco: el establecimiento es de ejemplo.
 */
export function FotoAliado({
  tipo,
  foto,
  alt,
  className = '',
}: {
  tipo: TipoAliado
  foto?: string
  alt?: string
  className?: string
}) {
  const [fallo, setFallo] = useState(false)
  if (!foto || fallo) return <ImagenRepresentativa tipo={tipo} className={className} rotulo={false} />
  return (
    <div className={`relative overflow-hidden bg-foto-vacia ${className}`}>
      <img
        src={foto}
        alt={alt ?? ''}
        loading="lazy"
        decoding="async"
        width={960}
        height={540}
        onError={() => setFallo(true)}
        className="size-full object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.04]"
      />
      <span aria-hidden="true" className="absolute -left-2 top-2 rotate-[-18deg] text-white/70 drop-shadow-sm">
        <Huella size={34} relleno />
      </span>
      <span aria-hidden="true" className="absolute -bottom-3 right-3 rotate-[16deg] text-white/70 drop-shadow-sm">
        <Huella size={44} relleno />
      </span>
      <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-cafe">
        Foto de ejemplo
      </span>
    </div>
  )
}

/** Encabezado de sección dentro de Comunidad. */
export function TituloBloque({ id, titulo, subtitulo, derecha }: { id: string; titulo: ReactNode; subtitulo?: string; derecha?: ReactNode }) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
      <div>
        <h2 id={id} className="font-titulo text-xl font-bold text-cafe md:text-[22px]">
          {titulo}
        </h2>
        {subtitulo && <p className="mt-0.5 max-w-2xl text-sm text-cafe-suave md:text-[15px]">{subtitulo}</p>}
      </div>
      {derecha}
    </div>
  )
}
