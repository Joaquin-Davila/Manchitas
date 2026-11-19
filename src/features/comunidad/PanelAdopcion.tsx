import { ArrowRight, BadgeCheck, Cat, Dog, Heart, HeartHandshake, LayoutGrid, SearchX } from 'lucide-react'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { clasesBotonSecundario } from '../../components/ui/BotonSecundario'
import { SIN_FILTROS_ADOPCION, animales as animalesDeEjemplo, esCachorro, filtrarAnimales, textoEdad } from '../../lib/adopcionEjemplo'
import type { Animal, Edad, FiltrosAdopcion, Sexo, Tamano } from '../../lib/adopcionEjemplo'
import { listarAdopciones } from '../../lib/adopciones'
import { useCarga } from '../../lib/useCarga'
import { Aparecer, clasesElevar, clasesTarjeta } from '../mascotas/inicio/comun'
import FichaAdopcion from './FichaAdopcion'
import { BotonLimpiar, Buscador, Chip, FilaChips } from './piezas'

const TAMANOS: Tamano[] = ['Chico', 'Mediano', 'Grande']
const EDADES: { id: Edad; etiqueta: string }[] = [
  { id: 'cachorro', etiqueta: 'Cachorros' },
  { id: 'adulto', etiqueta: 'Adultos' },
]
const SEXOS: { id: Sexo; etiqueta: string }[] = [
  { id: 'Hembra', etiqueta: 'Hembras' },
  { id: 'Macho', etiqueta: 'Machos' },
]

function Grupo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-cafe-suave">{titulo}</p>
      <FilaChips etiqueta={`Filtrar por ${titulo.toLowerCase()}`}>{children}</FilaChips>
    </div>
  )
}

function TarjetaAnimal({ animal, indice, onAbrir }: { animal: Animal; indice: number; onAbrir: () => void }) {
  const Especie = animal.especie === 'gato' ? Cat : Dog
  return (
    <Aparecer como="li" retraso={40 + indice * 50} className="min-w-0">
      <article
        aria-labelledby={`animal-${animal.id}`}
        className={`group flex h-full flex-col overflow-hidden ${clasesTarjeta} ${clasesElevar}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-foto-vacia">
          <img
            src={animal.foto}
            alt={animal.fotoAlt}
            width={480}
            height={360}
            loading={indice > 2 ? 'lazy' : undefined}
            decoding="async"
            className="size-full object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.04]"
          />
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-cafe shadow-suave">
            <Especie aria-hidden="true" size={14} />
            {animal.especie === 'gato' ? 'Gato' : 'Perro'}
          </span>
          <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-cafe">
            Foto de ejemplo
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2.5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 id={`animal-${animal.id}`} className="font-titulo text-xl font-bold text-cafe">
              {animal.nombre}
            </h3>
            {animal.verificado && (
              <span className="inline-flex items-center gap-1 rounded-full bg-menta-suave px-2.5 py-1 text-[11px] font-semibold text-salud-trazo">
                <BadgeCheck aria-hidden="true" size={14} />
                Verificado
              </span>
            )}
          </div>
          <p className="flex flex-wrap gap-1.5 text-xs font-semibold text-cafe">
            <span className="rounded-full bg-crema px-2.5 py-1">
              {textoEdad(animal.edadMeses)}
              {esCachorro(animal) ? ' · Cachorro' : ''}
            </span>
            <span className="rounded-full bg-crema px-2.5 py-1">{animal.sexo}</span>
            <span className="rounded-full bg-crema px-2.5 py-1">{animal.tamano}</span>
          </p>
          <p className="line-clamp-2 text-sm text-cafe-suave">{animal.descripcion}</p>
          <p className="flex items-center gap-1.5 text-[13px] text-cafe-suave">
            <HeartHandshake aria-hidden="true" size={15} className="shrink-0 text-salud-trazo" />
            {animal.publicadoPor}
          </p>
          <button type="button" onClick={onAbrir} className={`${clasesBotonSecundario} mt-auto h-11! gap-1.5 text-sm!`}>
            Conocer más<span className="sr-only"> a {animal.nombre}</span>
            <ArrowRight aria-hidden="true" size={16} className="transition-transform motion-safe:group-hover:translate-x-1" />
          </button>
        </div>
      </article>
    </Aparecer>
  )
}

export default function PanelAdopcion() {
  const [busqueda, setBusqueda] = useState('')
  const [filtros, setFiltros] = useState<FiltrosAdopcion>(SIN_FILTROS_ADOPCION)
  const [abierto, setAbierto] = useState<Animal | null>(null)

  const { datos } = useCarga('adopciones', () => listarAdopciones().catch(() => animalesDeEjemplo))
  const lista = filtrarAnimales(busqueda, filtros, datos ?? animalesDeEjemplo)
  const hayFiltros = busqueda !== '' || Object.values(filtros).some((v) => v !== null)

  // Volver a tocar un filtro activo lo quita.
  function alternar<K extends keyof FiltrosAdopcion>(clave: K, valor: FiltrosAdopcion[K]) {
    setFiltros((f) => ({ ...f, [clave]: f[clave] === valor ? null : valor }))
  }

  function limpiar() {
    setBusqueda('')
    setFiltros(SIN_FILTROS_ADOPCION)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="flex items-center gap-2 font-titulo text-xl font-bold text-cafe md:text-2xl">
          Encuentra a tu próximo mejor amigo
          <Heart aria-hidden="true" size={22} className="fill-coral-medio text-naranja" />
        </h2>
        <p className="mt-1 text-[15px] text-cafe-suave">Cada mascota merece una oportunidad de encontrar un hogar.</p>
        <p className="mt-2 text-[13px] text-cafe-suave">
          Animales de rescatistas y albergues. Por ahora son ejemplos: el sello “Verificado” aún no es una validación
          real.
        </p>
      </div>

      <Buscador
        id="buscar-adopcion"
        etiqueta="Buscar para adoptar"
        valor={busqueda}
        onCambiar={setBusqueda}
        placeholder="Nombre, carácter o albergue..."
      />

      <div className={`grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 ${clasesTarjeta}`}>
        <Grupo titulo="Especie">
          <Chip activo={filtros.especie === null} onClick={() => setFiltros((f) => ({ ...f, especie: null }))} icono={<LayoutGrid aria-hidden="true" size={15} />}>
            Todos
          </Chip>
          <Chip activo={filtros.especie === 'perro'} onClick={() => alternar('especie', 'perro')} icono={<Dog aria-hidden="true" size={15} />}>
            Perros
          </Chip>
          <Chip activo={filtros.especie === 'gato'} onClick={() => alternar('especie', 'gato')} icono={<Cat aria-hidden="true" size={15} />}>
            Gatos
          </Chip>
        </Grupo>
        <Grupo titulo="Edad">
          {EDADES.map((e) => (
            <Chip key={e.id} activo={filtros.edad === e.id} onClick={() => alternar('edad', e.id)}>
              {e.etiqueta}
            </Chip>
          ))}
        </Grupo>
        <Grupo titulo="Tamaño">
          {TAMANOS.map((t) => (
            <Chip key={t} activo={filtros.tamano === t} onClick={() => alternar('tamano', t)}>
              {t}
            </Chip>
          ))}
        </Grupo>
        <Grupo titulo="Sexo">
          {SEXOS.map((s) => (
            <Chip key={s.id} activo={filtros.sexo === s.id} onClick={() => alternar('sexo', s.id)}>
              {s.etiqueta}
            </Chip>
          ))}
        </Grupo>
      </div>

      <div className="-mt-2 flex flex-wrap items-center justify-between gap-2">
        <p role="status" className="text-[13px] text-cafe-suave">
          {lista.length === 1 ? '1 animal busca hogar' : `${lista.length} animales buscan hogar`}
        </p>
        {hayFiltros && <BotonLimpiar onClick={limpiar} />}
      </div>

      {lista.length === 0 ? (
        <div className={`flex flex-col items-center gap-2 p-8 text-center ${clasesTarjeta}`}>
          <span className="flex size-12 items-center justify-center rounded-full bg-aviso-fondo text-naranja">
            <SearchX aria-hidden="true" size={22} />
          </span>
          <p className="font-titulo text-base font-semibold text-cafe">No hay animales con esos filtros</p>
          {hayFiltros && <BotonLimpiar onClick={limpiar} />}
        </div>
      ) : (
        <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {lista.map((a, i) => (
            <TarjetaAnimal key={a.id} animal={a} indice={i} onAbrir={() => setAbierto(a)} />
          ))}
        </ul>
      )}

      {abierto && <FichaAdopcion animal={abierto} onCerrar={() => setAbierto(null)} />}
    </div>
  )
}
