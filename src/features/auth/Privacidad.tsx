import DocumentoEditorial from '../politicas/DocumentoEditorial'
import type { Seccion } from '../politicas/DocumentoEditorial'

// El texto de cada sección es el del borrador que entregó el equipo: aquí solo cambia la forma de
// presentarlo. Sigue pendiente de revisión legal conforme a la LFPDPPP.
const secciones: Seccion[] = [
  {
    id: 'quienes-somos',
    titulo: 'Quiénes somos',
    bloques: [
      {
        tipo: 'p',
        texto:
          'Manchitas es un proyecto comunitario del equipo 2ISI de la Universidad de Sonora, para promover la tenencia responsable de mascotas en Hermosillo, Sonora. Domicilio y correo de contacto del responsable: [por definir].',
      },
    ],
  },
  {
    id: 'que-datos-pedimos',
    titulo: 'Qué datos pedimos',
    bloques: [
      {
        tipo: 'p',
        texto:
          'Tu nombre, apellido, número de WhatsApp y correo electrónico; los datos y fotos de tu mascota; su cartilla de vacunación; y, si haces un reporte, la ubicación y la evidencia que adjuntes.',
      },
    ],
  },
  {
    id: 'para-que-los-usamos',
    titulo: 'Para qué los usamos',
    bloques: [
      {
        tipo: 'p',
        texto:
          'Para identificar a tu mascota con un folio y un código QR, permitir que quien la encuentre te contacte, recordarte vacunas y campañas, y canalizar los reportes de maltrato a la autoridad competente.',
      },
    ],
  },
  {
    id: 'que-se-muestra-en-publico',
    titulo: 'Qué se muestra en público',
    bloques: [
      {
        tipo: 'p',
        texto:
          'Al escanear el QR o escribir el folio exacto se ve el nombre de tu mascota, sus señas y, como máximo, un apellido tuyo.',
      },
      {
        tipo: 'destacado',
        titulo: 'Tu teléfono no se muestra',
        texto: 'Tu teléfono nunca se muestra en pantalla: el contacto se hace con un botón de WhatsApp.',
      },
    ],
  },
  {
    id: 'tus-derechos',
    titulo: 'Tus derechos',
    acordeon: true,
    bloques: [
      {
        tipo: 'p',
        texto:
          'Puedes acceder a tus datos, rectificarlos, cancelarlos u oponerte a su uso (derechos ARCO) escribiendo al contacto del responsable. Tu registro y tu código QR son gratuitos.',
      },
    ],
  },
  {
    id: 'como-protegemos-tus-datos',
    titulo: 'Cómo protegemos tus datos',
    acordeon: true,
    bloques: [
      {
        tipo: 'p',
        texto:
          'Tus datos se almacenan cifrados y con control de acceso por fila, de modo que cada persona solo ve la información que le corresponde. No vendemos tus datos.',
      },
    ],
  },
  {
    id: 'cambios',
    titulo: 'Cambios a este aviso',
    acordeon: true,
    bloques: [{ tipo: 'p', texto: 'Si el aviso cambia, lo publicaremos aquí antes de que entre en vigor.' }],
  },
]

export default function Privacidad() {
  return (
    <DocumentoEditorial
      titulo="Aviso de privacidad"
      descripcion="Qué datos recibimos, para qué los usamos, qué se ve en público y cómo ejercer tus derechos."
      actualizado="noviembre de 2026"
      borrador="Este texto aún no es el aviso de privacidad definitivo conforme a la LFPDPPP: falta la revisión de un abogado y definir el domicilio y el correo del responsable."
      secciones={secciones}
      fuentes={[
        {
          texto:
            'Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), versión vigente desde marzo de 2025. Autoridad: Secretaría Anticorrupción y Buen Gobierno.',
        },
      ]}
    />
  )
}
