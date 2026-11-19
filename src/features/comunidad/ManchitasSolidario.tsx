import {
  ArrowDown,
  ArrowRight,
  FileCheck2,
  HandCoins,
  HandHeart,
  Heart,
  Landmark,
  Megaphone,
  Package,
  PawPrint,
  QrCode,
  Receipt,
  Sprout,
  Target,
  Users,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { clasesBotonSecundario } from '../../components/ui/BotonSecundario'
import Huella from '../../components/ui/Huella'
import { Aparecer, HuellasDecorativas, clasesElevar, clasesTarjeta } from '../mascotas/inicio/comun'
import { clasesFocoComunidad } from './piezas'

// Manchitas Solidario: todavía no hay datos de donaciones, ventas de placas, iniciativas ni pasarela
// de pago. Nada aquí muestra cantidades: las acciones sin funcionalidad quedan marcadas como pendientes.

// Fotos de banco ya usadas en Adopción (Pexels, docs/ATRIBUCION-IMAGENES.md): no son los animales reales.
const FOTOS = [
  { src: '/img/adopcion-toto.webp', alt: 'Perro color miel mirando a un lado' },
  { src: '/img/adopcion-luna.webp', alt: 'Gata atigrada de ojos cafés' },
  { src: '/img/adopcion-canela.webp', alt: 'Perro café claro entre plantas' },
]

function irA(id: string) {
  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  document.getElementById(id)?.scrollIntoView({ behavior: reducido ? 'auto' : 'smooth', block: 'start' })
}

function Pendiente({ children = 'Pendiente de integración' }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-aviso-fondo px-2.5 py-1 text-[11px] font-semibold text-cafe">{children}</span>
  )
}

function Encabezado() {
  return (
    <div className={`grid grid-cols-1 overflow-hidden lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] ${clasesTarjeta}`}>
      <div className="relative flex flex-col justify-center gap-4 bg-amarillo-suave p-6 md:p-9">
        <HuellasDecorativas
          huellas={[
            { top: '14px', right: '18px', size: 54, giro: 18 },
            { bottom: '18px', right: '34%', size: 30, giro: -14, retraso: 1400 },
          ]}
        />
        <p className="relative inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-salud-trazo">
          <HandHeart aria-hidden="true" size={14} />
          Iniciativa de Manchitas
        </p>
        <div className="relative">
          <h2 id="titulo-solidario" className="font-titulo text-[28px] font-bold leading-tight text-cafe md:text-4xl">
            Manchitas{' '}
            <span className="whitespace-nowrap">
              Solidario{' '}
              <span className="inline-block align-[-3px]">
                <Heart aria-hidden="true" size={28} className="fill-coral-medio text-naranja" />
              </span>
            </span>
          </h2>
          <p className="mt-1 font-titulo text-lg font-semibold text-naranja-sombra md:text-xl">Pequeñas aportaciones, grandes huellas.</p>
        </div>
        <p className="relative max-w-xl text-[15px] text-cafe-suave md:text-base">
          Creemos que todos podemos hacer algo por los animales que más lo necesitan. Súmate a iniciativas que ayudan
          a refugios, rescatistas y mascotas en situación de calle en Hermosillo.
        </p>
        <button
          type="button"
          onClick={() => irA('como-ayudar')}
          className={`relative flex h-[50px] w-full items-center justify-center gap-2 rounded-boton bg-naranja px-6 text-[15px] font-semibold text-white shadow-boton transition-transform active:translate-y-[3px] sm:w-fit ${clasesFocoComunidad}`}
        >
          Conoce cómo ayudar
          <ArrowDown aria-hidden="true" size={18} />
        </button>
      </div>
      <div className="relative grid min-h-[260px] grid-cols-2 grid-rows-2 gap-1.5 bg-white p-1.5">
        {FOTOS.map((f, i) => (
          <img
            key={f.src}
            src={f.src}
            alt={f.alt}
            loading="lazy"
            width={480}
            height={360}
            className={`size-full rounded-[18px] object-cover ${i === 0 ? 'row-span-2' : ''}`}
          />
        ))}
        <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-cafe">Fotos de ejemplo</span>
      </div>
    </div>
  )
}

/** Fondo 1x1: sin datos conectados no se muestra ninguna cifra; se explica qué se publicará. */
function Fondo1x1() {
  const indicadores = [
    { icono: HandCoins, etiqueta: 'Total recaudado' },
    { icono: Target, etiqueta: 'Meta de recaudación' },
    { icono: QrCode, etiqueta: 'Placas que han contribuido' },
    { icono: Landmark, etiqueta: 'Destino de los recursos' },
  ]
  return (
    <section aria-labelledby="titulo-fondo" className={`relative overflow-hidden p-6 md:p-8 ${clasesTarjeta}`}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-menta-suave text-salud-trazo">
              <QrCode aria-hidden="true" size={22} />
            </span>
            <Pendiente>Aún sin datos publicados</Pendiente>
          </div>
          <h3 id="titulo-fondo" className="mt-3 font-titulo text-2xl font-bold text-cafe">
            Fondo 1x1{' '}
            <span className="whitespace-nowrap">
              Solidario{' '}
              <span className="inline-block align-[-2px] text-huella">
                <Huella aria-hidden="true" size={22} relleno />
              </span>
            </span>
          </h3>
          <p className="mt-2 text-[15px] text-cafe-suave">
            Por cada placa QR de Manchitas vendida, destinamos una aportación al apoyo de refugios y animales que
            necesitan una segunda oportunidad.
          </p>
          <p className="mt-3 text-[13px] text-cafe-suave">
            El registro y el QR digital siguen siendo gratuitos: el fondo se alimenta de las placas físicas.
          </p>
        </div>

        <div className="rounded-[20px] bg-crema-clara p-4 md:p-5">
          <ul className="m-0 grid list-none grid-cols-1 gap-2.5 p-0 sm:grid-cols-2">
            {indicadores.map(({ icono: Icono, etiqueta }) => (
              <li key={etiqueta} className="flex items-center gap-3 rounded-2xl border border-borde-calido bg-white p-3">
                <Icono aria-hidden="true" size={20} className="shrink-0 text-salud-trazo" />
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold text-cafe">{etiqueta}</span>
                  <span className="block text-xs text-cafe-suave">Se publicará con datos reales</span>
                </span>
              </li>
            ))}
          </ul>
          {/* Sin barra de progreso: una barra vacía se leería como "0 % recaudado". */}
          <p className="mt-3 text-[13px] text-cafe-suave">
            Todavía no hay ventas de placas registradas, así que no mostramos cifras ni avance. Cuando el fondo esté
            activo, aquí verás el progreso hacia la meta.
          </p>
        </div>
      </div>
    </section>
  )
}

function ComoAyudar({ onExplorarCampanas }: { onExplorarCampanas: () => void }) {
  return (
    <section id="como-ayudar" aria-labelledby="titulo-como-ayudar" className="scroll-mt-24">
      <h3 id="titulo-como-ayudar" className="mb-3 font-titulo text-xl font-bold text-cafe md:text-[22px]">
        ¿Cómo puedes ayudar?
      </h3>
      <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-3">
        <Aparecer como="li" retraso={40}>
          <article className={`flex h-full flex-col gap-3 p-5 ${clasesTarjeta}`}>
            <span className="flex size-12 items-center justify-center rounded-2xl bg-amarillo-suave text-naranja-sombra">
              <HandCoins aria-hidden="true" size={24} />
            </span>
            <h4 className="font-titulo text-lg font-bold text-cafe">Donaciones</h4>
            <p className="text-sm text-cafe-suave">Contribuye con una aportación económica para apoyar iniciativas de protección animal.</p>
            <div className="mt-auto flex flex-col gap-2">
              {/* Sin pasarela de pago no hay cobros simulados: el botón queda deshabilitado. */}
              <button type="button" disabled aria-describedby="nota-donar" className={`${clasesBotonSecundario} h-11! cursor-not-allowed opacity-60`}>
                Quiero donar
              </button>
              <p id="nota-donar" className="flex flex-wrap items-center gap-1.5 text-xs text-cafe-suave">
                <Pendiente />
                Falta conectar una pasarela de pago.
              </p>
            </div>
          </article>
        </Aparecer>
        <Aparecer como="li" retraso={100}>
          <article className={`flex h-full flex-col gap-3 p-5 ${clasesTarjeta} ${clasesElevar}`}>
            <span className="flex size-12 items-center justify-center rounded-2xl bg-menta-suave text-salud-trazo">
              <Package aria-hidden="true" size={24} />
            </span>
            <h4 className="font-titulo text-lg font-bold text-cafe">Apoyo en especie</h4>
            <p className="text-sm text-cafe-suave">
              Conoce las necesidades de alimento, medicamentos, cobijas y otros artículos de los animales rescatados.
            </p>
            <button type="button" onClick={() => irA('iniciativas')} className={`${clasesBotonSecundario} mt-auto h-11! gap-1.5`}>
              Ver necesidades
              <ArrowDown aria-hidden="true" size={16} />
            </button>
          </article>
        </Aparecer>
        <Aparecer como="li" retraso={160}>
          <article className={`flex h-full flex-col gap-3 p-5 ${clasesTarjeta} ${clasesElevar}`}>
            <span className="flex size-12 items-center justify-center rounded-2xl bg-coral-suave text-naranja-sombra">
              <Megaphone aria-hidden="true" size={24} />
            </span>
            <h4 className="font-titulo text-lg font-bold text-cafe">Difunde y participa</h4>
            <p className="text-sm text-cafe-suave">Ayúdanos a compartir campañas, adopciones e iniciativas solidarias.</p>
            <button type="button" onClick={onExplorarCampanas} className={`${clasesBotonSecundario} mt-auto h-11! gap-1.5`}>
              Explorar campañas
              <ArrowRight aria-hidden="true" size={16} />
            </button>
          </article>
        </Aparecer>
      </ul>
    </section>
  )
}

/** Iniciativas: no hay registros; las categorías solo describen lo que se podrá publicar. */
function Iniciativas() {
  const categorias = [
    { icono: Package, texto: 'Alimento para refugios' },
    { icono: Sprout, texto: 'Medicamentos' },
    { icono: Heart, texto: 'Atención veterinaria' },
    { icono: Receipt, texto: 'Cobijas y artículos de limpieza' },
    { icono: PawPrint, texto: 'Apoyo a animales rescatados' },
  ]
  return (
    <section id="iniciativas" aria-labelledby="titulo-iniciativas" className="scroll-mt-24">
      <h3 id="titulo-iniciativas" className="font-titulo text-xl font-bold text-cafe md:text-[22px]">
        Juntos podemos ayudar
      </h3>
      <p className="mt-0.5 text-sm text-cafe-suave md:text-[15px]">Iniciativas solidarias de refugios y rescatistas de Hermosillo.</p>
      <div className={`relative mt-3 flex flex-col items-center gap-3 overflow-hidden p-8 text-center ${clasesTarjeta}`}>
        <HuellasDecorativas huellas={[{ top: '-10px', left: '6%', size: 60, giro: -18 }, { bottom: '-12px', right: '8%', size: 70, giro: 16, retraso: 1200 }]} />
        <span className="relative flex size-14 items-center justify-center rounded-full bg-menta-suave text-salud-trazo">
          <Users aria-hidden="true" size={26} />
        </span>
        <p className="relative max-w-md font-titulo text-lg font-semibold text-cafe">
          Próximamente publicaremos campañas solidarias verificadas.
        </p>
        <p className="relative max-w-lg text-sm text-cafe-suave">
          Cada iniciativa mostrará la organización beneficiada (solo con su autorización), la necesidad que cubre y,
          cuando haya información real, su meta y su avance.
        </p>
        <ul aria-label="Tipos de iniciativa que se podrán publicar" className="relative m-0 mt-1 flex list-none flex-wrap justify-center gap-2 p-0">
          {categorias.map(({ icono: Icono, texto }) => (
            <li key={texto} className="inline-flex items-center gap-1.5 rounded-full bg-aviso-fondo px-3 py-1.5 text-[13px] font-semibold text-cafe">
              <Icono aria-hidden="true" size={14} className="text-salud-trazo" />
              {texto}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Transparencia() {
  const puntos = [
    { icono: HandCoins, texto: 'Aportaciones recibidas' },
    { icono: Landmark, texto: 'Destino de los recursos' },
    { icono: Users, texto: 'Organizaciones beneficiadas' },
    { icono: FileCheck2, texto: 'Comprobantes de entrega' },
    { icono: Target, texto: 'Resultados de las iniciativas' },
  ]
  return (
    <section aria-labelledby="titulo-transparencia" className="rounded-[24px] border border-dashed border-borde-calido bg-white/60 p-5 md:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h3 id="titulo-transparencia" className="font-titulo text-lg font-bold text-cafe">
          Tu ayuda llega a donde más se necesita
        </h3>
        <Pendiente>En preparación</Pendiente>
      </div>
      <p className="mt-1 max-w-3xl text-sm text-cafe-suave">
        Queremos que cada aportación se pueda seguir. Cuando el programa esté activo, publicaremos información clara
        sobre:
      </p>
      <ul className="m-0 mt-3 flex list-none flex-wrap gap-2 p-0">
        {puntos.map(({ icono: Icono, texto }) => (
          <li key={texto} className="inline-flex items-center gap-1.5 rounded-full border border-borde-calido bg-white px-3 py-1.5 text-[13px] font-semibold text-cafe">
            <Icono aria-hidden="true" size={14} className="text-salud-trazo" />
            {texto}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function ManchitasSolidario({ onExplorarCampanas }: { onExplorarCampanas: () => void }) {
  return (
    <section aria-labelledby="titulo-solidario" className="flex flex-col gap-6 md:gap-8">
      <Aparecer>
        <Encabezado />
      </Aparecer>
      <Aparecer retraso={80}>
        <Fondo1x1 />
      </Aparecer>
      <ComoAyudar onExplorarCampanas={onExplorarCampanas} />
      <Iniciativas />
      <Transparencia />
      <p className="flex items-center justify-center gap-2 text-center font-titulo text-lg font-semibold text-cafe">
        <Huella aria-hidden="true" size={20} relleno />
        Cada huella cuenta. Cada ayuda transforma una vida.
      </p>
    </section>
  )
}
