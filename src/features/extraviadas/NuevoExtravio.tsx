import { Trash2, X } from 'lucide-react'
import { useId, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AreaTexto from '../../components/ui/AreaTexto'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import CampoTexto from '../../components/ui/CampoTexto'
import MensajeError from '../../components/ui/MensajeError'
import { hoyISO } from '../../lib/edad'
import { crearExtraviado } from '../../lib/extraviados'
import type { Especie } from '../../lib/extraviados'
import { reducirImagen } from '../../lib/imagen'
import { haySupabase } from '../../lib/supabase'
import { useSesion } from '../auth/contextoSesion'
import { clasesFoco, clasesTarjeta } from '../mascotas/inicio/comun'
import { useMascotas } from '../mascotas/useMascotas'

function restarDias(iso: string, dias: number): string {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - dias)
  return d.toISOString().slice(0, 10)
}

type Errores = Partial<Record<'nombre' | 'fecha' | 'zona' | 'general', string>>

/** Formulario para reportar una mascota extraviada (día 0). Se puede partir de una mascota registrada. */
export default function NuevoExtravio() {
  const { sesion } = useSesion()
  const { mascotas } = useMascotas()
  const navigate = useNavigate()
  const [hoy] = useState(() => hoyISO())
  const idFoto = useId()
  const [mascotaId, setMascotaId] = useState('')
  const [nombre, setNombre] = useState('')
  const [especie, setEspecie] = useState<Especie>('perro')
  const [raza, setRaza] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fotoUrl, setFotoUrl] = useState<string>()
  const [fotoNueva, setFotoNueva] = useState<string>()
  const [fecha, setFecha] = useState(hoy)
  const [zona, setZona] = useState('')
  const [whatsapp, setWhatsapp] = useState(false)
  const [errores, setErrores] = useState<Errores>({})
  const [procesando, setProcesando] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const tieneTelefono = !!sesion?.telefono

  function elegirMascota(id: string) {
    setMascotaId(id)
    const m = mascotas.find((x) => x.id === id)
    if (!m) return
    setNombre(m.nombre)
    setEspecie(m.especie)
    setRaza(m.raza)
    setDescripcion([m.senas, m.nota].filter(Boolean).join(' '))
    setFotoUrl(m.fotoUrl)
    setFotoNueva(undefined)
  }

  async function elegirFoto(ev: ChangeEvent<HTMLInputElement>) {
    const f = ev.target.files?.[0]
    ev.target.value = ''
    if (!f) return
    setProcesando(true)
    try {
      setFotoNueva(await reducirImagen(f, 1000))
    } catch (err) {
      setErrores((x) => ({ ...x, general: err instanceof Error ? err.message : 'No pudimos leer la imagen.' }))
    } finally {
      setProcesando(false)
    }
  }

  async function enviar(ev: FormEvent) {
    ev.preventDefault()
    const nuevos: Errores = {}
    if (!nombre.trim()) nuevos.nombre = 'Escribe el nombre de tu mascota.'
    if (!fecha || fecha > hoy) nuevos.fecha = 'La fecha no puede ser futura.'
    else if (fecha < restarDias(hoy, 30)) nuevos.fecha = 'Solo se pueden reportar extravíos de los últimos 30 días.'
    if (!zona.trim()) nuevos.zona = 'Indica la zona aproximada donde la perdiste (colonia o calle principal).'
    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0) return
    if (!sesion?.id) return setErrores({ general: 'Necesitas iniciar sesión con tu cuenta para reportar.' })
    setEnviando(true)
    try {
      const id = await crearExtraviado(sesion.id, {
        mascotaId: mascotaId || undefined,
        nombre,
        especie,
        raza,
        descripcion,
        fotoRuta: fotoNueva ? undefined : fotoUrl,
        fotoNueva,
        fechaExtravio: fecha,
        zona,
        contactoWhatsapp: whatsapp && tieneTelefono,
      })
      navigate(`/comunidad/extraviadas/${id}`, { replace: true })
    } catch (err) {
      setErrores({ general: err instanceof Error ? err.message : 'No pudimos publicar tu reporte.' })
      setEnviando(false)
    }
  }

  if (!haySupabase) {
    return (
      <div role="status" className={`p-5 text-sm ${clasesTarjeta}`}>
        Reportar una mascota extraviada requiere conexión con la base de datos de Manchitas.{' '}
        <Link to="/comunidad?tab=extraviadas" className="font-semibold text-naranja-sombra underline">Volver</Link>
      </div>
    )
  }

  const foto = fotoNueva ?? fotoUrl

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <Link to="/comunidad?tab=extraviadas" className={`-ml-2 inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-semibold text-naranja-sombra hover:bg-amarillo-suave ${clasesFoco}`}>
          <X aria-hidden="true" size={16} />
          Cancelar
        </Link>
        <h2 className="mt-1 font-titulo text-[26px] font-bold leading-tight text-cafe md:text-3xl">Reporta a tu mascota extraviada</h2>
        <p className="text-sm text-cafe-suave">Tu reporte lo verá la comunidad de Hermosillo. Si pasan 5 días sin noticias, se abrirá un foro automáticamente.</p>
      </div>

      <form noValidate onSubmit={enviar} className={`flex flex-col gap-6 p-5 md:p-7 ${clasesTarjeta}`}>
        {mascotas.length > 0 && (
          <div>
            <label htmlFor="mascota-elegida" className="text-[13px] font-semibold text-cafe-suave">¿Es una de tus mascotas registradas?</label>
            <select
              id="mascota-elegida"
              value={mascotaId}
              onChange={(e) => elegirMascota(e.target.value)}
              className="mt-1 h-12 w-full rounded-2xl border border-borde-calido bg-white px-4 text-[15px] text-cafe outline-none focus-visible:border-naranja focus-visible:ring-2 focus-visible:ring-naranja/25"
            >
              <option value="">Otra mascota (llenar a mano)</option>
              {mascotas.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </div>
        )}

        <CampoTexto label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} error={errores.nombre} maxLength={60} required />
        <fieldset className="m-0 flex min-w-0 gap-2 border-0 p-0">
          <legend className="mb-1 text-[13px] font-semibold text-cafe-suave">Especie</legend>
          {(['perro', 'gato'] as const).map((e) => (
            <label key={e} className={`flex min-h-11 cursor-pointer items-center rounded-full border-2 px-5 text-sm font-semibold has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-naranja-sombra ${especie === e ? 'border-naranja bg-naranja text-white' : 'border-borde-calido bg-white text-cafe'}`}>
              <input type="radio" name="especie" value={e} checked={especie === e} onChange={() => setEspecie(e)} className="sr-only" />
              {e === 'perro' ? 'Perro' : 'Gato'}
            </label>
          ))}
        </fieldset>
        <CampoTexto label="Raza (opcional)" value={raza} onChange={(e) => setRaza(e.target.value)} maxLength={80} />
        <AreaTexto label="Cómo reconocerla" ayuda="Color, tamaño, collar, señas particulares y cómo reacciona." value={descripcion} onChange={(e) => setDescripcion(e.target.value)} maxLength={600} rows={4} />

        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-semibold text-cafe-suave">Foto</p>
          {foto && (
            <div className="flex items-center gap-3">
              <img src={foto} alt="Foto del reporte" className="size-24 rounded-2xl object-cover" />
              <button type="button" aria-label="Quitar la foto" onClick={() => { setFotoNueva(undefined); setFotoUrl(undefined) }} className="flex size-11 items-center justify-center rounded-full text-cafe-suave">
                <Trash2 aria-hidden="true" size={18} />
              </button>
            </div>
          )}
          <label htmlFor={idFoto} className={`inline-flex min-h-11 w-fit cursor-pointer items-center rounded-full border border-borde-calido bg-white px-4 text-sm font-semibold text-cafe ${procesando ? 'opacity-60' : ''}`}>
            {procesando ? 'Procesando…' : foto ? 'Cambiar foto' : 'Agregar foto'}
          </label>
          <input id={idFoto} type="file" accept="image/*" disabled={procesando} onChange={elegirFoto} className="sr-only" />
        </div>

        <CampoTexto label="¿Cuándo se perdió?" type="date" min={restarDias(hoy, 30)} max={hoy} value={fecha} onChange={(e) => setFecha(e.target.value)} error={errores.fecha} required />
        <CampoTexto
          label="Zona aproximada"
          ayuda="Colonia o calle principal donde se perdió. No escribas tu domicilio."
          value={zona}
          onChange={(e) => setZona(e.target.value)}
          error={errores.zona}
          maxLength={120}
          required
        />

        <label className={`flex items-start gap-3 text-sm ${tieneTelefono ? 'cursor-pointer' : 'opacity-70'}`}>
          <input type="checkbox" checked={whatsapp && tieneTelefono} disabled={!tieneTelefono} onChange={(e) => setWhatsapp(e.target.checked)} className="mt-1 size-6 shrink-0 accent-naranja" />
          <span className="py-1">
            Permitir que quien la vea me contacte por WhatsApp. Tu número no se muestra en pantalla.
            {!tieneTelefono && <span className="block text-[13px] text-cafe-suave">Tu cuenta no tiene WhatsApp registrado; sin él, solo recibirás avistamientos en la app.</span>}
          </span>
        </label>

        {errores.general && <MensajeError id="error-extravio">{errores.general}</MensajeError>}
        <BotonPrincipal type="submit" disabled={enviando || procesando}>{enviando ? 'Publicando…' : 'Publicar reporte'}</BotonPrincipal>
      </form>
    </div>
  )
}
