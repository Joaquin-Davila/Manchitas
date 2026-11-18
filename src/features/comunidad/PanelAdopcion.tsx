import { BadgeCheck, Cat, Dog } from 'lucide-react'
import { useState } from 'react'
import CampoTexto from '../../components/ui/CampoTexto'
import Tarjeta from '../../components/ui/Tarjeta'
import { esCachorro, filtrarAnimales, textoEdad } from '../../lib/adopcionEjemplo'
import type { Animal, Especie, FiltrosAdopcion, Tamano } from '../../lib/adopcionEjemplo'
import FichaAdopcion from './FichaAdopcion'

const SIN_FILTROS: FiltrosAdopcion = { especie: null, cachorros: false, tamano: null }
const TAMANOS: Tamano[] = ['Chico', 'Mediano', 'Grande']

function Pildora({ activa, onClick, children }: { activa: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={activa}
      onClick={onClick}
      className={`min-h-11 rounded-full px-4 text-[13px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naranja ${
        activa ? 'bg-naranja text-white' : 'bg-aviso-fondo text-cafe'
      }`}
    >
      {children}
    </button>
  )
}

export default function PanelAdopcion() {
  const [busqueda, setBusqueda] = useState('')
  const [filtros, setFiltros] = useState<FiltrosAdopcion>(SIN_FILTROS)
  const [abierto, setAbierto] = useState<Animal | null>(null)

  const lista = filtrarAnimales(busqueda, filtros)
  const hayFiltros = busqueda !== '' || filtros.especie || filtros.cachorros || filtros.tamano

  function especie(e: Especie | null) {
    setFiltros((f) => ({ ...f, especie: f.especie === e ? null : e }))
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13px] text-cafe-suave">
        Animales de rescatistas y albergues. Por ahora son ejemplos: el sello “Verificado” aún no es una validación real.
      </p>

      <CampoTexto
        label="Buscar para adoptar"
        type="search"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Nombre, carácter o albergue"
        autoComplete="off"
      />

      <div role="group" aria-label="Filtrar por especie" className="flex flex-wrap gap-2">
        <Pildora activa={filtros.especie === null} onClick={() => setFiltros((f) => ({ ...f, especie: null }))}>
          Todos
        </Pildora>
        <Pildora activa={filtros.especie === 'perro'} onClick={() => especie('perro')}>
          Perros
        </Pildora>
        <Pildora activa={filtros.especie === 'gato'} onClick={() => especie('gato')}>
          Gatos
        </Pildora>
      </div>
      <div role="group" aria-label="Filtrar por edad y tamaño" className="-mt-2 flex flex-wrap gap-2">
        <Pildora activa={filtros.cachorros} onClick={() => setFiltros((f) => ({ ...f, cachorros: !f.cachorros }))}>
          Cachorros
        </Pildora>
        {TAMANOS.map((t) => (
          <Pildora
            key={t}
            activa={filtros.tamano === t}
            onClick={() => setFiltros((f) => ({ ...f, tamano: f.tamano === t ? null : t }))}
          >
            {t}
          </Pildora>
        ))}
      </div>

      <p role="status" className="-mb-2 text-[13px] text-cafe-suave">
        {lista.length === 1 ? '1 animal' : `${lista.length} animales`}
      </p>

      {lista.length === 0 ? (
        <Tarjeta className="flex flex-col gap-2 p-4 text-sm text-cafe-suave">
          <p>No hay animales con esos filtros.</p>
          {hayFiltros && (
            <button
              type="button"
              onClick={() => {
                setBusqueda('')
                setFiltros(SIN_FILTROS)
              }}
              className="min-h-11 self-start text-[13px] font-semibold text-cafe underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naranja"
            >
              Quitar búsqueda y filtros
            </button>
          )}
        </Tarjeta>
      ) : (
        <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0">
          {lista.map((a) => {
            const Icono = a.especie === 'gato' ? Cat : Dog
            return (
              <li key={a.id}>
                <Tarjeta className="flex h-full flex-col overflow-hidden">
                  <div
                    role="img"
                    aria-label={`Foto pendiente de ${a.nombre}`}
                    className="flex h-24 items-center justify-center bg-foto-vacia text-huella"
                  >
                    <Icono aria-hidden="true" size={44} />
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-3">
                    <p className="font-titulo text-base font-semibold leading-snug">{a.nombre}</p>
                    <p className="text-[13px] leading-snug text-cafe-suave">
                      {textoEdad(a.edadMeses)}
                      {esCachorro(a) ? ' · Cachorro' : ''} · {a.tamano}
                    </p>
                    {a.verificado && (
                      <p className="flex items-center gap-1 self-start rounded-full bg-salud-fondo px-2 py-0.5 text-[11px] font-semibold text-salud-trazo">
                        <BadgeCheck aria-hidden="true" size={14} />
                        Verificado
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => setAbierto(a)}
                      className="mt-auto min-h-11 rounded-boton border-2 border-barra-borde px-3 text-[13px] font-semibold text-cafe focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naranja"
                    >
                      Quiero conocerlo<span className="sr-only"> a {a.nombre}</span>
                    </button>
                  </div>
                </Tarjeta>
              </li>
            )
          })}
        </ul>
      )}

      {abierto && <FichaAdopcion animal={abierto} onCerrar={() => setAbierto(null)} />}
    </div>
  )
}
