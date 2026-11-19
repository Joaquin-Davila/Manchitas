import { useState } from 'react'
import Huella from '../../components/ui/Huella'
import { hoyISO } from '../../lib/edad'
import { useSesion } from '../auth/contextoSesion'
import { useCartilla } from '../salud/useCartilla'
import ActividadComunitaria from './inicio/ActividadComunitaria'
import CadaHuella from './inicio/CadaHuella'
import ComunidadCerca from './inicio/ComunidadCerca'
import ExtraviadasInicio from './inicio/ExtraviadasInicio'
import Descubre from './inicio/Descubre'
import { HeroCargando, HeroMascota, HeroSinMascota } from './inicio/HeroMascota'
import Indicadores from './inicio/Indicadores'
import Patrocinado from './inicio/Patrocinado'
import PromocionesYAliados from './inicio/PromocionesYAliados'
import ResumenSalud from './inicio/ResumenSalud'
import { useInicioComunidad } from './inicio/useInicioComunidad'
import { Aparecer, clasesTarjeta } from './inicio/comun'
import { useMascotas } from './useMascotas'

const fechaLarga = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })

export default function Inicio() {
  const { sesion } = useSesion()
  const { mascotas, cargando, error } = useMascotas()
  const mascota = mascotas[0]
  const salud = useCartilla(mascota?.id)
  const [hoy] = useState(() => hoyISO())
  const comunidad = useInicioComunidad(hoy)
  const datos = comunidad.datos
  const [fechaHoy] = useState(() => {
    const texto = fechaLarga.format(new Date())
    return texto.charAt(0).toUpperCase() + texto.slice(1)
  })
  const nombre = sesion?.nombre?.trim()

  return (
    <div className="flex flex-col gap-7 md:gap-9">
      <Aparecer className="-mb-2 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <div>
          <h2 className="flex items-center gap-2 font-titulo text-[26px] font-bold leading-tight text-cafe md:text-[32px]">
            {nombre ? `¡Hola, ${nombre}!` : '¡Hola!'}
            <Huella aria-hidden="true" size={28} relleno />
          </h2>
          <p className="mt-1 text-[15px] text-cafe-suave md:text-base">
            Un nuevo día para cuidar a quienes más queremos.
          </p>
        </div>
        <p className="rounded-full border border-borde-calido bg-white px-3 py-1 text-[13px] font-semibold text-cafe-suave">
          {fechaHoy} · Hermosillo, Sonora
        </p>
      </Aparecer>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:gap-6">
        <Aparecer retraso={60}>
          {cargando ? (
            <HeroCargando />
          ) : error ? (
            <div className={`p-5 ${clasesTarjeta}`}>
              <p role="alert" className="text-sm">
                No pudimos cargar a tus mascotas. Revisa tu conexión e inténtalo de nuevo.
              </p>
            </div>
          ) : mascota ? (
            <HeroMascota mascotas={mascotas} />
          ) : (
            <HeroSinMascota />
          )}
        </Aparecer>
        <Aparecer retraso={140}>
          <ResumenSalud
            nombre={cargando || error ? undefined : mascota?.nombre}
            cartilla={salud.cartilla}
            cargando={salud.cargando}
            error={salud.error}
            hoy={hoy}
          />
        </Aparecer>
      </div>

      <Descubre />

      {datos && datos.anuncios.length > 0 && (
        <Aparecer retraso={260}>
          <Patrocinado anuncios={datos.anuncios} hoy={hoy} />
        </Aparecer>
      )}

      <Aparecer retraso={290}>
        <ExtraviadasInicio />
      </Aparecer>

      <Aparecer retraso={320}>
        <ComunidadCerca hoy={hoy} campanas={datos?.campanas ?? []} />
      </Aparecer>

      {datos && (
        <Aparecer retraso={360}>
          <ActividadComunitaria publicaciones={datos.publicaciones} adopciones={datos.adopciones} />
        </Aparecer>
      )}

      {datos?.indicadores && (
        <Aparecer retraso={400}>
          <Indicadores datos={datos.indicadores} />
        </Aparecer>
      )}

      {/* Promociones y aliados mejor calificados: salen del directorio de Supabase. */}
      <Aparecer retraso={380}>
        <PromocionesYAliados />
      </Aparecer>

      <Aparecer retraso={440}>
        <CadaHuella />
      </Aparecer>
    </div>
  )
}
