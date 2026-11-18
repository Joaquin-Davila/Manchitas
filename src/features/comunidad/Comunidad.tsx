import { useSearchParams } from 'react-router-dom'
import Pestanas from '../../components/ui/Pestanas'
import Tarjeta from '../../components/ui/Tarjeta'
import PanelCampanas from './PanelCampanas'

const PESTANAS = [
  { id: 'campanas', etiqueta: 'Campañas' },
  { id: 'adopcion', etiqueta: 'Adopción' },
]

export default function Comunidad() {
  const [params, setParams] = useSearchParams()
  const activa = params.get('tab') === 'adopcion' ? 'adopcion' : 'campanas'

  function cambiar(id: string) {
    setParams(id === 'campanas' ? {} : { tab: id }, { replace: true })
  }

  return (
    <div className="flex flex-col gap-4">
      <Pestanas pestanas={PESTANAS} activa={activa} onCambiar={cambiar} etiqueta="Comunidad" base="comunidad" />

      <div id={`comunidad-panel-${activa}`} role="tabpanel" aria-labelledby={`comunidad-tab-${activa}`}>
        {activa === 'adopcion' ? (
          // Provisional: la adopción responsable llega en el paso 9.
          <Tarjeta className="flex flex-col gap-2 p-5 text-center">
            <p className="font-titulo text-lg font-semibold">Adopción responsable</p>
            <p className="text-sm text-cafe-suave">
              Muy pronto verás aquí perros y gatos con sello “Verificado”.
            </p>
          </Tarjeta>
        ) : (
          <PanelCampanas />
        )}
      </div>
    </div>
  )
}
