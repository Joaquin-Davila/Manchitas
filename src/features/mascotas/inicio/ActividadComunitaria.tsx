import { Cat, Dog, Heart, Lightbulb, Megaphone, MessageCircle, PartyPopper, Search } from 'lucide-react'
import type { ComponentType } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { AdopcionResumen, Publicacion } from '../../../lib/comunidad'
import { haceCuanto } from '../../../lib/fechas'
import { clasesFoco, clasesTarjeta, TituloSeccion } from './comun'

type IconoPieza = ComponentType<{ size?: number; 'aria-hidden'?: boolean | 'true' | 'false' }>

const TIPOS: Record<Publicacion['tipo'], { texto: string; icono: IconoPieza; color: string }> = {
  comunidad: { texto: 'Comunidad', icono: MessageCircle, color: 'bg-aviso-fondo text-cafe' },
  consejo: { texto: 'Consejo', icono: Lightbulb, color: 'bg-amarillo-suave text-cafe' },
  adopcion: { texto: 'Adopción', icono: Heart, color: 'bg-menta-suave text-salud-trazo' },
  campana: { texto: 'Campaña', icono: Megaphone, color: 'bg-menta-suave text-salud-trazo' },
  extraviada: { texto: 'Extraviada', icono: Search, color: 'bg-aviso-fondo text-cafe' },
  logro: { texto: 'Logro', icono: PartyPopper, color: 'bg-amarillo-suave text-cafe' },
}

function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/)
  return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase()
}

function textoEdad(meses: number): string {
  if (meses < 12) return `${meses} ${meses === 1 ? 'mes' : 'meses'}`
  const anios = Math.floor(meses / 12)
  return `${anios} ${anios === 1 ? 'año' : 'años'}`
}

/** Actividad reciente: publicaciones de la comunidad y animales que buscan hogar. */
export default function ActividadComunitaria({
  publicaciones,
  adopciones,
}: {
  publicaciones: Publicacion[]
  adopciones: AdopcionResumen[]
}) {
  const [ahora] = useState(() => new Date())
  if (publicaciones.length === 0 && adopciones.length === 0) return null

  return (
    <section aria-labelledby="titulo-actividad">
      <TituloSeccion
        id="titulo-actividad"
        titulo="Lo que pasa en tu comunidad"
        subtitulo="Publicaciones recientes y animales que buscan hogar."
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-6">
        {publicaciones.length > 0 && (
          <ul className={`m-0 flex list-none flex-col divide-y divide-borde-calido p-0 ${clasesTarjeta}`}>
            {publicaciones.map((p) => {
              const { texto, icono: Icono, color } = TIPOS[p.tipo]
              return (
                <li key={p.id} className="flex gap-3 p-4">
                  <span
                    aria-hidden="true"
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amarillo-suave text-sm font-bold text-cafe"
                  >
                    {iniciales(p.autor)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-cafe-suave">
                      <span className="font-semibold text-cafe">{p.autor}</span>
                      <span>{haceCuanto(p.creadoEn, ahora)}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-px text-[11px] font-semibold ${color}`}>
                        <Icono aria-hidden size={12} />
                        {texto}
                      </span>
                      {p.demo && (
                        <span className="rounded-full bg-crema-clara px-2 py-px text-[11px] font-semibold text-cafe">Ejemplo</span>
                      )}
                    </p>
                    <p className="mt-1 text-[15px] leading-snug text-cafe">{p.texto}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {adopciones.length > 0 && (
          <div className={`flex flex-col gap-3 p-4 ${clasesTarjeta}`}>
            <h3 className="font-titulo text-base font-bold text-cafe">Buscan hogar</h3>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {adopciones.map((a) => {
                const Especie = a.especie === 'gato' ? Cat : Dog
                return (
                  <li key={a.id}>
                    <Link
                      to="/comunidad?tab=adopcion"
                      className={`flex items-center gap-3 rounded-2xl p-1.5 transition-colors hover:bg-crema-clara ${clasesFoco}`}
                    >
                      <span className="size-14 shrink-0 overflow-hidden rounded-2xl bg-foto-vacia">
                        {a.foto ? (
                          <img src={a.foto} alt="" loading="lazy" width={56} height={56} className="size-full object-cover" />
                        ) : (
                          <span className="flex size-full items-center justify-center text-huella">
                            <Especie aria-hidden="true" size={24} />
                          </span>
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-cafe">{a.nombre}</span>
                        <span className="block truncate text-[13px] text-cafe-suave">
                          {a.especie === 'gato' ? 'Gato' : 'Perro'} · {textoEdad(a.edadMeses)} · {a.publicadoPor}
                        </span>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
            <Link
              to="/comunidad?tab=adopcion"
              className={`mt-auto inline-flex min-h-11 items-center font-semibold text-naranja-sombra underline ${clasesFoco}`}
            >
              Ver todas las adopciones
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
