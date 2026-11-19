import DocumentoEditorial from './DocumentoEditorial'
import type { Seccion } from './DocumentoEditorial'

// Describe lo que la app hace realmente con el almacenamiento del navegador: no hay anuncios
// personalizados ni analítica. Si se agrega alguna herramienta de medición, hay que actualizar esto.
const secciones: Seccion[] = [
  {
    id: 'resumen',
    titulo: 'En pocas palabras',
    bloques: [
      {
        tipo: 'destacado',
        titulo: 'Sin rastreo publicitario',
        texto:
          'Manchitas no usa cookies de publicidad ni herramientas de analítica de terceros. Solo guarda en tu dispositivo lo necesario para que la app funcione.',
      },
    ],
  },
  {
    id: 'que-guardamos',
    titulo: 'Qué guardamos en tu dispositivo',
    bloques: [
      {
        tipo: 'lista',
        items: [
          'Tu sesión: para que no tengas que iniciar sesión cada vez. Se borra al cerrar sesión.',
          'La estructura de la aplicación, sus imágenes y los mosaicos del mapa que ya viste: para que abra más rápido y funcione sin conexión.',
          'Las fotos públicas de mascotas que abres. Se borran al cerrar sesión.',
        ],
      },
      {
        tipo: 'p',
        texto:
          'No se guardan para uso sin conexión tus mascotas, cartillas, reportes ni ninguna información privada.',
      },
    ],
  },
  {
    id: 'terceros',
    titulo: 'Servicios de terceros',
    acordeon: true,
    bloques: [
      {
        tipo: 'lista',
        items: [
          'Supabase: aloja la base de datos, la autenticación y los archivos de Manchitas.',
          'OpenStreetMap: sirve los mosaicos del mapa. Al verlo, ese servicio puede ver tu dirección IP.',
        ],
      },
    ],
  },
  {
    id: 'controlar',
    titulo: 'Cómo borrarlo',
    acordeon: true,
    bloques: [
      {
        tipo: 'p',
        texto:
          'Puedes borrar los datos del sitio desde la configuración de tu navegador. Si lo haces se cerrará tu sesión y la app tendrá que volver a descargarse.',
      },
    ],
  },
]

export default function Cookies() {
  return (
    <DocumentoEditorial
      titulo="Cookies y almacenamiento"
      descripcion="Qué guarda Manchitas en tu navegador y por qué."
      actualizado="noviembre de 2026"
      borrador="Describe el funcionamiento actual de la app; la revisión legal del aviso de privacidad debe confirmarlo."
      secciones={secciones}
    />
  )
}
