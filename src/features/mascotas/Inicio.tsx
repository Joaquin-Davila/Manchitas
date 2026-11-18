import { Clock, Plus } from 'lucide-react'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import TarjetaAviso from '../../components/ui/TarjetaAviso'
import TarjetaDato from '../../components/ui/TarjetaDato'
import TarjetaMascota from '../../components/ui/TarjetaMascota'
import {
  mascota,
  proximaCampana,
  proximoRecordatorio,
  resumen,
  tutor,
} from '../../lib/datosEjemplo'

export default function Inicio() {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="-mb-2.5 font-titulo text-lg font-semibold">¡Hola, {tutor.nombre}!</h2>

      <TarjetaMascota {...mascota} />

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
      <TarjetaAviso
        icono={<Plus aria-hidden="true" size={26} />}
        colorIcono="bg-salud-fondo text-salud-trazo"
        {...proximaCampana}
      />

      <BotonPrincipal to="/salud" className="mt-1">
        Ver cupones y beneficios
      </BotonPrincipal>
    </div>
  )
}
