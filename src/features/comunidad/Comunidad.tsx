import { CalendarHeart, Heart, MapPin } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import Huella from '../../components/ui/Huella'
import Pestanas from '../../components/ui/Pestanas'
import { Aparecer } from '../mascotas/inicio/comun'
import PanelAdopcion from './PanelAdopcion'
import PanelCampanas from './PanelCampanas'

const PESTANAS = [
  { id: 'campanas', etiqueta: 'Campañas', icono: <CalendarHeart aria-hidden="true" size={18} /> },
  { id: 'adopcion', etiqueta: 'Adopción', icono: <Heart aria-hidden="true" size={18} /> },
]

export default function Comunidad() {
  const [params, setParams] = useSearchParams()
  const activa = params.get('tab') === 'adopcion' ? 'adopcion' : 'campanas'

  function cambiar(id: string) {
    setParams(id === 'campanas' ? {} : { tab: id }, { replace: true })
  }

  return (
    <div className="flex flex-col gap-6 md:gap-7">
      {/* Sin geolocalización: la ciudad es fija y no se pide permiso de ubicación. */}
      <Aparecer className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-titulo text-[26px] font-bold leading-tight text-cafe md:text-[32px]">
            Conecta con tu{' '}
            <span className="whitespace-nowrap">
              comunidad{' '}
              <span className="inline-block align-[-3px]">
                <Huella aria-hidden="true" size={28} relleno />
              </span>
            </span>
          </h2>
          <p className="mt-1 max-w-2xl text-[15px] text-cafe-suave md:text-base">
            Hermosillo se mueve por sus huellas. Descubre campañas, adopciones y personas que trabajan por el
            bienestar animal.
          </p>
        </div>
        <p className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-borde-calido bg-white px-3 py-1.5 text-[13px] font-semibold text-cafe">
          <MapPin aria-hidden="true" size={15} className="text-naranja" />
          Hermosillo, Sonora
        </p>
      </Aparecer>

      <div className="md:max-w-md">
        <Pestanas pestanas={PESTANAS} activa={activa} onCambiar={cambiar} etiqueta="Comunidad" base="comunidad" />
      </div>

      <div id={`comunidad-panel-${activa}`} role="tabpanel" aria-labelledby={`comunidad-tab-${activa}`}>
        {activa === 'adopcion' ? <PanelAdopcion /> : <PanelCampanas />}
      </div>
    </div>
  )
}
