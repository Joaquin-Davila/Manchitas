import { CircleAlert } from 'lucide-react'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import EncabezadoCurvo from '../../components/ui/EncabezadoCurvo'
import Tarjeta from '../../components/ui/Tarjeta'
import { useRutaAtras } from './useRutaAtras'

// Resumen orientativo, sin números de artículo ni montos: falta cotejarlo con el texto oficial.
const secciones = [
  {
    titulo: 'Obligaciones de quien tiene un perro',
    puntos: [
      'Darle alimento, agua limpia, sombra y un lugar seguro donde descansar.',
      'Llevarlo al veterinario y mantener al día sus vacunas, en especial la antirrábica.',
      'Identificarlo (por ejemplo, con un ID de collar y un QR) y no dejar que ande suelto en la calle.',
      'Recoger sus heces cuando salga a pasear.',
      'No abandonarlo, no maltratarlo y no mantenerlo atado o encerrado de forma permanente.',
    ],
  },
  {
    titulo: 'Prevención',
    puntos: [
      'Esterilizar a tu mascota ayuda a evitar camadas que terminan en la calle.',
      'Las jornadas de vacunación y esterilización son una forma accesible de cumplir.',
      'Si no puedes seguir cuidando a un animal, busca una adopción responsable en lugar de abandonarlo.',
    ],
  },
  {
    titulo: 'Sanciones',
    puntos: [
      'Incumplir las obligaciones o maltratar a un animal puede traer amonestaciones, multas y el aseguramiento del animal.',
      'Los casos graves de crueldad pueden pasar a otras autoridades.',
      'Los supuestos y los montos exactos los define el reglamento oficial vigente.',
    ],
  },
  {
    titulo: 'Cómo denunciar',
    puntos: [
      'Con Manchitas puedes enviar un reporte sin cuenta y recibir un folio de seguimiento.',
      'Manchitas canaliza tu reporte, pero no sustituye a la autoridad. Si hay una emergencia, llama al 911.',
    ],
  },
]

export default function Reglamento() {
  const atras = useRutaAtras()
  return (
    <>
      <EncabezadoCurvo titulo="Reglamento" atras={atras} />
      <main className="flex flex-col gap-4 px-5 pb-10 pt-6">
        <Tarjeta className="flex items-start gap-3 bg-aviso-fondo p-4 text-sm">
          <CircleAlert aria-hidden="true" size={20} className="mt-0.5 shrink-0 text-naranja-sombra" />
          <p>
            <strong>Borrador pendiente de revisión.</strong> Es un resumen general del Reglamento de
            Protección y Bienestar Animal. Aún no se coteja con el texto oficial vigente de Hermosillo y no
            lo sustituye.
          </p>
        </Tarjeta>

        {secciones.map(({ titulo, puntos }) => (
          <section key={titulo}>
            <h2 className="font-titulo text-base font-semibold">{titulo}</h2>
            <ul className="mt-1 flex list-disc flex-col gap-1 pl-5 text-sm text-cafe-suave">
              {puntos.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </section>
        ))}

        <BotonPrincipal to="/reportar" className="mt-2">
          Hacer un reporte
        </BotonPrincipal>
      </main>
    </>
  )
}
