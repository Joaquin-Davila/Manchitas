import { ArrowRight, CircleAlert, Heart, Plus, QrCode, ShieldCheck, Syringe } from 'lucide-react'
import { Link } from 'react-router-dom'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import { clasesBotonSecundario } from '../../components/ui/BotonSecundario'
import Huella from '../../components/ui/Huella'
import { plural, textoEdad } from '../../lib/edad'
import { NOMBRE_ESPECIE } from '../../lib/especies'
import type { Mascota } from '../../types/mascota'
import { Aparecer, HuellasDecorativas, clasesElevar, clasesFoco, clasesTarjeta } from './inicio/comun'
import MenuMascota from './MenuMascota'
import ModalQR from './ModalQR'
import { useMascotas } from './useMascotas'


/** Folio y token los asigna el servidor al registrar; sin ellos no hay QR que mostrar. */
const identificada = (m: Mascota) => !!m.folio && !!m.token

function Encabezado({ total, conBoton }: { total?: number; conBoton: boolean }) {
  return (
    <Aparecer className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="flex items-center gap-2 font-titulo text-[26px] font-bold leading-tight text-cafe md:text-[32px]">
          Mis mascotas
          <Huella aria-hidden="true" size={28} relleno />
        </h2>
        <p className="mt-1 text-[15px] text-cafe-suave md:text-base">Todos sus cuidados y aventuras en un solo lugar.</p>
        {total !== undefined && total > 0 && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-borde-calido bg-white px-3 py-1 text-[13px] font-semibold text-cafe">
            <Heart aria-hidden="true" size={14} className="fill-coral-medio text-coral-medio" />
            {plural(total, 'compañero registrado', 'compañeros registrados')}
          </p>
        )}
      </div>
      {conBoton && (
        <BotonPrincipal to="/mascotas/nueva" className="gap-2 md:w-fit md:shrink-0">
          <Plus aria-hidden="true" size={20} />
          Registrar mascota
        </BotonPrincipal>
      )}
    </Aparecer>
  )
}

function TarjetaPerfil({ mascota, indice }: { mascota: Mascota; indice: number }) {
  const ok = identificada(mascota)
  const detalle = [mascota.raza, textoEdad(mascota.nacimiento, undefined, mascota.especie)].filter(Boolean).join(' · ')

  return (
    <Aparecer como="li" retraso={80 + indice * 70} className="min-w-0">
      <article
        aria-labelledby={`nombre-${mascota.id}`}
        className={`group flex h-full flex-col ${clasesTarjeta} ${clasesElevar}`}
      >
        {/* Solo la foto recorta: el menú de opciones debe poder salir de la tarjeta. */}
        <Link
          to={`/mascotas/${mascota.id}`}
          tabIndex={-1}
          aria-hidden="true"
          className="relative block overflow-hidden rounded-t-[23px]"
        >
          {mascota.fotoUrl ? (
            <img
              src={mascota.fotoUrl}
              alt=""
              loading={indice > 2 ? 'lazy' : undefined}
              className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.04]"
            />
          ) : (
            <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-foto-vacia text-huella">
              <HuellasDecorativas
                className="text-huella/70"
                huellas={[
                  { top: '12%', left: '10%', size: 34, giro: -20 },
                  { bottom: '14%', right: '12%', size: 44, giro: 18, retraso: 1000 },
                ]}
              />
              <span className="relative flex size-28 items-center justify-center rounded-full bg-crema-clara/80">
                <Huella size={60} relleno />
              </span>
            </div>
          )}
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-cafe shadow-suave">
            <Huella size={13} relleno />
            {NOMBRE_ESPECIE[mascota.especie]}
          </span>
        </Link>

        <div className="flex flex-1 flex-col gap-4 p-5">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 id={`nombre-${mascota.id}`} className="min-w-0 truncate font-titulo text-[26px] font-bold leading-tight text-cafe">
                {mascota.nombre}
              </h3>
              {ok ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-menta-suave px-2.5 py-1 text-xs font-semibold text-salud-trazo">
                  <ShieldCheck aria-hidden="true" size={14} />
                  Identificado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-aviso-fondo px-2.5 py-1 text-xs font-semibold text-naranja-sombra">
                  <CircleAlert aria-hidden="true" size={14} />
                  Pendiente de identificación
                </span>
              )}
            </div>
            <p className="mt-1 text-[15px] text-cafe-suave">{detalle}</p>
          </div>

          {ok && (
            <section
              aria-label={`Identificación Manchitas de ${mascota.nombre}`}
              className="flex flex-col gap-2.5 rounded-2xl border border-borde-calido bg-crema-clara p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                <p className="text-xs font-semibold text-cafe-suave">Identificación Manchitas</p>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-salud-trazo">
                  <span aria-hidden="true" className="size-2 rounded-full bg-salud-trazo" />
                  Identificación activa
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="min-w-0 flex-1 whitespace-nowrap rounded-xl bg-menta-suave px-3 py-2.5 font-titulo text-[17px] font-bold tracking-wide text-salud-trazo">
                  <span className="sr-only">Folio </span>
                  {mascota.folio}
                </p>
                <ModalQR
                  mascota={mascota}
                  className={`flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-white px-3.5 text-sm font-semibold text-cafe shadow-tarjeta transition-colors hover:bg-amarillo-suave ${clasesFoco}`}
                />
              </div>
            </section>
          )}

          <div className="mt-auto flex items-center gap-2.5">
            <Link to={`/mascotas/${mascota.id}`} className={`${clasesBotonSecundario} flex-1 gap-2`}>
              Ver perfil
              <ArrowRight aria-hidden="true" size={18} className="transition-transform motion-safe:group-hover:translate-x-1" />
            </Link>
            <MenuMascota mascota={mascota} />
          </div>
        </div>
      </article>
    </Aparecer>
  )
}

function TarjetaAgregar({ indice }: { indice: number }) {
  return (
    <Aparecer como="li" retraso={80 + indice * 70} className="min-w-0">
      <Link
        to="/mascotas/nueva"
        className={`group flex h-full min-h-[220px] flex-col items-center justify-center gap-3 rounded-[24px] border-2 border-dashed border-amarillo-borde bg-crema-clara p-6 text-center transition-colors hover:bg-amarillo-suave ${clasesFoco}`}
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-white text-naranja shadow-suave transition-transform motion-safe:group-hover:scale-110">
          <Plus aria-hidden="true" size={28} />
        </span>
        <span className="font-titulo text-lg font-bold text-cafe">Registrar otra mascota</span>
        <span className="max-w-[240px] text-sm text-cafe-suave">Cada compañero recibe su propio folio y código QR.</span>
      </Link>
    </Aparecer>
  )
}

function SinMascotas() {
  const herramientas = [
    { icono: QrCode, texto: 'ID de collar y código QR', color: 'bg-amarillo-suave text-cafe' },
    { icono: Syringe, texto: 'Cartilla digital de vacunas', color: 'bg-menta-suave text-salud-trazo' },
    { icono: Heart, texto: 'Campañas y beneficios cerca de ti', color: 'bg-coral-suave text-naranja' },
  ]
  return (
    <Aparecer retraso={80}>
      <div className={`grid grid-cols-1 overflow-hidden md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] ${clasesTarjeta}`}>
        <div className="relative min-h-[240px] overflow-hidden bg-amarillo-suave">
          <img src="/img/bienvenida.webp" alt="Un perro y un gato juntos" className="absolute inset-0 size-full object-cover" />
          <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-cafe">
            Foto de ejemplo
          </span>
        </div>
        <div className="relative flex flex-col gap-4 p-6 md:p-9">
          <HuellasDecorativas
            className="text-huella/70"
            huellas={[
              { top: '14px', right: '18px', size: 56, giro: 20 },
              { bottom: '18px', right: '30%', size: 30, giro: -16, retraso: 1400 },
            ]}
          />
          <h3 className="relative font-titulo text-2xl font-bold leading-tight text-cafe md:text-[28px]">
            ¡Tu historia con Manchitas comienza aquí!
          </h3>
          <p className="relative text-[15px] text-cafe-suave">
            Registra a tu compañero y descubre todas las herramientas que tenemos para cuidar de él.
          </p>
          <ul className="relative m-0 flex list-none flex-col gap-2 p-0">
            {herramientas.map(({ icono: Icono, texto, color }) => (
              <li key={texto} className="flex items-center gap-3 text-sm font-semibold text-cafe">
                <span className={`flex size-9 items-center justify-center rounded-xl ${color}`}>
                  <Icono aria-hidden="true" size={18} />
                </span>
                {texto}
              </li>
            ))}
          </ul>
          <BotonPrincipal to="/mascotas/nueva" className="relative mt-2 gap-2 md:w-fit">
            <Plus aria-hidden="true" size={20} />
            Registrar mi primera mascota
          </BotonPrincipal>
        </div>
      </div>
    </Aparecer>
  )
}

export default function ListaMascotas() {
  const { mascotas, cargando, error } = useMascotas()
  const conMascotas = !cargando && !error && mascotas.length > 0

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <Encabezado total={cargando || error ? undefined : mascotas.length} conBoton={conMascotas} />

      {cargando ? (
        <ul aria-hidden="true" className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {[0, 1, 2].map((i) => (
            <li key={i} className={`overflow-hidden ${clasesTarjeta}`}>
              <div className="aspect-[4/3] animate-pulse bg-foto-vacia/60" />
              <div className="flex flex-col gap-3 p-5">
                <div className="h-7 w-1/2 animate-pulse rounded-full bg-crema" />
                <div className="h-4 w-2/3 animate-pulse rounded-full bg-crema" />
                <div className="h-[72px] animate-pulse rounded-2xl bg-crema-clara" />
              </div>
            </li>
          ))}
        </ul>
      ) : error ? (
        <div className={`p-5 ${clasesTarjeta}`}>
          <p role="alert" className="text-sm">
            No pudimos cargar a tus mascotas. Revisa tu conexión e inténtalo de nuevo.
          </p>
        </div>
      ) : mascotas.length === 0 ? (
        <SinMascotas />
      ) : (
        <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {mascotas.map((m, i) => (
            <TarjetaPerfil key={m.id} mascota={m} indice={i} />
          ))}
          <TarjetaAgregar indice={mascotas.length} />
        </ul>
      )}
    </div>
  )
}
