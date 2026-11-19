import { ArrowRight, BadgePercent, Heart, MapPin } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Huella from '../../../components/ui/Huella'
import { Aparecer, TituloSeccion, clasesElevar, clasesFoco } from './comun'

type Acceso = {
  to: string
  titulo: string
  texto: string
  icono: ReactNode
  fondo: string
  chip: string
  /** Detalle visual propio de cada tarjeta, para que no sean idénticas. */
  adorno: ReactNode
}

// Fotos de banco ya usadas en Adopción (decorativas: no representan a un animal concreto).
const FOTOS_ADOPCION = ['/img/adopcion-canela.webp', '/img/adopcion-misho.webp', '/img/adopcion-pelusa.webp']

const ACCESOS: Acceso[] = [
  {
    to: '/comunidad',
    titulo: 'Cerca de ti',
    texto: 'Campañas y veterinarias',
    icono: <MapPin aria-hidden="true" size={24} />,
    fondo: 'bg-coral-suave',
    chip: 'bg-white text-naranja',
    adorno: (
      <svg aria-hidden="true" viewBox="0 0 120 80" className="absolute -bottom-2 -right-2 w-32 text-coral-medio/70">
        <path d="M0 60 C30 40 50 70 80 45 S110 30 120 20" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="2 7" strokeLinecap="round" />
        <circle cx="80" cy="45" r="5" fill="currentColor" />
      </svg>
    ),
  },
  {
    to: '/comunidad?tab=adopcion',
    titulo: 'Adopciones',
    texto: 'Encuentra un nuevo amigo',
    icono: <Heart aria-hidden="true" size={24} />,
    fondo: 'bg-menta-suave',
    chip: 'bg-white text-salud-trazo',
    adorno: (
      <span aria-hidden="true" className="absolute bottom-4 right-4 flex -space-x-3">
        {FOTOS_ADOPCION.map((src) => (
          <img
            key={src}
            src={src}
            alt=""
            loading="lazy"
            width={44}
            height={44}
            className="size-11 rounded-full border-[3px] border-menta-suave object-cover"
          />
        ))}
      </span>
    ),
  },
  {
    to: '/salud?tab=cupones',
    titulo: 'Beneficios',
    texto: 'Ofertas para tu mascota',
    icono: <BadgePercent aria-hidden="true" size={24} />,
    fondo: 'bg-amarillo-suave',
    chip: 'bg-white text-naranja',
    adorno: (
      <span aria-hidden="true" className="absolute -bottom-3 right-3 rotate-12 text-huella">
        <Huella size={64} relleno />
      </span>
    ),
  },
]

export default function Descubre() {
  return (
    <section aria-labelledby="titulo-descubre">
      <TituloSeccion id="titulo-descubre" titulo="Descubre Manchitas" />
      <ul className="m-0 grid list-none gap-3 p-0 md:gap-4 lg:grid-cols-3">
        {ACCESOS.map((a, i) => (
          <Aparecer key={a.to} retraso={200 + i * 80} como="li" className="h-full">
              <Link
                to={a.to}
                className={`group relative flex h-full min-h-[132px] flex-col gap-3 overflow-hidden md:min-h-[104px] md:flex-row md:items-center md:gap-4 lg:min-h-[132px] lg:flex-col lg:items-start lg:gap-3 rounded-[22px] p-5 text-cafe ${a.fondo} ${clasesElevar} ${clasesFoco}`}
              >
                {a.adorno}
                <span className={`relative flex size-12 items-center justify-center rounded-2xl shadow-suave ${a.chip}`}>
                  {a.icono}
                </span>
                <span className="relative pr-16">
                  <span className="flex items-center gap-1.5 font-titulo text-lg font-bold">
                    {a.titulo}
                    <ArrowRight
                      aria-hidden="true"
                      size={18}
                      className="transition-transform motion-safe:group-hover:translate-x-1"
                    />
                  </span>
                  <span className="block text-sm text-cafe-suave">{a.texto}</span>
                </span>
              </Link>
          </Aparecer>
        ))}
      </ul>
    </section>
  )
}
