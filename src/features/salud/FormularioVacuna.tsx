import { CalendarClock, Info, Stethoscope, Syringe } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import BotonSecundario from '../../components/ui/BotonSecundario'
import CampoLista from '../../components/ui/CampoLista'
import CampoTexto from '../../components/ui/CampoTexto'
import MensajeError from '../../components/ui/MensajeError'
import { hoyISO } from '../../lib/edad'
import {
  validarFechaProxima,
  validarFechaVacuna,
  validarOtraVacuna,
  validarVacuna,
  validarVeterinaria,
} from '../../lib/validaciones'
import type { DatosVacuna } from '../../types/cartilla'
import type { Especie } from '../../types/mascota'
import { useCampos } from '../auth/useCampos'
import type { Reglas } from '../auth/useCampos'

type Valores = {
  vacuna: string
  otra: string
  fecha: string
  veterinaria: string
  proxima: string
}

const OTRA = 'otra'
// Opciones de la lista según la especie; siempre queda "Otra" para escribir el nombre.
const VACUNAS_COMUNES: Record<Especie, string[]> = {
  perro: ['Puppy (parvovirus y moquillo)', 'Séxtuple (múltiple)', 'Antirrábica', 'Bordetella (tos de las perreras)', 'Leptospirosis'],
  gato: ['Triple felina (panleucopenia, rinotraqueítis y calicivirus)', 'Leucemia felina', 'Antirrábica'],
}

type Props = {
  especie: Especie
  /** Fecha de nacimiento de la mascota ("AAAA" o "AAAA-MM-DD"), para no aceptar fechas anteriores. */
  nacimiento: string
  onGuardar: (datos: DatosVacuna) => Promise<void>
  onCancelar: () => void
}

function Bloque({ icono, titulo, children }: { icono: ReactNode; titulo: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-2xl border border-borde-calido p-4">
      <legend className="flex items-center gap-2 px-1 text-sm font-semibold text-cafe">
        <span className="text-salud-trazo">{icono}</span>
        {titulo}
      </legend>
      {children}
    </fieldset>
  )
}

// Mismo formulario y validaciones de siempre, en bloques. La base solo guarda vacunas (nombre, fecha,
// veterinaria y la próxima dosis): los demás tipos de atención requieren ampliar el esquema.
export default function FormularioVacuna({ especie, nacimiento, onGuardar, onCancelar }: Props) {
  const [hoy] = useState(() => new Date())
  const [guardando, setGuardando] = useState(false)
  const [errorGuardar, setErrorGuardar] = useState<string>()
  const primerCampo = useRef<HTMLDivElement>(null)

  const reglas: Reglas<Valores> = {
    vacuna: validarVacuna,
    otra: (v, todos) => (todos.vacuna === OTRA ? validarOtraVacuna(v) : null),
    fecha: (v) => validarFechaVacuna(v, nacimiento, hoy),
    veterinaria: validarVeterinaria,
    proxima: (v, todos) => validarFechaProxima(v, todos.fecha, hoy),
  }
  const { valores, campo, validar } = useCampos<Valores>(
    { vacuna: '', otra: '', fecha: '', veterinaria: '', proxima: '' },
    reglas,
  )

  // Al abrir el formulario, el foco pasa al primer campo.
  useEffect(() => {
    primerCampo.current?.querySelector('select')?.focus()
  }, [])

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const primero = validar(['vacuna', 'otra', 'fecha', 'veterinaria', 'proxima'])
    if (primero) {
      ;(e.currentTarget.elements.namedItem(primero) as HTMLElement | null)?.focus()
      return
    }
    setGuardando(true)
    setErrorGuardar(undefined)
    try {
      await onGuardar({
        nombre: valores.vacuna === OTRA ? valores.otra.trim() : valores.vacuna,
        fecha: valores.fecha,
        veterinaria: valores.veterinaria.trim() || undefined,
        proximaFecha: valores.proxima || undefined,
      })
    } catch (error) {
      setErrorGuardar(error instanceof Error ? error.message : 'No pudimos guardar la vacuna.')
      setGuardando(false)
    }
  }

  return (
    <form noValidate onSubmit={enviar} aria-label="Registrar atención" className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-semibold text-cafe">Tipo de atención</p>
        <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[13px] text-cafe-suave">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-menta-suave px-3 py-1.5 text-sm font-semibold text-salud-trazo">
            <Syringe aria-hidden="true" size={15} />
            Vacunación
          </span>
          Por ahora la cartilla registra vacunas.
        </p>
        <p className="mt-1 text-xs text-cafe-suave">Los campos con * son obligatorios.</p>
      </div>

      <Bloque icono={<Syringe aria-hidden="true" size={17} />} titulo="Vacuna aplicada">
        <div ref={primerCampo}>
          <CampoLista label="Vacuna *" required {...campo('vacuna')}>
            <option value="">Elige la vacuna</option>
            {VACUNAS_COMUNES[especie].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
            <option value={OTRA}>Otra</option>
          </CampoLista>
        </div>
        {valores.vacuna === OTRA && (
          <CampoTexto label="Nombre de la vacuna *" autoComplete="off" required {...campo('otra')} />
        )}
        <CampoTexto label="Fecha de aplicación *" type="date" max={hoyISO(hoy)} autoComplete="off" required {...campo('fecha')} />
      </Bloque>

      <Bloque icono={<Stethoscope aria-hidden="true" size={17} />} titulo="Dónde se aplicó">
        <CampoTexto label="Veterinaria (opcional)" autoComplete="off" enterKeyHint="next" {...campo('veterinaria')} />
      </Bloque>

      <Bloque icono={<CalendarClock aria-hidden="true" size={17} />} titulo="Próximo cuidado">
        <CampoTexto
          label="Próxima dosis (opcional)"
          ayuda="Usa la fecha que te indicó tu veterinario. La guardamos como tu próximo cuidado."
          type="date"
          min={hoyISO(hoy)}
          autoComplete="off"
          {...campo('proxima')}
        />
      </Bloque>

      <p className="flex items-start gap-2 text-[13px] text-cafe-suave">
        <Info aria-hidden="true" size={15} className="mt-0.5 shrink-0" />
        El registro queda como «Registrado por ti». Para respaldarlo, guarda la foto de la cartilla en Mis documentos.
      </p>

      {errorGuardar && <MensajeError id="error-vacuna">{errorGuardar}</MensajeError>}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <BotonSecundario onClick={onCancelar} className="sm:w-auto">
          Cancelar
        </BotonSecundario>
        <BotonPrincipal type="submit" disabled={guardando} className="sm:w-auto">
          {guardando ? 'Guardando…' : 'Guardar registro'}
        </BotonPrincipal>
      </div>
    </form>
  )
}
