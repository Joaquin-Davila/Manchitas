import { Bell, ImagePlus, Info, Syringe, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import BotonSecundario from '../../components/ui/BotonSecundario'
import MensajeError from '../../components/ui/MensajeError'
import Tarjeta from '../../components/ui/Tarjeta'
import { hoyISO } from '../../lib/edad'
import { formatearFecha } from '../../lib/fechas'
import { reducirImagen } from '../../lib/imagen'
import type { Cartilla, VacunaAplicada } from '../../types/cartilla'
import type { Mascota } from '../../types/mascota'
import FormularioVacuna from './FormularioVacuna'
import type { useCartilla } from './useCartilla'

type Props = {
  mascota: Mascota
  cartilla: Cartilla
  acciones: Omit<ReturnType<typeof useCartilla>, 'cartilla' | 'cargando'>
}

function mensajeDe(error: unknown, porDefecto: string): string {
  // Los DOMException del navegador vienen en inglés: se cambian por un mensaje claro.
  return error instanceof Error && !(error instanceof DOMException) ? error.message : porDefecto
}

function FilaVacuna({ vacuna, onEliminar }: { vacuna: VacunaAplicada; onEliminar: () => void }) {
  const [confirmando, setConfirmando] = useState(false)
  return (
    <li className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-rosa text-cafe">
          <Syringe aria-hidden="true" size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug">{vacuna.nombre}</p>
          <p className="text-[13px] leading-snug text-cafe-suave">
            Aplicada el {formatearFecha(vacuna.fecha)}
            {vacuna.veterinaria ? ` · ${vacuna.veterinaria}` : ''}
          </p>
        </div>
        {!confirmando && (
          <button
            type="button"
            onClick={() => setConfirmando(true)}
            aria-label={`Eliminar ${vacuna.nombre} del ${formatearFecha(vacuna.fecha)}`}
            className="flex size-11 shrink-0 items-center justify-center rounded-full text-cafe-suave focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naranja"
          >
            <Trash2 aria-hidden="true" size={20} />
          </button>
        )}
      </div>
      {confirmando && (
        <div role="alert" className="flex flex-wrap items-center gap-x-4 pl-14 text-sm">
          <span className="font-semibold">¿Eliminar este registro?</span>
          <button
            type="button"
            onClick={onEliminar}
            className="min-h-11 font-semibold text-error underline"
          >
            Sí, eliminar
          </button>
          <button
            type="button"
            onClick={() => setConfirmando(false)}
            className="min-h-11 font-semibold text-naranja-sombra underline"
          >
            Cancelar
          </button>
        </div>
      )}
    </li>
  )
}

export default function PanelCartilla({ mascota, cartilla, acciones }: Props) {
  const [formulario, setFormulario] = useState(false)
  const [aviso, setAviso] = useState<string>()
  const [error, setError] = useState<string>()
  const [procesandoFoto, setProcesandoFoto] = useState(false)
  const entradaFoto = useRef<HTMLInputElement>(null)
  const [hoy] = useState(() => hoyISO())

  const { vacunas, proxima, fotoCartilla } = cartilla
  const vencida = proxima ? proxima.fecha < hoy : false

  async function guardarVacuna(datos: Parameters<typeof acciones.registrarVacuna>[0]) {
    await acciones.registrarVacuna(datos)
    setFormulario(false)
    setError(undefined)
    setAviso(`Registramos ${datos.nombre}.`)
  }

  async function eliminar(id: string) {
    setError(undefined)
    try {
      await acciones.eliminarVacuna(id)
      setAviso('Eliminamos el registro.')
    } catch (e) {
      setError(mensajeDe(e, 'No pudimos eliminar el registro.'))
    }
  }

  async function elegirFoto(archivo: File | undefined) {
    if (!archivo) return
    setError(undefined)
    setAviso(undefined)
    setProcesandoFoto(true)
    try {
      // 1200 px: más que la foto del perro, para que el texto de la cartilla siga legible.
      await acciones.guardarFoto(await reducirImagen(archivo, 1200))
      setAviso('Guardamos la foto de la cartilla.')
    } catch (e) {
      setError(mensajeDe(e, 'No pudimos leer esa imagen. Prueba con otra foto.'))
    } finally {
      setProcesandoFoto(false)
      if (entradaFoto.current) entradaFoto.current.value = ''
    }
  }

  async function quitarFoto() {
    setError(undefined)
    try {
      await acciones.guardarFoto(undefined)
      setAviso('Quitamos la foto de la cartilla.')
    } catch (e) {
      setError(mensajeDe(e, 'No pudimos quitar la foto.'))
    }
  }

  async function cambiarRecordatorio() {
    setError(undefined)
    try {
      await acciones.definirRecordatorio(!cartilla.recordatorio)
    } catch (e) {
      setError(mensajeDe(e, 'No pudimos cambiar el recordatorio.'))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="flex items-start gap-2 text-[13px] text-cafe-suave">
        <Info aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
        <span>
          Esta cartilla la llenas tú para {mascota.nombre}. Todavía no la valida un veterinario.
        </span>
      </p>

      {/* Mensajes: siempre en el DOM para que los lectores de pantalla los anuncien. */}
      <div role="status" className="text-sm font-semibold text-salud-trazo empty:hidden">
        {aviso}
      </div>
      {error && <MensajeError id="error-cartilla">{error}</MensajeError>}

      <Tarjeta className="flex flex-col gap-3 p-4">
        <h3 className="font-titulo text-base font-semibold">Próxima vacuna</h3>
        {proxima ? (
          <>
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-durazno text-cafe">
                <Syringe aria-hidden="true" size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold leading-snug">{proxima.nombre}</p>
                <p className="text-[13px] leading-snug text-cafe-suave">
                  {formatearFecha(proxima.fecha)}
                  {vencida ? ' · ya pasó la fecha' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 border-t-2 border-barra-borde pt-3">
              <span id="etiqueta-recordatorio" className="flex items-center gap-2 text-sm font-semibold">
                <Bell aria-hidden="true" size={18} className="text-naranja" />
                Recordarme en Inicio
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={cartilla.recordatorio}
                aria-labelledby="etiqueta-recordatorio"
                onClick={cambiarRecordatorio}
                className="flex min-h-11 min-w-14 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naranja"
              >
                <span
                  aria-hidden="true"
                  className={`flex h-8 w-14 items-center rounded-full border-2 px-0.5 ${
                    cartilla.recordatorio ? 'justify-end border-naranja bg-naranja' : 'justify-start border-cafe-suave bg-white'
                  }`}
                >
                  <span
                    className={`size-6 rounded-full ${cartilla.recordatorio ? 'bg-white' : 'bg-cafe-suave'}`}
                  />
                </span>
              </button>
            </div>
          </>
        ) : (
          <p className="text-sm text-cafe-suave">
            Aún no tienes una próxima vacuna programada. Al registrar una vacuna puedes indicar cuándo toca
            la siguiente dosis.
          </p>
        )}
      </Tarjeta>

      <Tarjeta className="flex flex-col gap-3 p-4">
        <h3 className="font-titulo text-base font-semibold">Vacunas aplicadas</h3>
        {vacunas.length > 0 ? (
          <ul className="m-0 flex list-none flex-col divide-y-2 divide-barra-borde p-0">
            {vacunas.map((v) => (
              <FilaVacuna key={v.id} vacuna={v} onEliminar={() => eliminar(v.id)} />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-cafe-suave">Todavía no hay vacunas registradas.</p>
        )}
      </Tarjeta>

      {formulario ? (
        <FormularioVacuna
          nacimiento={mascota.nacimiento}
          onGuardar={guardarVacuna}
          onCancelar={() => setFormulario(false)}
        />
      ) : (
        <BotonPrincipal
          onClick={() => {
            setAviso(undefined)
            setFormulario(true)
          }}
        >
          Registrar vacuna aplicada
        </BotonPrincipal>
      )}

      <Tarjeta className="flex flex-col gap-3 p-4">
        <h3 className="font-titulo text-base font-semibold">Foto de la cartilla</h3>
        {fotoCartilla ? (
          <img
            src={fotoCartilla}
            alt={`Foto de la cartilla de vacunación de ${mascota.nombre}`}
            className="max-h-80 w-full rounded-dato bg-foto-vacia object-contain"
          />
        ) : (
          <p className="text-sm text-cafe-suave">
            Guarda una foto de la cartilla de papel para tenerla a la mano.
          </p>
        )}
        <input
          ref={entradaFoto}
          type="file"
          accept="image/*"
          hidden
          aria-label="Elegir foto de la cartilla"
          onChange={(e) => elegirFoto(e.target.files?.[0])}
        />
        <BotonSecundario
          className="gap-2 disabled:opacity-60"
          disabled={procesandoFoto}
          onClick={() => entradaFoto.current?.click()}
        >
          <ImagePlus aria-hidden="true" size={20} />
          {procesandoFoto ? 'Preparando la foto…' : fotoCartilla ? 'Cambiar foto de cartilla' : 'Subir foto de cartilla'}
        </BotonSecundario>
        {fotoCartilla && (
          <button
            type="button"
            onClick={quitarFoto}
            className="min-h-11 w-fit text-sm font-semibold text-naranja-sombra underline"
          >
            Quitar foto
          </button>
        )}
      </Tarjeta>
    </div>
  )
}
