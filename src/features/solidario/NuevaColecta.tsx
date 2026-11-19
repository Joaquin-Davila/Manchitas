import { Check, Plus, Trash2, X } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AreaTexto from '../../components/ui/AreaTexto'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import BotonSecundario from '../../components/ui/BotonSecundario'
import CampoTexto from '../../components/ui/CampoTexto'
import IndicadorPasos from '../../components/ui/IndicadorPasos'
import MensajeError from '../../components/ui/MensajeError'
import { hoyISO } from '../../lib/edad'
import { formatearFecha } from '../../lib/fechas'
import { reducirImagen } from '../../lib/imagen'
import { crearColecta, NOMBRE_BENEFICIARIO, pesos } from '../../lib/solidario'
import type { TipoBeneficiario } from '../../lib/solidario'
import { haySupabase } from '../../lib/supabase'
import { useSesion } from '../auth/contextoSesion'
import { clasesFoco, clasesTarjeta } from '../mascotas/inicio/comun'

const PASOS = ['General', 'Para quién', 'Historia', 'Fotos', 'Meta', 'Gastos', 'Enviar']
const MAX_FOTOS = 4
const META_MIN = 500
const META_MAX = 1_000_000

type Gasto = { concepto: string; monto: string }
type Errores = Partial<Record<'titulo' | 'resumen' | 'fechaFin' | 'beneficiario' | 'historia' | 'fotos' | 'meta' | 'gastos' | 'acepto', string>>

function sumarDias(iso: string, dias: number): string {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + dias)
  return d.toISOString().slice(0, 10)
}

const numero = (t: string) => (/^\d+$/.test(t.trim()) ? Number(t.trim()) : NaN)

export default function NuevaColecta() {
  const { sesion } = useSesion()
  const navigate = useNavigate()
  const [hoy] = useState(() => hoyISO())
  const [paso, setPaso] = useState(1)
  const [titulo, setTitulo] = useState('')
  const [resumen, setResumen] = useState('')
  const [fechaFin, setFechaFin] = useState(() => sumarDias(hoyISO(), 30))
  const [tipo, setTipo] = useState<TipoBeneficiario>('mascota')
  const [beneficiario, setBeneficiario] = useState('')
  const [historia, setHistoria] = useState('')
  const [fotos, setFotos] = useState<string[]>([])
  const [procesando, setProcesando] = useState(false)
  const [meta, setMeta] = useState('')
  const [gastos, setGastos] = useState<Gasto[]>([{ concepto: '', monto: '' }])
  const [acepto, setAcepto] = useState(false)
  const [errores, setErrores] = useState<Errores>({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [enviando, setEnviando] = useState(false)
  const tituloPaso = useRef<HTMLHeadingElement>(null)
  const idArchivo = useId()

  const metaNum = numero(meta)
  const sumaGastos = gastos.reduce((s, g) => s + (numero(g.monto) || 0), 0)

  function validar(p: number): Errores {
    const e: Errores = {}
    if (p === 1) {
      if (titulo.trim().length < 5) e.titulo = 'Escribe un título de al menos 5 caracteres.'
      else if (titulo.trim().length > 120) e.titulo = 'Máximo 120 caracteres.'
      if (resumen.trim().length > 200) e.resumen = 'Máximo 200 caracteres.'
      if (!fechaFin || fechaFin <= hoy) e.fechaFin = 'Elige una fecha de finalización posterior a hoy.'
      else if (fechaFin > sumarDias(hoy, 180)) e.fechaFin = 'La campaña puede durar como máximo 180 días.'
    }
    if (p === 2 && !beneficiario.trim()) e.beneficiario = 'Escribe quién recibirá la ayuda.'
    if (p === 3 && historia.trim().length < 20) e.historia = 'Cuenta la historia con al menos 20 caracteres.'
    if (p === 4 && fotos.length === 0) e.fotos = 'Agrega al menos una foto.'
    if (p === 5) {
      if (!Number.isInteger(metaNum) || metaNum < META_MIN || metaNum > META_MAX) {
        e.meta = `Escribe una meta entera entre ${pesos(META_MIN)} y ${pesos(META_MAX)}.`
      }
    }
    if (p === 6) {
      const incompletos = gastos.some((g) => !g.concepto.trim() || !(numero(g.monto) > 0))
      if (gastos.length === 0 || incompletos) e.gastos = 'Cada gasto necesita un concepto y un monto mayor a cero.'
      else if (sumaGastos !== metaNum) e.gastos = `El desglose suma ${pesos(sumaGastos)} y debe sumar exactamente la meta (${pesos(metaNum)}).`
    }
    if (p === 7 && !acepto) e.acepto = 'Confirma la declaración para enviar tu campaña.'
    return e
  }

  function irA(destino: number) {
    setPaso(destino)
    setErrorGeneral('')
    // El foco pasa al título del paso nuevo para quien usa lector de pantalla o teclado.
    setTimeout(() => tituloPaso.current?.focus(), 0)
  }

  async function agregarFotos(e: ChangeEvent<HTMLInputElement>) {
    const archivos = [...(e.target.files ?? [])]
    e.target.value = ''
    if (archivos.length === 0) return
    setProcesando(true)
    setErrores((x) => ({ ...x, fotos: undefined }))
    try {
      const nuevas: string[] = []
      for (const a of archivos.slice(0, MAX_FOTOS - fotos.length)) nuevas.push(await reducirImagen(a, 1200))
      setFotos((f) => [...f, ...nuevas].slice(0, MAX_FOTOS))
      if (archivos.length > MAX_FOTOS - fotos.length) setErrores((x) => ({ ...x, fotos: `Máximo ${MAX_FOTOS} fotos.` }))
    } catch (err) {
      setErrores((x) => ({ ...x, fotos: err instanceof Error ? err.message : 'No pudimos leer una de las imágenes.' }))
    } finally {
      setProcesando(false)
    }
  }

  async function enviar(e: FormEvent) {
    e.preventDefault()
    const err = validar(paso)
    setErrores(err)
    if (Object.keys(err).length > 0) return
    if (paso < PASOS.length) {
      irA(paso + 1)
      return
    }
    if (!sesion?.id) {
      setErrorGeneral('Necesitas iniciar sesión con tu cuenta para crear una campaña.')
      return
    }
    setErrorGeneral('')
    setEnviando(true)
    try {
      const id = await crearColecta(sesion.id, {
        titulo,
        resumen,
        historia,
        beneficiarioTipo: tipo,
        beneficiario,
        meta: metaNum,
        fechaFin,
        gastos: gastos.map((g) => ({ concepto: g.concepto, monto: numero(g.monto) })),
        fotos,
      })
      navigate(`/comunidad/solidario/${id}`, { replace: true })
    } catch (error) {
      setErrorGeneral(error instanceof Error ? error.message : 'No pudimos enviar tu campaña.')
      setEnviando(false)
    }
  }

  if (!haySupabase) {
    return (
      <div className={`p-5 text-sm ${clasesTarjeta}`} role="status">
        Crear campañas requiere conexión con la base de datos de Manchitas y no está disponible en modo local.{' '}
        <Link to="/comunidad?tab=solidario" className="font-semibold text-naranja-sombra underline">Volver</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <Link to="/comunidad?tab=solidario" className={`-ml-2 inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-semibold text-naranja-sombra hover:bg-amarillo-suave ${clasesFoco}`}>
          <X aria-hidden="true" size={16} />
          Cancelar
        </Link>
        <h2 className="mt-1 font-titulo text-[26px] font-bold leading-tight text-cafe md:text-3xl">Crea tu campaña</h2>
        <p className="text-sm text-cafe-suave">Un moderador la revisa antes de publicarla. Estamos en modo de demostración: no se recibe dinero real.</p>
      </div>

      <IndicadorPasos pasos={PASOS} actual={paso} etiqueta="Progreso de la campaña" />

      <form noValidate onSubmit={enviar} aria-labelledby="titulo-paso-colecta" className={`flex flex-col gap-6 p-5 md:p-7 ${clasesTarjeta}`}>
        <h3 id="titulo-paso-colecta" ref={tituloPaso} tabIndex={-1} className="font-titulo text-xl font-bold text-cafe outline-none">
          {['Información general', 'Selección del beneficiario', 'Historia y descripción', 'Fotografías', 'Objetivo económico', 'Desglose de gastos', 'Revisión y publicación'][paso - 1]}
        </h3>

        {paso === 1 && (
          <>
            <CampoTexto label="Título de la campaña" value={titulo} onChange={(e) => setTitulo(e.target.value)} error={errores.titulo} maxLength={120} required />
            <AreaTexto label="Resumen (opcional)" ayuda="Una o dos frases que aparecerán en la lista de campañas." value={resumen} onChange={(e) => setResumen(e.target.value)} error={errores.resumen} maxLength={200} rows={2} />
            <CampoTexto
              label="Fecha de finalización"
              ayuda="Como máximo, 180 días desde hoy."
              type="date"
              min={sumarDias(hoy, 1)}
              max={sumarDias(hoy, 180)}
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              error={errores.fechaFin}
              required
            />
          </>
        )}

        {paso === 2 && (
          <>
            <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
              <legend className="mb-1 text-[13px] font-semibold text-cafe-suave">¿Quién recibirá la ayuda?</legend>
              {(Object.keys(NOMBRE_BENEFICIARIO) as TipoBeneficiario[]).map((t) => (
                <label
                  key={t}
                  className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 text-[15px] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-naranja-sombra ${
                    tipo === t ? 'border-naranja bg-amarillo-suave font-semibold' : 'border-borde-calido bg-white'
                  }`}
                >
                  <input type="radio" name="beneficiario-tipo" value={t} checked={tipo === t} onChange={() => setTipo(t)} className="sr-only" />
                  {tipo === t && <Check aria-hidden="true" size={18} className="text-naranja" />}
                  {NOMBRE_BENEFICIARIO[t]}
                </label>
              ))}
            </fieldset>
            <CampoTexto
              label="Nombre del beneficiario"
              ayuda="Por ejemplo, el nombre de la mascota, del albergue o de la jornada."
              value={beneficiario}
              onChange={(e) => setBeneficiario(e.target.value)}
              error={errores.beneficiario}
              maxLength={120}
              required
            />
          </>
        )}

        {paso === 3 && (
          <AreaTexto
            label="Cuenta la historia"
            ayuda="Explica qué pasó, qué se necesita y cómo ayudará el dinero. Separa los párrafos con una línea en blanco."
            value={historia}
            onChange={(e) => setHistoria(e.target.value)}
            error={errores.historia}
            maxLength={5000}
            rows={8}
            required
          />
        )}

        {paso === 4 && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-cafe-suave">Agrega de 1 a {MAX_FOTOS} fotos. La primera será la principal. Se reducen y se les quita la ubicación antes de subirse.</p>
            {fotos.length > 0 && (
              <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0">
                {fotos.map((f, i) => (
                  <li key={i} className="relative">
                    <img src={f} alt={`Foto ${i + 1}${i === 0 ? ' (principal)' : ''}`} className="aspect-[4/3] w-full rounded-2xl object-cover" />
                    {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-cafe">Principal</span>}
                    <button
                      type="button"
                      aria-label={`Quitar la foto ${i + 1}`}
                      onClick={() => setFotos((x) => x.filter((_, j) => j !== i))}
                      className="absolute right-1.5 top-1.5 flex size-11 items-center justify-center rounded-full bg-white/95 text-cafe shadow-suave"
                    >
                      <Trash2 aria-hidden="true" size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {fotos.length < MAX_FOTOS && (
              <>
                <label
                  htmlFor={idArchivo}
                  className={`flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-amarillo-borde bg-crema-clara px-4 text-[15px] font-semibold text-cafe ${procesando ? 'opacity-60' : ''}`}
                >
                  <Plus aria-hidden="true" size={18} />
                  {procesando ? 'Procesando…' : 'Agregar fotos'}
                </label>
                <input id={idArchivo} type="file" accept="image/*" multiple disabled={procesando} onChange={agregarFotos} className="sr-only" />
              </>
            )}
            {errores.fotos && <MensajeError id="error-fotos">{errores.fotos}</MensajeError>}
          </div>
        )}

        {paso === 5 && (
          <CampoTexto
            label="Meta (MXN)"
            ayuda={`Entre ${pesos(META_MIN)} y ${pesos(META_MAX)}. En el siguiente paso desglosarás en qué se gastará.`}
            inputMode="numeric"
            value={meta}
            onChange={(e) => setMeta(e.target.value.replace(/\D/g, '').slice(0, 7))}
            error={errores.meta}
            required
          />
        )}

        {paso === 6 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-cafe-suave">Desglosa cada gasto. La suma debe ser exactamente tu meta de <strong>{pesos(metaNum || 0)}</strong>.</p>
            <ul className="m-0 flex list-none flex-col gap-4 p-0">
              {gastos.map((g, i) => (
                <li key={i} className="grid grid-cols-[minmax(0,1fr)_110px_44px] items-end gap-2">
                  <CampoTexto label={`Concepto ${i + 1}`} value={g.concepto} maxLength={120} onChange={(e) => setGastos((x) => x.map((y, j) => (j === i ? { ...y, concepto: e.target.value } : y)))} />
                  <CampoTexto label="Monto" inputMode="numeric" value={g.monto} onChange={(e) => setGastos((x) => x.map((y, j) => (j === i ? { ...y, monto: e.target.value.replace(/\D/g, '').slice(0, 7) } : y)))} />
                  <button type="button" aria-label={`Quitar el concepto ${i + 1}`} disabled={gastos.length === 1} onClick={() => setGastos((x) => x.filter((_, j) => j !== i))} className="flex size-11 items-center justify-center rounded-full text-cafe-suave disabled:opacity-40">
                    <Trash2 aria-hidden="true" size={18} />
                  </button>
                </li>
              ))}
            </ul>
            {gastos.length < 10 && (
              <button type="button" onClick={() => setGastos((x) => [...x, { concepto: '', monto: '' }])} className={`inline-flex min-h-11 w-fit items-center gap-1.5 font-semibold text-naranja-sombra ${clasesFoco}`}>
                <Plus aria-hidden="true" size={16} />
                Agregar otro gasto
              </button>
            )}
            <p role="status" className={`rounded-2xl p-3 text-sm font-semibold ${sumaGastos === metaNum && metaNum > 0 ? 'bg-menta-suave text-salud-trazo' : 'bg-aviso-fondo text-cafe'}`}>
              Suma: {pesos(sumaGastos)} de {pesos(metaNum || 0)}
              {sumaGastos === metaNum && metaNum > 0 ? ' · Coincide con la meta' : metaNum > 0 ? ` · ${sumaGastos < metaNum ? 'Faltan' : 'Sobran'} ${pesos(Math.abs(metaNum - sumaGastos))}` : ''}
            </p>
            {errores.gastos && <MensajeError id="error-gastos">{errores.gastos}</MensajeError>}
          </div>
        )}

        {paso === 7 && (
          <div className="flex flex-col gap-4">
            <dl className="m-0 flex flex-col gap-3 text-sm">
              <div><dt className="font-semibold text-cafe-suave">Título</dt><dd className="m-0 text-cafe">{titulo}</dd></div>
              <div><dt className="font-semibold text-cafe-suave">Para</dt><dd className="m-0 text-cafe">{NOMBRE_BENEFICIARIO[tipo]}: {beneficiario}</dd></div>
              <div><dt className="font-semibold text-cafe-suave">Meta y fecha</dt><dd className="m-0 text-cafe">{pesos(metaNum)} · hasta el {formatearFecha(fechaFin)}</dd></div>
              <div><dt className="font-semibold text-cafe-suave">Fotos</dt><dd className="m-0 text-cafe">{fotos.length}</dd></div>
              <div>
                <dt className="font-semibold text-cafe-suave">Desglose</dt>
                <dd className="m-0 text-cafe">
                  <ul className="m-0 list-none p-0">
                    {gastos.map((g, i) => <li key={i}>{g.concepto}: {pesos(numero(g.monto))}</li>)}
                  </ul>
                </dd>
              </div>
            </dl>
            <p className="rounded-2xl bg-amarillo-suave p-3 text-[13px] leading-snug">
              Tu campaña se enviará <strong>en revisión</strong>: un moderador de Manchitas la valida antes de publicarla. Estamos en modo de demostración y todavía no se recibe dinero real.
            </p>
            <div className="flex flex-col gap-1">
              <label className="flex cursor-pointer items-start gap-3 text-sm">
                <input type="checkbox" checked={acepto} onChange={(e) => setAcepto(e.target.checked)} aria-invalid={errores.acepto ? true : undefined} className="mt-1 size-6 shrink-0 accent-naranja" />
                <span className="py-1">
                  Confirmo que la información es verdadera, que soy la persona responsable de la campaña y que acepto los{' '}
                  <Link to="/terminos" target="_blank" className="font-semibold text-naranja-sombra underline">términos y condiciones<span className="sr-only"> (se abre en otra pestaña)</span></Link>.
                </span>
              </label>
              {errores.acepto && <MensajeError id="error-acepto">{errores.acepto}</MensajeError>}
            </div>
          </div>
        )}

        {errorGeneral && <MensajeError id="error-general-colecta">{errorGeneral}</MensajeError>}
        <div className="flex flex-col gap-3 md:flex-row-reverse">
          <BotonPrincipal type="submit" disabled={enviando || procesando} className="md:flex-1">
            {paso < PASOS.length ? 'Siguiente' : enviando ? 'Enviando…' : 'Enviar a revisión'}
          </BotonPrincipal>
          {paso > 1 && <BotonSecundario onClick={() => irA(paso - 1)} className="md:flex-1">Atrás</BotonSecundario>}
        </div>
      </form>
    </div>
  )
}
