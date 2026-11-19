import { MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import EncabezadoCurvo from '../../components/ui/EncabezadoCurvo'
import Tarjeta from '../../components/ui/Tarjeta'
import TarjetaMascota from '../../components/ui/TarjetaMascota'
import { textoEdad } from '../../lib/edad'
import { perfilPorToken } from '../../lib/mascotas'
import type { PerfilPublico as Perfil } from '../../types/mascota'

// `undefined` = cargando; `null` = no existe. Sin barra inferior y sin cuenta.
export default function PerfilPublico() {
  const { token } = useParams()
  const [perfil, setPerfil] = useState<Perfil | null | undefined>(undefined)
  const [falloRed, setFalloRed] = useState(false)

  useEffect(() => {
    if (!token) return
    let vigente = true
    perfilPorToken(token)
      .then((p) => {
        if (vigente) setPerfil(p)
      })
      .catch(() => {
        // Un fallo de red no es una ficha inexistente: se avisa distinto.
        if (vigente) {
          setFalloRed(true)
          setPerfil(null)
        }
      })
    return () => {
      vigente = false
    }
  }, [token])

  return (
    <>
      {/* La ficha de una mascota no debe aparecer en buscadores. */}
      <meta name="robots" content="noindex" />
      <EncabezadoCurvo titulo="Ficha de la mascota" atras="/buscar" />
      <main className="flex flex-col gap-4 px-5 pb-10 pt-6">
        {perfil === undefined && (
          <p role="status" className="sr-only">
            Cargando…
          </p>
        )}

        {perfil === null && falloRed && (
          <Tarjeta className="flex flex-col items-start gap-3 p-5">
            <h2 className="font-titulo text-lg font-semibold">No pudimos cargar la ficha</h2>
            <p className="text-sm text-cafe-suave">
              Parece que no hay conexión. Revisa tu internet y vuelve a abrir el QR.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="min-h-11 py-2 font-semibold text-naranja-sombra underline"
            >
              Reintentar
            </button>
          </Tarjeta>
        )}

        {perfil === null && !falloRed && (
          <Tarjeta className="flex flex-col items-start gap-3 p-5">
            <h2 className="font-titulo text-lg font-semibold">No encontramos esta ficha</h2>
            <p className="text-sm text-cafe-suave">
              El código puede estar dañado o incompleto. Prueba escribiendo el ID de collar.
            </p>
            <Link to="/buscar" className="min-h-11 py-2 font-semibold text-naranja-sombra underline">
              Buscar por ID de collar
            </Link>
          </Tarjeta>
        )}

        {perfil && (
          <>
            <TarjetaMascota nombre={perfil.nombre} fotoUrl={perfil.fotoUrl} />

            <Tarjeta className="flex flex-col gap-3 p-4">
              <h2 className="font-titulo text-base font-semibold">Sobre {perfil.nombre}</h2>
              <dl className="m-0 flex flex-col gap-2 text-sm">
                <div>
                  <dt className="text-[13px] font-semibold text-cafe-suave">Raza y edad</dt>
                  <dd className="m-0">
                    {perfil.raza} · {textoEdad(perfil.nacimiento)}
                  </dd>
                </div>
                {perfil.senas && (
                  <div>
                    <dt className="text-[13px] font-semibold text-cafe-suave">Señas</dt>
                    <dd className="m-0">{perfil.senas}</dd>
                  </div>
                )}
                {perfil.nota && (
                  <div>
                    <dt className="text-[13px] font-semibold text-cafe-suave">Nota de su tutor</dt>
                    <dd className="m-0">{perfil.nota}</dd>
                  </div>
                )}
                {perfil.apellidoTutor && (
                  <div>
                    <dt className="text-[13px] font-semibold text-cafe-suave">Su familia</dt>
                    <dd className="m-0">{perfil.apellidoTutor}</dd>
                  </div>
                )}
              </dl>
            </Tarjeta>

            {perfil.enlaceWhatsApp ? (
              <div className="flex flex-col gap-2">
                <BotonPrincipal
                  to={perfil.enlaceWhatsApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  <MessageCircle aria-hidden="true" size={20} />
                  Contactar a mi dueño por WhatsApp
                  <span className="sr-only"> (se abre en otra pestaña)</span>
                </BotonPrincipal>
                <p className="text-center text-[13px] text-cafe-suave">
                  El teléfono no se muestra: el mensaje se envía por WhatsApp.
                </p>
              </div>
            ) : (
              <Tarjeta className="p-4 text-sm text-cafe-suave">
                Esta ficha todavía no tiene un contacto de WhatsApp registrado.
              </Tarjeta>
            )}
          </>
        )}
      </main>
    </>
  )
}
