import {
  ArrowRight,
  Bell,
  BellRing,
  Check,
  CheckCheck,
  CircleAlert,
  HeartHandshake,
  Inbox,
  LayoutGrid,
  PawPrint,
  RotateCcw,
  Stethoscope,
  Trash2,
  UserRound,
  Users,
} from 'lucide-react'
import type { ComponentType } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Huella from '../../components/ui/Huella'
import { NOMBRE_CATEGORIA, diasEntre } from '../../lib/avisos'
import type { CategoriaAviso } from '../../lib/avisos'
import { formatearFecha } from '../../lib/fechas'
import { Chip, FilaChips } from '../comunidad/piezas'
import { Aparecer, clasesTarjeta } from '../mascotas/inicio/comun'
import CentroReportes from '../reportes/CentroReportes'
import { useAvisos } from './useAvisos'
import type { AvisoConEstado } from './useAvisos'

type Icono = ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>
type Filtro = 'todos' | CategoriaAviso | 'importantes'

const VISUAL: Record<CategoriaAviso, { icono: Icono; fondo: string }> = {
  salud: { icono: Stethoscope, fondo: 'bg-menta-suave text-salud-trazo' },
  comunidad: { icono: Users, fondo: 'bg-celeste text-naranja-sombra' },
  adopciones: { icono: HeartHandshake, fondo: 'bg-coral-suave text-naranja-sombra' },
  mascotas: { icono: PawPrint, fondo: 'bg-amarillo-suave text-cafe' },
  cuenta: { icono: UserRound, fondo: 'bg-aviso-fondo text-cafe' },
}

const FILTROS: { id: Filtro; etiqueta: string; icono: Icono }[] = [
  { id: 'todos', etiqueta: 'Todos', icono: LayoutGrid },
  { id: 'salud', etiqueta: 'Salud', icono: Stethoscope },
  { id: 'comunidad', etiqueta: 'Comunidad', icono: Users },
  { id: 'adopciones', etiqueta: 'Adopciones', icono: HeartHandshake },
  { id: 'mascotas', etiqueta: 'Mascotas', icono: PawPrint },
  { id: 'cuenta', etiqueta: 'Cuenta', icono: UserRound },
  { id: 'importantes', etiqueta: 'Importantes', icono: CircleAlert },
]

const foco = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naranja-sombra'

/** "Hoy", "Ayer", "Hace 3 días" o la fecha; los avisos solo tienen día, no hora. */
function cuando(fecha: string, hoy: string): string {
  const dias = diasEntre(fecha, hoy)
  if (dias === 0) return 'Hoy'
  if (dias === 1) return 'Ayer'
  if (dias < 7) return `Hace ${dias} días`
  return formatearFecha(fecha, fecha.slice(0, 4) !== hoy.slice(0, 4))
}

function TarjetaAviso({
  aviso,
  hoy,
  indice,
  onAbrir,
  onLeido,
  onEliminar,
}: {
  aviso: AvisoConEstado
  hoy: string
  indice: number
  onAbrir: () => void
  onLeido: () => void
  onEliminar: () => void
}) {
  const [confirmando, setConfirmando] = useState(false)
  const { icono: IconoCategoria, fondo } = VISUAL[aviso.categoria]
  return (
    <Aparecer como="li" retraso={30 + indice * 40}>
      <article
        aria-labelledby={`aviso-${aviso.id}`}
        className={`relative flex gap-3.5 rounded-[20px] border p-4 transition-shadow hover:shadow-elevada ${
          aviso.importante ? 'border-naranja/40 shadow-suave' : 'border-borde-calido shadow-suave'
        } ${aviso.leido ? 'bg-crema-clara' : 'bg-white'}`}
      >
        {aviso.importante && <span aria-hidden="true" className="absolute inset-y-4 left-0 w-1 rounded-r-full bg-naranja" />}
        <span className={`relative flex size-11 shrink-0 items-center justify-center rounded-2xl ${fondo}`}>
          <IconoCategoria aria-hidden="true" size={20} />
          {!aviso.leido && (
            <span className="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-white bg-naranja">
              <span className="sr-only">Sin leer</span>
            </span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
            <span className="text-cafe-suave">{NOMBRE_CATEGORIA[aviso.categoria]}</span>
            <span aria-hidden="true" className="text-cafe-suave">·</span>
            <span className="text-cafe-suave">{cuando(aviso.fecha, hoy)}</span>
            {aviso.importante && (
              <span className="inline-flex items-center gap-1 rounded-full bg-aviso-fondo px-2 py-0.5 text-naranja-sombra">
                <CircleAlert aria-hidden="true" size={12} />
                Importante
              </span>
            )}
          </p>
          <h3 id={`aviso-${aviso.id}`} className={`mt-1 text-[15px] leading-snug text-cafe ${aviso.leido ? 'font-semibold' : 'font-bold'}`}>
            {aviso.titulo}
          </h3>
          <p className="mt-0.5 text-sm text-cafe-suave">{aviso.descripcion}</p>

          {confirmando ? (
            <div role="alert" className="mt-2 flex flex-wrap items-center gap-2 rounded-2xl bg-crema-clara p-2.5 text-sm">
              <span className="font-semibold text-cafe">¿Eliminar este aviso?</span>
              <button type="button" onClick={onEliminar} className={`min-h-11 rounded-full bg-error px-4 font-semibold text-white ${foco}`}>
                Sí, eliminar
              </button>
              <button type="button" onClick={() => setConfirmando(false)} className={`min-h-11 rounded-full px-3 font-semibold text-cafe hover:bg-white ${foco}`}>
                Cancelar
              </button>
            </div>
          ) : (
            <div className="mt-1.5 flex flex-wrap items-center gap-x-1">
              {aviso.ruta && aviso.accion && (
                <button
                  type="button"
                  onClick={onAbrir}
                  className={`flex min-h-11 items-center gap-1 rounded-full px-2 text-sm font-semibold text-naranja-sombra hover:underline ${foco}`}
                >
                  {aviso.accion}
                  <ArrowRight aria-hidden="true" size={15} />
                </button>
              )}
              {!aviso.leido && (
                <button
                  type="button"
                  onClick={onLeido}
                  className={`flex min-h-11 items-center gap-1 rounded-full px-2 text-sm font-semibold text-cafe-suave hover:bg-crema ${foco}`}
                >
                  <Check aria-hidden="true" size={15} />
                  Marcar como leído
                </button>
              )}
              <button
                type="button"
                onClick={() => setConfirmando(true)}
                aria-label={`Eliminar el aviso: ${aviso.titulo}`}
                className={`ml-auto flex size-11 items-center justify-center rounded-full text-cafe-suave hover:bg-crema hover:text-error ${foco}`}
              >
                <Trash2 aria-hidden="true" size={17} />
              </button>
            </div>
          )}
        </div>
      </article>
    </Aparecer>
  )
}

export default function CentroAvisos() {
  const { avisos, hoy, cargando, error, faltanCartillas, eliminados, marcarLeido, marcarTodos, eliminar, restaurar } = useAvisos()
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [mensaje, setMensaje] = useState<string>()
  const navigate = useNavigate()

  const sinLeer = avisos.filter((a) => !a.leido).length
  const visibles = avisos.filter((a) => (filtro === 'todos' ? true : filtro === 'importantes' ? a.importante : a.categoria === filtro))
  const importantes = visibles.filter((a) => a.importante)
  const recientes = filtro === 'importantes' ? [] : visibles.filter((a) => !a.importante)

  function abrir(a: AvisoConEstado) {
    marcarLeido(a.id)
    if (a.ruta) navigate(a.ruta)
  }

  function lista(items: AvisoConEstado[], desde = 0) {
    return (
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {items.map((a, i) => (
          <TarjetaAviso
            key={a.id}
            aviso={a}
            hoy={hoy}
            indice={desde + i}
            onAbrir={() => abrir(a)}
            onLeido={() => {
              marcarLeido(a.id)
              setMensaje('Aviso marcado como leído.')
            }}
            onEliminar={() => {
              eliminar(a.id)
              setMensaje('Eliminamos el aviso.')
            }}
          />
        ))}
      </ul>
    )
  }

  return (
    <div className="flex flex-col gap-8 md:gap-10">
      <div className="flex flex-col gap-6">
        <Aparecer className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-titulo text-[26px] font-bold leading-tight text-cafe md:text-[32px]">
              Avisos
              <span className="relative inline-flex">
                <Bell aria-hidden="true" size={28} className="text-naranja" />
                {sinLeer > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex min-w-5 items-center justify-center rounded-full bg-naranja px-1 text-[11px] font-bold leading-5 text-white">
                    {sinLeer}
                    <span className="sr-only"> sin leer</span>
                  </span>
                )}
              </span>
            </h2>
            <p className="mt-1 text-[15px] text-cafe-suave md:text-base">Lo importante para ti y tus mascotas, en un solo lugar.</p>
          </div>
          {sinLeer > 0 && (
            <button
              type="button"
              onClick={() => {
                marcarTodos()
                setMensaje('Marcamos todos los avisos como leídos.')
              }}
              className={`flex min-h-11 w-fit items-center gap-1.5 rounded-full border border-borde-calido bg-white px-4 text-sm font-semibold text-cafe shadow-suave hover:bg-crema ${foco}`}
            >
              <CheckCheck aria-hidden="true" size={17} />
              Marcar todos como leídos
            </button>
          )}
        </Aparecer>

        <div role="status" className="empty:hidden">
          {mensaje && (
            <p className="aparecer flex items-center gap-2 rounded-2xl bg-menta-suave px-4 py-3 text-sm font-semibold text-salud-trazo">
              <Check aria-hidden="true" size={17} />
              {mensaje}
            </p>
          )}
        </div>

        {cargando ? (
          <div aria-hidden="true" className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3 md:max-w-md">
              <div className="h-24 animate-pulse rounded-[20px] bg-white/70" />
              <div className="h-24 animate-pulse rounded-[20px] bg-white/70" />
            </div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-[20px] bg-white/70" />
            ))}
          </div>
        ) : error ? (
          <div className={`p-5 ${clasesTarjeta}`}>
            <p role="alert" className="text-sm">
              No pudimos cargar tus avisos. Revisa tu conexión e inténtalo de nuevo.
            </p>
          </div>
        ) : (
          <>
            <ul aria-label="Resumen de avisos" className="m-0 grid list-none grid-cols-2 gap-3 p-0 md:max-w-md">
              <li className={`flex items-center gap-3 p-4 ${clasesTarjeta}`}>
                <span className="flex size-11 items-center justify-center rounded-2xl bg-aviso-fondo text-naranja">
                  <BellRing aria-hidden="true" size={20} />
                </span>
                <span>
                  <span className="block font-titulo text-2xl font-bold leading-none text-cafe">{sinLeer}</span>
                  <span className="text-[13px] font-semibold text-cafe-suave">Sin leer</span>
                </span>
              </li>
              <li className={`flex items-center gap-3 p-4 ${clasesTarjeta}`}>
                <span className="flex size-11 items-center justify-center rounded-2xl bg-menta-suave text-salud-trazo">
                  <Inbox aria-hidden="true" size={20} />
                </span>
                <span>
                  <span className="block font-titulo text-2xl font-bold leading-none text-cafe">{avisos.length}</span>
                  <span className="text-[13px] font-semibold text-cafe-suave">Avisos en total</span>
                </span>
              </li>
            </ul>

            {avisos.length === 0 ? (
              <div className={`relative flex flex-col items-center gap-3 overflow-hidden p-10 text-center ${clasesTarjeta}`}>
                <span className="flex size-16 items-center justify-center rounded-full bg-menta-suave text-salud-trazo">
                  <Huella aria-hidden="true" size={34} relleno />
                </span>
                <p className="font-titulo text-xl font-bold text-cafe">¡Todo está tranquilo por aquí!</p>
                <p className="max-w-md text-sm text-cafe-suave">
                  Cuando haya novedades importantes sobre tus mascotas o la comunidad, las encontrarás en este espacio.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <FilaChips etiqueta="Filtrar avisos por categoría">
                    {FILTROS.map(({ id, etiqueta, icono: IconoFiltro }) => (
                      <Chip key={id} activo={filtro === id} onClick={() => setFiltro(id)} icono={<IconoFiltro aria-hidden="true" size={15} />}>
                        {etiqueta}
                      </Chip>
                    ))}
                  </FilaChips>
                  <p className="text-[13px] text-cafe-suave">
                    Se calculan con los datos de tus mascotas y de la comunidad. Lo leído y lo eliminado se guarda en este
                    dispositivo.
                  </p>
                </div>

                {visibles.length === 0 ? (
                  <div className={`flex flex-col items-center gap-2 p-8 text-center ${clasesTarjeta}`}>
                    <span className="flex size-12 items-center justify-center rounded-full bg-aviso-fondo text-naranja">
                      <Inbox aria-hidden="true" size={22} />
                    </span>
                    <p className="font-titulo text-base font-semibold text-cafe">No tienes avisos en esta categoría.</p>
                    <button
                      type="button"
                      onClick={() => setFiltro('todos')}
                      className={`min-h-11 rounded-full px-3 text-sm font-semibold text-naranja-sombra hover:underline ${foco}`}
                    >
                      Ver todos los avisos
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start lg:gap-6">
                    {importantes.length > 0 && (
                      <section aria-labelledby="titulo-importantes" className={recientes.length === 0 ? 'lg:col-span-2' : ''}>
                        <h2 id="titulo-importantes" className="mb-3 flex items-center gap-2 font-titulo text-lg font-bold text-cafe md:text-xl">
                          <CircleAlert aria-hidden="true" size={20} className="text-naranja" />
                          Importantes para ti
                        </h2>
                        {lista(importantes)}
                      </section>
                    )}
                    {recientes.length > 0 && (
                      <section aria-labelledby="titulo-recientes" className={importantes.length === 0 ? 'lg:col-span-2' : ''}>
                        <h2 id="titulo-recientes" className="mb-3 font-titulo text-lg font-bold text-cafe md:text-xl">
                          Recientes
                        </h2>
                        {lista(recientes, importantes.length)}
                      </section>
                    )}
                  </div>
                )}
              </>
            )}

            {(faltanCartillas || eliminados > 0) && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-cafe-suave">
                {faltanCartillas && <p>No pudimos cargar alguna cartilla: sus avisos de salud no aparecen por ahora.</p>}
                {eliminados > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      restaurar()
                      setMensaje('Restauramos los avisos eliminados.')
                    }}
                    className={`flex min-h-11 items-center gap-1 rounded-full px-2 font-semibold text-naranja-sombra hover:underline ${foco}`}
                  >
                    <RotateCcw aria-hidden="true" size={14} />
                    Restaurar avisos eliminados ({eliminados})
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* El centro de reportes ciudadanos sigue aquí, sin cambios. */}
      <section aria-labelledby="titulo-reportes" className="flex flex-col gap-3 md:max-w-[720px]">
        <h2 id="titulo-reportes" className="font-titulo text-lg font-bold text-cafe md:text-xl">
          Reportes ciudadanos
        </h2>
        <CentroReportes />
      </section>
    </div>
  )
}
