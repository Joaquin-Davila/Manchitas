import { Link } from 'react-router-dom'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import BotonSecundario from '../../components/ui/BotonSecundario'

export default function Bienvenida() {
  return (
    <main className="flex min-h-dvh flex-col md:min-h-0 lg:min-h-[640px] lg:flex-row">
      {/* Foto de banco (Pexels) de un gato y un perro; créditos en docs/ATRIBUCION-IMAGENES.md. */}
      <img
        src="/img/bienvenida.webp"
        alt="Un gato atigrado y un perro Yorkshire sentados juntos junto a una ventana"
        width={1200}
        height={800}
        fetchPriority="high"
        className="h-[300px] w-full rounded-b-[48px] bg-foto-vacia object-cover object-[35%_50%] lg:h-auto lg:w-1/2 lg:shrink-0 lg:rounded-b-none lg:rounded-r-[48px]"
      />

      <div className="flex flex-1 flex-col items-center gap-6 px-5 pb-8 pt-4 md:px-10 lg:justify-center lg:gap-10 lg:px-12 lg:py-12">
        <h1 className="sr-only">Manchitas. Deja huella, mancha y protege.</h1>
        <img
          src="/logo-manchitas.png"
          alt="Manchitas: cabeza de perro y gato con una lupa que muestra un código QR"
          className="w-60 mix-blend-multiply lg:w-[22rem]"
        />
        <div className="mt-auto flex w-full flex-col gap-4 lg:mt-0 lg:max-w-sm">
          <BotonPrincipal to="/iniciar-sesion">Iniciar sesión</BotonPrincipal>
          <BotonSecundario to="/registro">Regístrate</BotonSecundario>
          <Link
            to="/buscar"
            className="flex min-h-11 items-center justify-center text-sm font-semibold text-naranja-sombra underline"
          >
            Tengo el ID de un collar
          </Link>
          <Link
            to="/reportar"
            className="flex min-h-11 items-center justify-center text-sm font-semibold text-naranja-sombra underline"
          >
            Reportar un caso de maltrato
          </Link>
        </div>
      </div>
    </main>
  )
}
