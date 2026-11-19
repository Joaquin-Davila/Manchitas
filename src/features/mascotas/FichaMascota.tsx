import { ArrowLeft, CircleCheck, Download, Pencil, Printer } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import { clasesBotonSecundario } from '../../components/ui/BotonSecundario'
import Tarjeta from '../../components/ui/Tarjeta'
import TarjetaMascota from '../../components/ui/TarjetaMascota'
import { textoEdad } from '../../lib/edad'
import { obtenerMascota } from '../../lib/mascotas'
import { generarQR, urlPerfilPublico } from '../../lib/qr'
import type { Mascota } from '../../types/mascota'
import { useSesion } from '../auth/contextoSesion'
import EtiquetaCollar from './EtiquetaCollar'

// `undefined` = cargando; `null` = no existe o no es de esta cuenta.
type Estado = Mascota | null | undefined

export default function FichaMascota() {
  const { id } = useParams()
  const { sesion } = useSesion()
  const location = useLocation()
  const estadoNav = location.state as { nueva?: boolean; editada?: boolean } | null
  const recienRegistrada = estadoNav?.nueva === true
  const recienEditada = estadoNav?.editada === true
  const [mascota, setMascota] = useState<Estado>(undefined)
  const [qr, setQr] = useState<string | null>(null)

  const correo = sesion?.correo
  useEffect(() => {
    if (!id || !correo) return
    let vigente = true
    obtenerMascota(id, correo)
      .then((encontrada) => {
        if (vigente) setMascota(encontrada)
      })
      .catch(() => {
        if (vigente) setMascota(null)
      })
    return () => {
      vigente = false
    }
  }, [id, correo])

  const token = mascota?.token
  useEffect(() => {
    if (!token) return
    let vigente = true
    generarQR(urlPerfilPublico(token)).then((imagen) => {
      if (vigente) setQr(imagen)
    })
    return () => {
      vigente = false
    }
  }, [token])

  // El menú y el modal del QR enlazan a #etiqueta: se baja a ella cuando ya hay ficha.
  const conFicha = !!mascota
  const ancla = location.hash
  useEffect(() => {
    if (conFicha && ancla === '#etiqueta') document.getElementById('etiqueta')?.scrollIntoView({ block: 'center' })
  }, [conFicha, ancla])

  if (mascota === undefined) return null

  if (mascota === null) {
    return (
      <Tarjeta className="flex flex-col items-start gap-3 p-5">
        <h2 className="font-titulo text-lg font-semibold">No encontramos a esa mascota</h2>
        <p className="text-sm text-cafe-suave">Puede que el enlace sea incorrecto o que no sea de tu cuenta.</p>
        <Link to="/mascotas" className="min-h-11 py-2 font-semibold text-naranja-sombra underline">
          Ver mis mascotas
        </Link>
      </Tarjeta>
    )
  }

  // Al imprimir solo debe salir la etiqueta: todo lo demás lleva `print:hidden`.
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 print:hidden">
        <Link to="/mascotas" className="flex min-h-11 w-fit items-center gap-2 text-sm font-semibold text-naranja-sombra">
          <ArrowLeft aria-hidden="true" size={18} />
          Mis mascotas
        </Link>
        <Link
          to={`/mascotas/${mascota.id}/editar`}
          className="flex min-h-11 items-center gap-2 rounded-full border-2 border-barra-borde bg-white px-4 text-sm font-semibold text-cafe hover:bg-amarillo-suave"
        >
          <Pencil aria-hidden="true" size={16} />
          Editar
        </Link>
      </div>

      {recienRegistrada && (
        <Tarjeta
          role="status"
          className="flex items-center gap-3 bg-salud-fondo p-4 text-sm font-semibold text-salud-trazo shadow-none print:hidden"
        >
          <CircleCheck aria-hidden="true" size={22} className="shrink-0" />
          ¡Listo! {mascota.nombre} ya tiene su ID de collar y su QR.
        </Tarjeta>
      )}
      {recienEditada && (
        <Tarjeta
          role="status"
          className="flex items-center gap-3 bg-salud-fondo p-4 text-sm font-semibold text-salud-trazo shadow-none print:hidden"
        >
          <CircleCheck aria-hidden="true" size={22} className="shrink-0" />
          Guardamos los cambios de {mascota.nombre}. Su folio y su QR siguen iguales.
        </Tarjeta>
      )}

      <div className="print:hidden">
        <TarjetaMascota nombre={mascota.nombre} folio={mascota.folio} fotoUrl={mascota.fotoUrl} />
      </div>

      <Tarjeta className="flex flex-col gap-3 p-4 print:hidden">
        <h2 className="font-titulo text-base font-semibold">Datos de su ficha</h2>
        <dl className="m-0 flex flex-col gap-2 text-sm">
          <div>
            <dt className="text-[13px] font-semibold text-cafe-suave">Raza y edad</dt>
            <dd className="m-0">
              {mascota.raza} · {textoEdad(mascota.nacimiento, undefined, mascota.especie)}
            </dd>
          </div>
          {mascota.senas && (
            <div>
              <dt className="text-[13px] font-semibold text-cafe-suave">Señas</dt>
              <dd className="m-0">{mascota.senas}</dd>
            </div>
          )}
          {mascota.nota && (
            <div>
              <dt className="text-[13px] font-semibold text-cafe-suave">Nota para quien lo encuentre</dt>
              <dd className="m-0">{mascota.nota}</dd>
            </div>
          )}
        </dl>
      </Tarjeta>

      <Tarjeta className="flex flex-col items-center gap-3 p-4 text-center print:hidden">
        <h2 className="font-titulo text-base font-semibold">ID de collar y QR</h2>
        {qr ? (
          <img
            src={qr}
            alt={`Código QR de ${mascota.nombre}`}
            width={192}
            height={192}
            className="size-48"
          />
        ) : (
          <div role="status" className="flex size-48 items-center justify-center text-sm text-cafe-suave">
            Generando QR…
          </div>
        )}
        <p className="font-titulo text-2xl font-bold">{mascota.folio}</p>
        <p className="text-[13px] text-cafe-suave">
          Quien escanee el QR o escriba este ID verá la ficha de {mascota.nombre} y podrá avisarte por
          WhatsApp.
        </p>
      </Tarjeta>

      <section id="etiqueta" aria-labelledby="titulo-etiqueta" className="flex scroll-mt-6 flex-col items-center gap-3">
        <h2 id="titulo-etiqueta" className="font-titulo text-base font-semibold print:hidden">
          Etiqueta para el collar
        </h2>
        <EtiquetaCollar folio={mascota.folio} qr={qr} />
      </section>

      <div className="mt-1 flex flex-col gap-4 print:hidden">
        <BotonPrincipal onClick={() => window.print()} className="gap-2">
          <Printer aria-hidden="true" size={20} />
          Imprimir etiqueta
        </BotonPrincipal>
        {qr && (
          <a href={qr} download={`QR-${mascota.folio}.png`} className={`${clasesBotonSecundario} gap-2`}>
            <Download aria-hidden="true" size={20} />
            Descargar QR
          </a>
        )}
      </div>
    </div>
  )
}
