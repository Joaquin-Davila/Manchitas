import { useSearchParams } from 'react-router-dom'
import Pestanas from '../../components/ui/Pestanas'
import PanelAdopcion from './PanelAdopcion'
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
          <PanelAdopcion />
        ) : (
          <PanelCampanas />
        )}
      </div>
    </div>
  )
}
