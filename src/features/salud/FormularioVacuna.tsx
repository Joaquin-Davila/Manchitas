import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import BotonSecundario from '../../components/ui/BotonSecundario'
import CampoLista from '../../components/ui/CampoLista'
import CampoTexto from '../../components/ui/CampoTexto'
import MensajeError from '../../components/ui/MensajeError'
import Tarjeta from '../../components/ui/Tarjeta'
import { hoyISO } from '../../lib/edad'
import {
  validarFechaProxima,
  validarFechaVacuna,
  validarOtraVacuna,
  validarVacuna,
  validarVeterinaria,
} from '../../lib/validaciones'
import type { DatosVacuna } from '../../types/cartilla'
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
const VACUNAS_COMUNES = [
  'Puppy (parvovirus y moquillo)',
  'Séxtuple (múltiple)',
  'Antirrábica',
  'Bordetella (tos de las perreras)',
  'Leptospirosis',
]

type Props = {
  /** Fecha de nacimiento de la mascota ("AAAA" o "AAAA-MM-DD"), para no aceptar fechas anteriores. */
  nacimiento: string
  onGuardar: (datos: DatosVacuna) => Promise<void>
  onCancelar: () => void
}

export default function FormularioVacuna({ nacimiento, onGuardar, onCancelar }: Props) {
  const [hoy] = useState(() => new Date())
  const [guardando, setGuardando] = useState(false)
  const [errorGuardar, setErrorGuardar] = useState<string>()
  const titulo = useRef<HTMLHeadingElement>(null)

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

  // Al abrir el formulario, el foco pasa a su título.
  useEffect(() => {
    titulo.current?.focus()
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
    <Tarjeta className="p-4">
      <form noValidate onSubmit={enviar} aria-labelledby="titulo-vacuna" className="flex flex-col gap-5">
        <div>
          <h3
            id="titulo-vacuna"
            ref={titulo}
            tabIndex={-1}
            className="font-titulo text-base font-semibold outline-none"
          >
            Registrar vacuna aplicada
          </h3>
          <p className="text-[13px] text-cafe-suave">Los campos con * son obligatorios.</p>
        </div>

        <CampoLista label="Vacuna *" required {...campo('vacuna')}>
          <option value="">Elige la vacuna</option>
          {VACUNAS_COMUNES.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
          <option value={OTRA}>Otra</option>
        </CampoLista>

        {valores.vacuna === OTRA && (
          <CampoTexto label="Nombre de la vacuna *" autoComplete="off" required {...campo('otra')} />
        )}

        <CampoTexto
          label="Fecha de aplicación *"
          type="date"
          max={hoyISO(hoy)}
          autoComplete="off"
          required
          {...campo('fecha')}
        />
        <CampoTexto
          label="Veterinaria (opcional)"
          autoComplete="off"
          enterKeyHint="next"
          {...campo('veterinaria')}
        />
        <CampoTexto
          label="Próxima dosis (opcional)"
          ayuda="Si ya sabes cuándo toca la siguiente, la guardamos como tu próxima vacuna."
          type="date"
          min={hoyISO(hoy)}
          autoComplete="off"
          {...campo('proxima')}
        />

        {errorGuardar && <MensajeError id="error-vacuna">{errorGuardar}</MensajeError>}

        <div className="flex flex-col gap-4">
          <BotonPrincipal type="submit" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar vacuna'}
          </BotonPrincipal>
          <BotonSecundario onClick={onCancelar}>Cancelar</BotonSecundario>
        </div>
      </form>
    </Tarjeta>
  )
}
