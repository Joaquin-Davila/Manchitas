import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import Huella from '../../components/ui/Huella'
import Tarjeta from '../../components/ui/Tarjeta'
import { textoEdad } from '../../lib/edad'
import { useMascotas } from './useMascotas'

export default function ListaMascotas() {
  const { mascotas, cargando, error } = useMascotas()

  if (cargando) return null

  if (error) {
    return (
      <Tarjeta className="p-5">
        <p role="alert" className="text-sm">
          No pudimos cargar a tus mascotas. Revisa tu conexión e inténtalo de nuevo.
        </p>
      </Tarjeta>
    )
  }

  if (mascotas.length === 0) {
    return (
      <Tarjeta className="flex flex-col items-center gap-3 p-5 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-foto-vacia text-huella">
          <Huella size={44} relleno aria-hidden="true" />
        </div>
        <h2 className="font-titulo text-lg font-semibold">Aún no registras a tu perro</h2>
        <p className="text-sm text-cafe-suave">
          Dale un ID de collar y un QR para que, si alguien lo encuentra, pueda avisarte.
        </p>
        <BotonPrincipal to="/mascotas/nueva">Registrar a mi perro</BotonPrincipal>
      </Tarjeta>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-titulo text-lg font-semibold">Mis perros</h2>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {mascotas.map((m) => (
          <li key={m.id}>
            <Link
              to={`/mascotas/${m.id}`}
              className="block rounded-tarjeta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naranja"
            >
              <Tarjeta className="flex items-center gap-3 p-3">
                {m.fotoUrl ? (
                  <img src={m.fotoUrl} alt="" className="size-16 shrink-0 rounded-dato object-cover" />
                ) : (
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-dato bg-foto-vacia text-huella">
                    <Huella size={32} relleno aria-hidden="true" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-titulo text-lg font-bold">{m.nombre}</p>
                  <p className="truncate text-sm text-cafe-suave">
                    {m.raza} · {textoEdad(m.nacimiento)}
                  </p>
                  <p className="text-[13px] text-franja-texto">Folio {m.folio}</p>
                </div>
                <ChevronRight aria-hidden="true" size={22} className="shrink-0 text-cafe-suave" />
              </Tarjeta>
            </Link>
          </li>
        ))}
      </ul>
      <BotonPrincipal to="/mascotas/nueva" className="mt-1">
        Registrar otro perro
      </BotonPrincipal>
    </div>
  )
}
