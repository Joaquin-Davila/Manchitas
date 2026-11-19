import { ArrowRight, HeartHandshake, LogIn, ScanLine, UserPlus } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import BotonSecundario from '../../components/ui/BotonSecundario'
import Huella from '../../components/ui/Huella'

const retraso = (ms: number) => ({ '--retraso': `${ms}ms` }) as CSSProperties

function Acceso({
  to,
  icono,
  fondoIcono,
  titulo,
  texto,
  accion,
}: {
  to: string
  icono: ReactNode
  fondoIcono: string
  titulo: string
  texto: string
  accion: string
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3.5 rounded-[20px] border border-borde-calido bg-white/80 p-3.5 transition-[transform,box-shadow,background-color] duration-200 hover:bg-white hover:shadow-suave motion-safe:hover:-translate-y-0.5"
    >
      <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${fondoIcono}`}>{icono}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold leading-snug text-cafe">{titulo}</span>
        <span className="block text-[13px] text-cafe-suave">{texto}</span>
        <span className="mt-1 flex items-center gap-1 text-[13px] font-semibold text-naranja-sombra">
          {accion}
          <ArrowRight aria-hidden="true" size={15} className="transition-transform motion-safe:group-hover:translate-x-1" />
        </span>
      </span>
    </Link>
  )
}

/**
 * Puerta de entrada. En móvil: logo, bienvenida, foto, acciones y pie (en ese orden).
 * Desde `lg` la foto ocupa la columna izquierda a toda la altura y lo demás se centra a la derecha.
 */
export default function Bienvenida() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[560px] flex-col gap-6 px-5 pb-8 pt-6 md:gap-7 md:pt-10 lg:grid lg:max-w-[1280px] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] lg:gap-x-14 lg:p-6 xl:gap-x-20">
      {/* En móvil este bloque no existe (contents) y sus hijos se ordenan alrededor de la foto con
          order-*; desde lg es la columna derecha, centrada a lo alto. */}
      <div className="contents lg:col-start-2 lg:row-start-1 lg:mx-auto lg:flex lg:w-full lg:max-w-[440px] lg:flex-col lg:justify-center lg:gap-6 lg:py-6">
      {/* 1-2. Logo y bienvenida */}
      <header className="order-1 flex flex-col items-center text-center">
        <div className="aparecer" style={retraso(0)}>
          {/* Logo oficial (ya trae el nombre y el eslogan "Cuidamos cada paso de tu mejor amigo."). */}
          <img
            src="/logo-manchitas.png"
            alt="Manchitas. Cuidamos cada paso de tu mejor amigo."
            width={1024}
            height={765}
            className="flotar -my-3 h-auto w-44 mix-blend-multiply md:w-52 lg:-my-4 lg:w-56"
          />
        </div>
        <h1
          className="aparecer mt-2 font-titulo text-[25px] font-bold leading-tight text-cafe md:text-3xl"
          style={retraso(90)}
        >
          ¡Bienvenido a{' '}
          <span className="whitespace-nowrap">
            Manchitas!{' '}
            <span className="inline-block align-[-2px]">
              <Huella aria-hidden="true" size={24} relleno />
            </span>
          </span>
        </h1>
        <p className="aparecer mt-2 max-w-sm text-[15px] text-cafe-suave md:text-base" style={retraso(150)}>
          Un espacio para cuidar, proteger y conectar con quienes más queremos.
        </p>
      </header>


      {/* 4-7. Acciones */}
      <div className="order-3 flex flex-col gap-3">
        <div className="aparecer flex flex-col gap-3" style={retraso(200)}>
          <BotonPrincipal to="/iniciar-sesion" className="gap-2 transition-[transform,background-color] hover:bg-[#30577f]">
            <LogIn aria-hidden="true" size={20} />
            Iniciar sesión
          </BotonPrincipal>
          <BotonSecundario to="/registro" className="gap-2 border-amarillo! transition-[transform,background-color] hover:bg-amarillo-suave">
            <UserPlus aria-hidden="true" size={20} />
            Crear una cuenta
          </BotonSecundario>
        </div>

        <p className="aparecer mt-3 flex items-center gap-3 text-xs font-semibold text-cafe-suave" style={retraso(260)}>
          <span aria-hidden="true" className="h-px flex-1 bg-borde-calido" />
          Sin cuenta también puedes
          <span aria-hidden="true" className="h-px flex-1 bg-borde-calido" />
        </p>

        <div className="aparecer flex flex-col gap-2.5" style={retraso(300)}>
          <Acceso
            to="/buscar"
            icono={<ScanLine aria-hidden="true" size={24} />}
            fondoIcono="bg-petroleo/10 text-petroleo"
            titulo="¿Tienes un collar Manchitas?"
            texto="Consulta la identificación de una mascota."
            accion="Abrir identificación"
          />
          <Acceso
            to="/reportar"
            icono={<HeartHandshake aria-hidden="true" size={24} />}
            fondoIcono="bg-coral-suave text-naranja-sombra"
            titulo="¿Necesitas reportar maltrato?"
            texto="Ayúdanos a proteger a los animales."
            accion="Realizar un reporte"
          />
        </div>
      </div>

      {/* 8. Pie */}
      <footer
        className="aparecer order-4 flex flex-col items-center gap-1 pt-2 text-center text-[13px] text-cafe-suave lg:pt-0"
        style={retraso(360)}
      >
        <p className="flex items-center gap-1.5 font-semibold text-cafe">
          <Huella aria-hidden="true" size={14} relleno />
          Una comunidad que deja huella.
        </p>
        <p>Hermosillo, Sonora · Hecho con cariño por 2ISI</p>
        <Link to="/privacidad" className="flex min-h-11 items-center font-semibold text-naranja-sombra underline">
          Aviso de privacidad
        </Link>
      </footer>
      </div>

      {/* 3. Foto. Créditos en docs/ATRIBUCION-IMAGENES.md (Pexels). */}
      <figure
        className="aparecer order-2 relative m-0 flex flex-col overflow-hidden rounded-[28px] bg-petroleo shadow-suave lg:col-start-1 lg:row-start-1 lg:block lg:min-h-[calc(100dvh-48px)] lg:rounded-[36px]"
        style={retraso(120)}
      >
        <img
          src="/img/bienvenida.webp"
          alt="Un gato atigrado y un perro Yorkshire sentados juntos junto a una ventana"
          width={1200}
          height={800}
          fetchPriority="high"
          className="h-[200px] w-full bg-foto-vacia object-cover object-[42%_38%] md:h-[280px] lg:absolute lg:inset-0 lg:h-full"
        />
        <figcaption className="flex items-center gap-3 px-4 py-3 text-white lg:absolute lg:inset-x-6 lg:bottom-6 lg:max-w-md lg:gap-4 lg:rounded-3xl lg:bg-petroleo/85 lg:px-6 lg:py-5 lg:backdrop-blur-sm">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-amarillo lg:size-12">
            <Huella aria-hidden="true" size={22} relleno />
          </span>
          <span>
            <span className="block font-titulo text-base font-semibold leading-tight lg:text-[22px]">
              Cada huella tiene una historia.
            </span>
            <span className="block text-[13px] text-white/85 lg:text-[15px]">Ayúdanos a protegerla.</span>
          </span>
        </figcaption>
      </figure>
    </main>
  )
}
