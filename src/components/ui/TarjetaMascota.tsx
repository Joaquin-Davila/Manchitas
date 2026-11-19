import Huella from './Huella'
import Tarjeta from './Tarjeta'
import type { Mascota } from '../../types/mascota'

type Props = Pick<Mascota, 'nombre' | 'fotoUrl'> & { folio?: string }

export default function TarjetaMascota({ nombre, folio, fotoUrl }: Props) {
  return (
    <Tarjeta className="overflow-hidden">
      {fotoUrl ? (
        <img
          src={fotoUrl}
          alt={`Foto de ${nombre}`}
          className="h-[150px] w-full object-cover md:h-[220px]"
        />
      ) : (
        <div className="flex h-[150px] md:h-[220px] items-center justify-center bg-foto-vacia text-huella">
          <Huella aria-hidden="true" size={64} relleno />
        </div>
      )}
      <div className="flex items-center justify-between bg-franja px-4 py-3 text-franja-texto">
        <p className="font-titulo text-[22px] font-bold text-cafe">{nombre}</p>
        {folio && <p className="text-sm">Folio {folio}</p>}
      </div>
    </Tarjeta>
  )
}
