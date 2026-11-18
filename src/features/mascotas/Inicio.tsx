import { Clock, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import Huella from '../../components/ui/Huella'
import Tarjeta from '../../components/ui/Tarjeta'
import TarjetaAviso from '../../components/ui/TarjetaAviso'
import TarjetaDato from '../../components/ui/TarjetaDato'
import TarjetaMascota from '../../components/ui/TarjetaMascota'
import { cuponesVigentes } from '../../lib/cuponesEjemplo'
import { estadoMascota, proximaCampana, tutor } from '../../lib/datosEjemplo'
import { hoyISO } from '../../lib/edad'
import { formatearFecha } from '../../lib/fechas'
import { useSesion } from '../auth/contextoSesion'
import { useCartilla } from '../salud/useCartilla'
import { useMascotas } from './useMascotas'

const enlaceAviso =
  'block rounded-tarjeta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naranja'

export default function Inicio() {
  const { sesion } = useSesion()
  const { mascotas, cargando } = useMascotas()
  const mascota = mascotas[0]
  const { cartilla } = useCartilla(mascota?.id)
  const [hoy] = useState(() => hoyISO())
  const proxima = cartilla?.proxima

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
            <TarjetaDato etiqueta="Vacunas" valor={cartilla?.vacunas.length ?? 0} color="rosa" />
            <TarjetaDato etiqueta="Pendiente" valor={proxima ? 1 : 0} color="durazno" />
            <TarjetaDato etiqueta="Cupones" valor={cuponesVigentes(hoy).length} color="lima" />
            <TarjetaDato etiqueta="Estado" valor={estadoMascota} color="celeste" />
          </div>

          {proxima && cartilla?.recordatorio ? (
            <Link to="/salud" className={enlaceAviso}>
              <TarjetaAviso
                icono={<Clock aria-hidden="true" size={26} />}
                colorIcono="bg-aviso-fondo text-naranja"
                titulo="Próximo recordatorio"
                detalle={`${proxima.nombre} · ${formatearFecha(proxima.fecha, proxima.fecha.slice(0, 4) !== hoy.slice(0, 4))}${proxima.fecha < hoy ? ' · ya pasó' : ''}`}
              />
            </Link>
          ) : !proxima ? (
            <Link to="/salud" className={enlaceAviso}>
              <TarjetaAviso
                icono={<Clock aria-hidden="true" size={26} />}
                colorIcono="bg-aviso-fondo text-naranja"
                titulo="Sin recordatorios"
                detalle="Programa la próxima vacuna en Salud"
              />
            </Link>
          ) : null}
          {campana}

          <BotonPrincipal to="/salud?tab=cupones" className="mt-1">
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
