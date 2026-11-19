import { Heart } from 'lucide-react'
import { HuellasDecorativas } from './comun'

/** Cierre emocional de Inicio. */
export default function CadaHuella() {
  return (
    <section
      aria-labelledby="titulo-huella"
      className="relative overflow-hidden rounded-[28px] border border-amarillo-borde/60 bg-amarillo-suave px-6 py-8 md:px-10 md:py-10"
    >
      <HuellasDecorativas
        className="text-huella"
        huellas={[
          { top: '18px', left: '4%', size: 34, giro: -24 },
          { top: '56px', left: '12%', size: 26, giro: -10, retraso: 600 },
          { bottom: '14px', right: '30%', size: 30, giro: 18, retraso: 1200 },
          { top: '16px', right: '16%', size: 42, giro: 26, retraso: 1800 },
        ]}
      />
      <div className="relative flex flex-col items-center gap-5 text-center md:flex-row md:text-left">
        <img
          src="/img/bienvenida.webp"
          alt=""
          loading="lazy"
          width={128}
          height={128}
          className="size-28 shrink-0 rounded-full border-4 border-white object-cover shadow-suave md:size-32"
        />
        <div>
          <h2 id="titulo-huella" className="flex items-center justify-center gap-2 font-titulo text-2xl font-bold text-cafe md:justify-start md:text-[28px]">
            Cada huella cuenta
            <Heart aria-hidden="true" size={26} className="fill-amarillo text-naranja" />
          </h2>
          <p className="mt-2 max-w-xl text-[15px] text-cafe-suave md:text-base">
            Pequeñas acciones pueden hacer una gran diferencia para los animales de nuestra ciudad.
          </p>
        </div>
      </div>
    </section>
  )
}
