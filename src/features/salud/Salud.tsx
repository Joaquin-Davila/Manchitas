import { useSearchParams } from 'react-router-dom'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import Pestanas from '../../components/ui/Pestanas'
import Tarjeta from '../../components/ui/Tarjeta'
import { useMascotas } from '../mascotas/useMascotas'
import PanelCartilla from './PanelCartilla'
import PanelCupones from './PanelCupones'
import { useCartilla } from './useCartilla'

const PESTANAS = [
  { id: 'cartilla', etiqueta: 'Cartilla digital' },
  { id: 'cupones', etiqueta: 'Billetera de cupones' },
]

export default function Salud() {
  const [params, setParams] = useSearchParams()
  const activa = params.get('tab') === 'cupones' ? 'cupones' : 'cartilla'
  const { mascotas, cargando: cargandoMascotas } = useMascotas()
  const mascota = mascotas[0]
  const { cartilla, cargando, error, ...acciones } = useCartilla(mascota?.id)

  function cambiar(id: string) {
    setParams(id === 'cartilla' ? {} : { tab: id }, { replace: true })
  }

  return (
    <div className="flex flex-col gap-4">
      <Pestanas pestanas={PESTANAS} activa={activa} onCambiar={cambiar} etiqueta="Salud" base="salud" />

      <div id={`salud-panel-${activa}`} role="tabpanel" aria-labelledby={`salud-tab-${activa}`}>
        {activa === 'cupones' ? (
          <PanelCupones />
        ) : cargandoMascotas || cargando ? null : error ? (
          <Tarjeta className="p-5">
            <p role="alert" className="text-sm">
              No pudimos cargar la cartilla. Revisa tu conexión e inténtalo de nuevo.
            </p>
          </Tarjeta>
        ) : mascota && cartilla ? (
          <PanelCartilla key={mascota.id} mascota={mascota} cartilla={cartilla} acciones={acciones} />
        ) : (
          <Tarjeta className="flex flex-col gap-3 p-5 text-center">
            <p className="font-titulo text-lg font-semibold">Primero registra a tu perro</p>
            <p className="text-sm text-cafe-suave">
              La cartilla se guarda en la ficha de tu mascota.
            </p>
            <BotonPrincipal to="/mascotas/nueva">Registrar a mi perro</BotonPrincipal>
          </Tarjeta>
        )}
      </div>
    </div>
  )
}
