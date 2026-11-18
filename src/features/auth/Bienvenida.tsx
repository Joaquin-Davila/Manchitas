import { Link } from 'react-router-dom'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import BotonSecundario from '../../components/ui/BotonSecundario'
import Huella from '../../components/ui/Huella'

export default function Bienvenida() {
  return (
    <main className="flex min-h-dvh flex-col">
      {/* Hueco para la foto de un perro y un gato (se reemplaza cuando haya imagen). */}
      <div
        aria-hidden="true"
        className="flex h-[300px] items-center justify-center rounded-b-[48px] bg-foto-vacia text-huella"
      >
        <Huella size={96} relleno aria-hidden="true" />
      </div>

      <div className="flex flex-1 flex-col items-center gap-6 px-5 pb-8 pt-4">
        <h1 className="sr-only">Manchitas. Deja huella, mancha y protege.</h1>
        <img
          src="/logo-manchitas.png"
          alt="Manchitas: cabeza de perro y gato con una lupa que muestra un código QR"
          className="w-60 mix-blend-multiply"
        />
        <div className="mt-auto flex w-full flex-col gap-4">
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
