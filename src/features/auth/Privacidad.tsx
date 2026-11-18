import { CircleAlert } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import EncabezadoCurvo from '../../components/ui/EncabezadoCurvo'
import Tarjeta from '../../components/ui/Tarjeta'

const secciones = [
  {
    titulo: 'Quiénes somos',
    texto:
      'Manchitas es un proyecto comunitario del equipo 2ISI de la Universidad de Sonora, para promover la tenencia responsable de mascotas en Hermosillo, Sonora. Domicilio y correo de contacto del responsable: [por definir].',
  },
  {
    titulo: 'Qué datos pedimos',
    texto:
      'Tu nombre, apellido, número de WhatsApp y correo electrónico; los datos y fotos de tu mascota; su cartilla de vacunación; y, si haces un reporte, la ubicación y la evidencia que adjuntes.',
  },
  {
    titulo: 'Para qué los usamos',
    texto:
      'Para identificar a tu mascota con un folio y un código QR, permitir que quien la encuentre te contacte, recordarte vacunas y campañas, y canalizar los reportes de maltrato a la autoridad competente.',
  },
  {
    titulo: 'Qué se muestra en público',
    texto:
      'Al escanear el QR o escribir el folio exacto se ve el nombre de tu mascota, sus señas y, como máximo, un apellido tuyo. Tu teléfono nunca se muestra en pantalla: el contacto se hace con un botón de WhatsApp.',
  },
  {
    titulo: 'Tus derechos',
    texto:
      'Puedes acceder a tus datos, rectificarlos, cancelarlos u oponerte a su uso (derechos ARCO) escribiendo al contacto del responsable. Tu registro y tu código QR son gratuitos.',
  },
  {
    titulo: 'Cómo protegemos tus datos',
    texto:
      'Tus datos se almacenan cifrados y con control de acceso por fila, de modo que cada persona solo ve la información que le corresponde. No vendemos tus datos.',
  },
  {
    titulo: 'Cambios a este aviso',
    texto: 'Si el aviso cambia, lo publicaremos aquí antes de que entre en vigor.',
  },
]

export default function Privacidad() {
  // Se abre desde el registro o desde el reporte ciudadano: el botón de regreso vuelve al origen.
  const [params] = useSearchParams()
  const atras = params.get('desde') === 'reportar' ? '/reportar' : '/registro'
  return (
    <>
      <EncabezadoCurvo titulo="Aviso de privacidad" atras={atras} />
      <main className="flex flex-col gap-4 px-5 pb-10 pt-6">
        <Tarjeta className="flex items-start gap-3 bg-aviso-fondo p-4 text-sm">
          <CircleAlert aria-hidden="true" size={20} className="mt-0.5 shrink-0 text-naranja-sombra" />
          <p>
            <strong>Borrador pendiente de revisión legal.</strong> Este texto aún no es el aviso de
            privacidad definitivo conforme a la LFPDPPP.
          </p>
        </Tarjeta>

        {secciones.map(({ titulo, texto }) => (
          <section key={titulo}>
            <h2 className="font-titulo text-base font-semibold">{titulo}</h2>
            <p className="mt-1 text-sm text-cafe-suave">{texto}</p>
          </section>
        ))}
      </main>
    </>
  )
}
