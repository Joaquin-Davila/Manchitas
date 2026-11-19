import { Archive, HandHeart, Search as LupaIcono, Stethoscope, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ComponentType } from 'react'
import { Link } from 'react-router-dom'
import { haceCuanto } from '../../lib/fechas'
import { NOMBRE_TIPO_CHAT } from '../../lib/chat'
import type { Conversacion, TipoChat } from '../../lib/chat'
import { Buscador, Chip, FilaChips } from '../comunidad/piezas'
import { clasesFoco } from '../mascotas/inicio/comun'
import { urlFotoExtraviado } from '../../lib/extraviados'

type Icono = ComponentType<{ size?: number; 'aria-hidden'?: boolean | 'true' | 'false' }>
const ICONO_TIPO: Record<TipoChat, Icono> = {
  comunidad: Users,
  extraviado: LupaIcono,
  adopcion: HandHeart,
  veterinaria: Stethoscope,
}

type Filtro = 'todas' | 'no_leidas' | 'archivadas'

function iniciales(nombre: string): string {
  const p = nombre.trim().split(/\s+/)
  return ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase()
}

/** Foto del contexto (mascota, lugar) o, si no hay, las iniciales de la otra persona. */
export function AvatarConversacion({ c, tamano = 'size-12' }: { c: Pick<Conversacion, 'contextoFoto' | 'otroNombre' | 'tipo'>; tamano?: string }) {
  const Icono = ICONO_TIPO[c.tipo]
  const foto = c.contextoFoto ? urlFotoExtraviado(c.contextoFoto) : undefined
  return (
    <span aria-hidden="true" className={`relative flex ${tamano} shrink-0 items-center justify-center overflow-hidden rounded-full bg-amarillo-suave font-bold text-cafe`}>
      {foto ? <img src={foto} alt="" loading="lazy" className="size-full object-cover" /> : iniciales(c.otroNombre) || <Icono size={20} />}
    </span>
  )
}

export default function ListaConversaciones({
  conversaciones,
  activaId,
  ahora,
}: {
  conversaciones: Conversacion[]
  activaId?: string
  ahora: Date
}) {
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const noLeidas = conversaciones.filter((c) => !c.archivada && c.noLeidos > 0).length

  const visibles = useMemo(() => {
    const q = busqueda.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
    return conversaciones.filter((c) => {
      const pasa = filtro === 'archivadas' ? c.archivada : !c.archivada && (filtro === 'todas' || c.noLeidos > 0)
      const texto = `${c.otroNombre} ${c.contextoTitulo} ${c.ultimoTexto}`.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
      return pasa && (!q || texto.includes(q))
    })
  }, [conversaciones, busqueda, filtro])

  return (
    <div className="flex flex-col gap-3">
      <Buscador id="buscar-chat" etiqueta="Buscar en tus conversaciones" valor={busqueda} onCambiar={setBusqueda} placeholder="Busca por nombre o tema" />
      <FilaChips etiqueta="Filtrar conversaciones">
        <Chip activo={filtro === 'todas'} onClick={() => setFiltro('todas')}>Todas</Chip>
        <Chip activo={filtro === 'no_leidas'} onClick={() => setFiltro('no_leidas')}>No leídas{noLeidas > 0 ? ` (${noLeidas})` : ''}</Chip>
        <Chip activo={filtro === 'archivadas'} onClick={() => setFiltro('archivadas')} icono={<Archive aria-hidden="true" size={14} />}>Archivadas</Chip>
      </FilaChips>

      {visibles.length === 0 ? (
        <p role="status" className="rounded-2xl bg-crema p-4 text-sm text-cafe-suave">
          {conversaciones.length === 0
            ? 'Todavía no tienes conversaciones. Escribe desde la ficha de una veterinaria, una adopción o una mascota extraviada.'
            : 'No hay conversaciones con esos filtros.'}
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          {visibles.map((c) => {
            const Icono = ICONO_TIPO[c.tipo]
            const activa = c.id === activaId
            return (
              <li key={c.id}>
                <Link
                  to={`/mensajes/${c.id}`}
                  aria-current={activa ? 'page' : undefined}
                  className={`flex items-center gap-3 rounded-2xl p-2.5 transition-colors ${activa ? 'bg-amarillo-suave' : 'hover:bg-crema-clara'} ${clasesFoco}`}
                >
                  <AvatarConversacion c={c} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className={`truncate ${c.noLeidos > 0 ? 'font-bold' : 'font-semibold'} text-cafe`}>{c.otroNombre}</span>
                      <span className="shrink-0 text-xs text-cafe-suave">{haceCuanto(c.ultimoEn, ahora)}</span>
                    </span>
                    <span className="flex items-center gap-1 text-xs text-cafe-suave">
                      <Icono aria-hidden size={12} />
                      <span className="truncate">
                        {NOMBRE_TIPO_CHAT[c.tipo]}
                        {c.contextoTitulo ? ` · ${c.contextoTitulo}` : ''}
                      </span>
                      {c.demo && <span className="shrink-0 rounded-full bg-crema px-1.5 text-[10px] font-semibold">Ejemplo</span>}
                    </span>
                    <span className="flex items-center justify-between gap-2">
                      <span className={`truncate text-sm ${c.noLeidos > 0 ? 'font-semibold text-cafe' : 'text-cafe-suave'}`}>{c.ultimoTexto || 'Sin mensajes todavía'}</span>
                      {c.noLeidos > 0 && (
                        <span className="flex min-w-6 shrink-0 items-center justify-center rounded-full bg-naranja px-1.5 text-xs font-bold text-white">
                          {c.noLeidos}
                          <span className="sr-only"> mensajes sin leer</span>
                        </span>
                      )}
                    </span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

