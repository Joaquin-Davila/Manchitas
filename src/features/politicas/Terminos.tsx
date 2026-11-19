import DocumentoEditorial from './DocumentoEditorial'
import type { Seccion } from './DocumentoEditorial'

// Borrador de términos y condiciones. Solo describe lo que Manchitas hace hoy (reglas de producto
// de CLAUDE.md y lo que existe en la app). No incluye cláusulas legales como limitaciones de
// responsabilidad, jurisdicción o indemnizaciones: eso lo redacta un abogado.
const secciones: Seccion[] = [
  {
    id: 'que-es',
    titulo: 'Qué es Manchitas',
    bloques: [
      {
        tipo: 'p',
        texto:
          'Manchitas es una plataforma comunitaria de tenencia responsable de mascotas para Hermosillo, Sonora, hecha por el equipo 2ISI de la Universidad de Sonora. Ayuda a identificar a perros y gatos con un folio y un código QR, a llevar su cartilla de vacunación, a conocer campañas y adopciones y a enviar reportes de maltrato.',
      },
      {
        tipo: 'destacado',
        titulo: 'No sustituye a la autoridad',
        texto:
          'Los reportes de maltrato se canalizan a la autoridad competente. Si hay una emergencia, llama al 911.',
      },
    ],
  },
  {
    id: 'gratuito',
    titulo: 'Registro gratuito, sin suscripciones',
    bloques: [
      {
        tipo: 'p',
        texto:
          'Crear una cuenta, registrar a tu mascota y obtener su código QR digital no cuesta. Manchitas no cobra suscripciones a las personas que cuidan a sus mascotas.',
      },
    ],
  },
  {
    id: 'tu-cuenta',
    titulo: 'Tu cuenta',
    bloques: [
      {
        tipo: 'lista',
        items: [
          'Los datos que das al registrarte y al registrar a tu mascota deben ser verdaderos.',
          'Cuida tu contraseña: lo que se haga con tu cuenta se atribuye a ti.',
          'Elegir ser tutor, rescatista o ciudadano no da permisos especiales.',
        ],
      },
    ],
  },
  {
    id: 'uso-adecuado',
    titulo: 'Uso adecuado',
    acordeon: true,
    bloques: [
      { tipo: 'p', texto: 'Al usar Manchitas te comprometes a no:' },
      {
        tipo: 'lista',
        items: [
          'Enviar reportes falsos o con la intención de dañar a otra persona.',
          'Publicar datos privados de otras personas, como domicilios o teléfonos.',
          'Usar la plataforma para enviar mensajes no deseados.',
          'Intentar acceder a información de otras cuentas.',
        ],
      },
    ],
  },
  {
    id: 'ficha-publica',
    titulo: 'El código QR y la ficha pública',
    acordeon: true,
    bloques: [
      {
        tipo: 'p',
        texto:
          'Al escanear el QR o escribir el folio exacto se ve una ficha mínima de tu mascota: nombre, raza, edad aproximada, señas, una nota tuya y, como máximo, un apellido tuyo. Tu teléfono no se muestra: quien la encuentra te escribe con un botón de WhatsApp.',
      },
    ],
  },
  {
    id: 'comunidad-publicidad',
    titulo: 'Comunidad, publicidad y promociones',
    acordeon: true,
    bloques: [
      {
        tipo: 'p',
        texto:
          'El contenido patrocinado se identifica con la etiqueta «Patrocinado». Las promociones y cupones los define cada establecimiento aliado. Los establecimientos pagan una comisión solo cuando se canjea un cupón: las personas que los usan no pagan por ello a Manchitas.',
      },
    ],
  },
  {
    id: 'donaciones',
    titulo: 'Donaciones',
    acordeon: true,
    bloques: [
      {
        tipo: 'destacado',
        titulo: 'Modo de demostración',
        texto:
          'Manchitas Solidario está en modo de demostración: todavía no se procesan pagos ni se recibe dinero real, y las aportaciones de ejemplo no suman al monto recaudado.',
      },
    ],
  },
  {
    id: 'datos-demostracion',
    titulo: 'Datos de demostración',
    acordeon: true,
    bloques: [
      {
        tipo: 'p',
        texto:
          'Algunas publicaciones, establecimientos, adopciones y registros de cartilla son de ejemplo y están marcados como tales. No son certificados veterinarios ni establecimientos reales.',
      },
    ],
  },
  {
    id: 'contacto',
    titulo: 'Contacto y cambios',
    bloques: [
      {
        tipo: 'p',
        texto:
          'Domicilio y correo de contacto del responsable: [por definir]. Si estos términos cambian, los publicaremos aquí antes de que entren en vigor.',
      },
    ],
  },
]

export default function Terminos() {
  return (
    <DocumentoEditorial
      titulo="Términos y condiciones"
      descripcion="Las reglas básicas para usar Manchitas, explicadas sin enredos."
      actualizado="noviembre de 2026"
      borrador="Este texto describe cómo funciona hoy la plataforma. Aún no es el documento legal definitivo: falta la revisión de un abogado y definir el contacto del responsable."
      secciones={secciones}
    />
  )
}
