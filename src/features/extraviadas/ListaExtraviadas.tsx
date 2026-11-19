import { CalendarDays, Megaphone, MessagesSquare, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { hoyISO } from '../../lib/edad'
import { listarExtraviados } from '../../lib/extraviados'
import type { Especie } from '../../lib/extraviados'
import { useCarga } from '../../lib/useCarga'
import { useSesion } from '../auth/contextoSesion'
import { Chip, FilaChips } from '../comunidad/piezas'
import { clasesFoco, clasesTarjeta } from '../mascotas/inicio/comun'
import TarjetaExtraviado from './TarjetaExtraviado'

type Filtro = 'activas' | 'localizadas' | 'todas'

const PASOS = [
  { icono: Megaphone, titulo: 'Día 0', texto: 'La persona tutora reporta a su mascota.' },
  { icono: Search, titulo: 'Días 1 a 4', texto: 'La comunidad comparte avistamientos y fotos.' },
  { icono: MessagesSquare, titulo: 'Día 5', texto: 'Si sigue sin aparecer, se abre un foro comunitario.' },
  { icono: CalendarDays, titulo: 'Localizada', texto: 'Se cierra el foro y se avisa a todas las personas.' },
]

/** Pestaña "Extraviadas": reportes de mascotas perdidas y su foro comunitario. */
export default function ListaExtraviadas() {
  const { sesion } = useSesion()
  const usuarioId = sesion?.id
  const [hoy] = useState(() => hoyISO())
  const { datos, cargando, error, recargar } = useCarga(`extraviados-${usuarioId ?? ''}`, () => listarExtraviados(usuarioId))
  const [filtro, setFiltro] = useState<Filtro>('activas')
  const [especie, setEspecie] = useState<Especie | null>(null)

  const visibles = useMemo(
    () =>
      (datos ?? []).filter(
        (e) =>
          (filtro === 'todas' || (filtro === 'activas' ? e.estado === 'activo' : e.estado !== 'activo')) &&
          (!especie || e.especie === especie),
      ),
    [datos, filtro, especie],
  )

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="titulo-extraviadas" className={`grid overflow-hidden lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] ${clasesTarjeta}`}>
        <div className="flex flex-col justify-center gap-4 bg-amarillo-suave p-6 md:p-9">
          <h2 id="titulo-extraviadas" className="font-titulo text-[28px] font-bold leading-tight text-cafe md:text-4xl">
            Entre todas y todos, a casa
          </h2>
          <p className="max-w-xl text-[15px] text-cafe-suave">
            Reporta a tu mascota extraviada o ayuda a encontrar a otras con un avistamiento. Si pasan 5 días sin
            noticias, se abre un foro para que la comunidad la busque junta.
          </p>
          <Link
            to="/comunidad/extraviadas/nueva"
            className={`inline-flex min-h-12 w-fit items-center gap-2 rounded-full bg-naranja px-6 text-[15px] font-semibold text-white shadow-boton ${clasesFoco}`}
          >
            <Plus aria-hidden="true" size={18} />
            Reportar a mi mascota
          </Link>
        </div>
        <ol className="m-0 grid list-none grid-cols-1 gap-3 p-6 sm:grid-cols-2 md:p-9">
          {PASOS.map(({ icono: Icono, titulo, texto }) => (
            <li key={titulo} className="flex items-start gap-3">
              <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-menta-suave text-salud-trazo">
                <Icono size={20} />
              </span>
              <span>
                <span className="block font-semibold text-cafe">{titulo}</span>
                <span className="block text-[13px] text-cafe-suave">{texto}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <div className="flex flex-col gap-3">
        <FilaChips etiqueta="Estado del reporte">
          <Chip activo={filtro === 'activas'} onClick={() => setFiltro('activas')}>Siguen extraviadas</Chip>
          <Chip activo={filtro === 'localizadas'} onClick={() => setFiltro('localizadas')}>Localizadas</Chip>
          <Chip activo={filtro === 'todas'} onClick={() => setFiltro('todas')}>Todas</Chip>
        </FilaChips>
        <FilaChips etiqueta="Especie">
          <Chip activo={especie === null} onClick={() => setEspecie(null)}>Perros y gatos</Chip>
          <Chip activo={especie === 'perro'} onClick={() => setEspecie(especie === 'perro' ? null : 'perro')}>Perros</Chip>
          <Chip activo={especie === 'gato'} onClick={() => setEspecie(especie === 'gato' ? null : 'gato')}>Gatos</Chip>
        </FilaChips>
      </div>

      {cargando ? (
        <p role="status" className="text-sm text-cafe-suave">Cargando reportes…</p>
      ) : error ? (
        <div role="alert" className={`flex flex-col items-start gap-3 p-5 text-sm ${clasesTarjeta}`}>
          {error}
          <button type="button" onClick={recargar} className="min-h-11 font-semibold text-naranja-sombra underline">Reintentar</button>
        </div>
      ) : visibles.length === 0 ? (
        <p role="status" className={`p-5 text-sm text-cafe-suave ${clasesTarjeta}`}>
          {filtro === 'activas' ? 'No hay mascotas extraviadas con esos filtros. ¡Qué buena noticia!' : 'No hay reportes con esos filtros.'}
        </p>
      ) : (
        <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {visibles.map((e) => (
            <TarjetaExtraviado key={e.id} e={e} hoy={hoy} />
          ))}
        </ul>
      )}
    </div>
  )
}
