import BotonPrincipal from '../../components/ui/BotonPrincipal'
import DocumentoEditorial from '../politicas/DocumentoEditorial'
import type { Seccion } from '../politicas/DocumentoEditorial'

// Resumen orientativo, sin números de artículo ni montos: falta cotejarlo con el texto oficial.
// Los puntos son los del borrador que entregó el equipo; aquí solo cambia la forma de presentarlos.
// No se agrega ninguna obligación, derecho o sanción que no esté en ese borrador.
const secciones: Seccion[] = [
  {
    id: 'obligaciones',
    titulo: 'Obligaciones de quien tiene un perro',
    bloques: [
      {
        tipo: 'lista',
        items: [
          'Darle alimento, agua limpia, sombra y un lugar seguro donde descansar.',
          'Llevarlo al veterinario y mantener al día sus vacunas, en especial la antirrábica.',
          'Identificarlo (por ejemplo, con un ID de collar y un QR) y no dejar que ande suelto en la calle.',
          'Recoger sus heces cuando salga a pasear.',
          'No abandonarlo, no maltratarlo y no mantenerlo atado o encerrado de forma permanente.',
        ],
      },
    ],
  },
  {
    id: 'prevencion',
    titulo: 'Prevención',
    bloques: [
      {
        tipo: 'lista',
        items: [
          'Esterilizar a tu mascota ayuda a evitar camadas que terminan en la calle.',
          'Las jornadas de vacunación y esterilización son una forma accesible de cumplir.',
          'Si no puedes seguir cuidando a un animal, busca una adopción responsable en lugar de abandonarlo.',
        ],
      },
    ],
  },
  {
    id: 'sanciones',
    titulo: 'Sanciones',
    bloques: [
      {
        tipo: 'lista',
        items: [
          'Incumplir las obligaciones o maltratar a un animal puede traer amonestaciones, multas y el aseguramiento del animal.',
          'Los casos graves de crueldad pueden pasar a otras autoridades.',
          'Los supuestos y los montos exactos los define el reglamento oficial vigente.',
        ],
      },
    ],
  },
  {
    id: 'como-denunciar',
    titulo: 'Cómo denunciar',
    bloques: [
      {
        tipo: 'lista',
        items: [
          'Con Manchitas puedes enviar un reporte sin cuenta y recibir un folio de seguimiento.',
          'Manchitas canaliza tu reporte, pero no sustituye a la autoridad. Si hay una emergencia, llama al 911.',
        ],
      },
    ],
  },
  {
    id: 'pendiente',
    titulo: 'Lo que falta incorporar',
    acordeon: true,
    bloques: [
      {
        tipo: 'destacado',
        titulo: 'Texto oficial pendiente',
        texto:
          'Esta página es un resumen general. Todavía no incorporamos el texto oficial íntegro del reglamento. No lo sustituye y no debe usarse para interpretar derechos, obligaciones ni sanciones.',
      },
      {
        tipo: 'lista',
        items: [
          'El texto oficial vigente del Reglamento de Protección y Bienestar Animal de Hermosillo, con su numeración de artículos.',
          'Los supuestos y los montos de las sanciones.',
          'La fecha y el medio de publicación oficial.',
        ],
      },
    ],
  },
]

export default function Reglamento() {
  return (
    <DocumentoEditorial
      titulo="Reglamento de Protección y Bienestar Animal"
      descripcion="Resumen de lo que debes saber como tutor y cómo denunciar un maltrato en Hermosillo."
      actualizado="noviembre de 2026"
      borrador="Es un resumen general que aún no se coteja con el texto oficial vigente de Hermosillo y no lo sustituye."
      secciones={secciones}
      fuentes={[
        {
          texto:
            'Reglamento de Protección y Bienestar Animal de Hermosillo, Sonora (texto oficial vigente): pendiente de incorporar al repositorio.',
        },
        { texto: 'Instituto Municipal de Protección y Bienestar Animal de Hermosillo.' },
      ]}
      pie={<BotonPrincipal to="/reportar">Hacer un reporte</BotonPrincipal>}
    />
  )
}
