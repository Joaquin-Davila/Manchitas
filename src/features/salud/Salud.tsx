import { ClipboardList, Stethoscope, Ticket } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import Huella from '../../components/ui/Huella'
import Pestanas from '../../components/ui/Pestanas'
import { Aparecer, clasesTarjeta } from '../mascotas/inicio/comun'
import { useMascotas } from '../mascotas/useMascotas'
import PanelCartilla from './PanelCartilla'
import PanelCupones from './PanelCupones'
import SelectorMascota from './SelectorMascota'
import { useCartilla } from './useCartilla'

const PESTANAS = [
  { id: 'cartilla', etiqueta: 'Cartilla digital', icono: <ClipboardList aria-hidden="true" size={18} className="hidden sm:block" /> },
  { id: 'cupones', etiqueta: 'Billetera de cupones', icono: <Ticket aria-hidden="true" size={18} className="hidden sm:block" /> },
]

export default function Salud() {
  const [params, setParams] = useSearchParams()
  const activa = params.get('tab') === 'cupones' ? 'cupones' : 'cartilla'
  const { mascotas, cargando: cargandoMascotas, error: errorMascotas } = useMascotas()
  // La mascota elegida vive en la URL (?mascota=id); si no existe o no es de esta cuenta, la primera.
  const mascota = mascotas.find((m) => m.id === params.get('mascota')) ?? mascotas[0]
  const { cartilla, cargando, error, ...acciones } = useCartilla(mascota?.id)

  function actualizar(cambios: Record<string, string | null>) {
    const siguiente = new URLSearchParams(params)
    for (const [clave, valor] of Object.entries(cambios)) {
      if (valor === null) siguiente.delete(clave)
      else siguiente.set(clave, valor)
    }
    setParams(siguiente, { replace: true })
  }

  return (
    <div className="flex flex-col gap-6 md:gap-7">
      <Aparecer>
        <h2 className="font-titulo text-[26px] font-bold leading-tight text-cafe md:text-[32px]">
          Salud y{' '}
          <span className="whitespace-nowrap">
            bienestar{' '}
            <span className="inline-block align-[-3px] text-salud-trazo">
              <Stethoscope aria-hidden="true" size={28} />
            </span>
          </span>
        </h2>
        <p className="mt-1 text-[15px] text-cafe-suave md:text-base">
          El bienestar de tu compañero comienza con sus cuidados.
        </p>
      </Aparecer>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="lg:w-[460px]">
          <Pestanas
            pestanas={PESTANAS}
            activa={activa}
            onCambiar={(id) => actualizar({ tab: id === 'cartilla' ? null : id })}
            etiqueta="Salud"
            base="salud"
          />
        </div>
        {activa === 'cartilla' && mascotas.length > 1 && mascota && (
          <SelectorMascota mascotas={mascotas} elegida={mascota.id} onElegir={(id) => actualizar({ mascota: id })} />
        )}
      </div>

      <div id={`salud-panel-${activa}`} role="tabpanel" aria-labelledby={`salud-tab-${activa}`}>
        {activa === 'cupones' ? (
          <PanelCupones />
        ) : cargandoMascotas || cargando ? (
          <div aria-hidden="true" className="flex flex-col gap-4">
            <div className="h-40 animate-pulse rounded-[24px] bg-white/70" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-[20px] bg-white/70" />
              ))}
            </div>
          </div>
        ) : errorMascotas || error ? (
          <div className={`p-5 ${clasesTarjeta}`}>
            <p role="alert" className="text-sm">
              No pudimos cargar la cartilla. Revisa tu conexión e inténtalo de nuevo.
            </p>
          </div>
        ) : mascota && cartilla ? (
          // key: al cambiar de mascota se reinicia todo el panel (formularios, avisos y detalles abiertos).
          <PanelCartilla key={mascota.id} mascota={mascota} cartilla={cartilla} acciones={acciones} />
        ) : (
          <div className={`flex flex-col items-center gap-3 p-8 text-center ${clasesTarjeta}`}>
            <span className="flex size-16 items-center justify-center rounded-full bg-foto-vacia text-huella">
              <Huella aria-hidden="true" size={36} relleno />
            </span>
            <p className="font-titulo text-lg font-semibold">Primero registra a tu mascota</p>
            <p className="text-sm text-cafe-suave">La cartilla se guarda en la ficha de tu mascota.</p>
            <BotonPrincipal to="/mascotas/nueva" className="md:w-fit">
              Registrar a mi mascota
            </BotonPrincipal>
          </div>
        )}
      </div>
    </div>
  )
}
