import { Clock, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import Huella from '../../components/ui/Huella'
import Tarjeta from '../../components/ui/Tarjeta'
import TarjetaAviso from '../../components/ui/TarjetaAviso'
import TarjetaDato from '../../components/ui/TarjetaDato'
import TarjetaMascota from '../../components/ui/TarjetaMascota'
import { proximaCampana, proximoRecordatorio, resumen, tutor } from '../../lib/datosEjemplo'
import { useSesion } from '../auth/contextoSesion'
import { useMascotas } from './useMascotas'

export default function Inicio() {
  const { sesion } = useSesion()
  const { mascotas, cargando } = useMascotas()
  const mascota = mascotas[0]

  const campana = (
    <TarjetaAviso
      icono={<Plus aria-hidden="true" size={26} />}
      colorIcono="bg-salud-fondo text-salud-trazo"
      {...proximaCampana}
    />
  )

  return (
    <div className="flex flex-col gap-3">
      <h2 className="-mb-2.5 font-titulo text-lg font-semibold">
        ¡Hola, {sesion?.nombre ?? tutor.nombre}!
      </h2>

      {cargando ? null : mascota ? (
        <>
          <Link
            to={`/mascotas/${mascota.id}`}
            className="block rounded-tarjeta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naranja"
          >
            <TarjetaMascota nombre={mascota.nombre} folio={mascota.folio} fotoUrl={mascota.fotoUrl} />
          </Link>

          <div className="grid grid-cols-4 gap-2.5">
            <TarjetaDato etiqueta="Vacunas" valor={resumen.vacunasAplicadas} color="rosa" />
            <TarjetaDato etiqueta="Pendiente" valor={resumen.pendientes} color="durazno" />
            <TarjetaDato etiqueta="Cupones" valor={resumen.cupones} color="lima" />
            <TarjetaDato etiqueta="Estado" valor={resumen.estado} color="celeste" />
          </div>

          <TarjetaAviso
            icono={<Clock aria-hidden="true" size={26} />}
            colorIcono="bg-aviso-fondo text-naranja"
            {...proximoRecordatorio}
          />
          {campana}

          <BotonPrincipal to="/salud" className="mt-1">
            Ver cupones y beneficios
          </BotonPrincipal>
        </>
      ) : (
        <>
          <Tarjeta className="flex flex-col items-center gap-3 p-5 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-foto-vacia text-huella">
              <Huella size={44} relleno aria-hidden="true" />
            </div>
            <p className="font-titulo text-lg font-semibold">Aún no registras a tu perro</p>
            <p className="text-sm text-cafe-suave">
              Dale un ID de collar y un QR para que, si alguien lo encuentra, pueda avisarte.
            </p>
            <BotonPrincipal to="/mascotas/nueva">Registrar a mi perro</BotonPrincipal>
          </Tarjeta>
          {campana}
        </>
      )}
    </div>
  )
}
