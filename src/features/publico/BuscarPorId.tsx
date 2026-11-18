import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import BotonPrincipal from '../../components/ui/BotonPrincipal'
import CampoTexto from '../../components/ui/CampoTexto'
import EncabezadoCurvo from '../../components/ui/EncabezadoCurvo'
import MensajeError from '../../components/ui/MensajeError'
import { normalizarFolio, tokenPorFolio } from '../../lib/mascotas'
import { useCampos } from '../auth/useCampos'
import type { Reglas } from '../auth/useCampos'

type Valores = { folio: string }

const reglas: Reglas<Valores> = {
  folio: (v) =>
    normalizarFolio(v) ? null : 'Escribe el ID completo del collar, por ejemplo MCH-7K3P9Q.',
}

// Búsqueda sin cuenta: solo funciona con el ID exacto.
export default function BuscarPorId() {
  const navigate = useNavigate()
  const { valores, campo, validar } = useCampos<Valores>({ folio: '' }, reglas)
  const [noEncontrado, setNoEncontrado] = useState(false)
  const [buscando, setBuscando] = useState(false)

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setNoEncontrado(false)
    const primero = validar(['folio'])
    if (primero) {
      ;(e.currentTarget.elements.namedItem(primero) as HTMLElement | null)?.focus()
      return
    }
    setBuscando(true)
    const token = await tokenPorFolio(valores.folio)
    if (token) {
      navigate(`/m/${token}`)
    } else {
      setBuscando(false)
      setNoEncontrado(true)
    }
  }

  return (
    <>
      <EncabezadoCurvo titulo="Buscar por ID" atras="/bienvenida" />
      <main className="px-5 pb-10 pt-8">
        <form
          noValidate
          onSubmit={enviar}
          aria-label="Buscar por ID de collar"
          className="flex flex-col gap-6"
        >
          <p className="text-sm text-cafe-suave">
            El ID está en la placa del collar o debajo del código QR. Sirve igual que escanear el QR.
          </p>
          <CampoTexto
            label="ID de collar"
            ayuda="Empieza con MCH-. No distingue mayúsculas."
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            enterKeyHint="search"
            required
            {...campo('folio')}
          />
          {noEncontrado && (
            <MensajeError id="error-busqueda">
              No encontramos ese ID. Revisa que esté completo y vuelve a intentarlo.
            </MensajeError>
          )}
          <BotonPrincipal type="submit" disabled={buscando}>
            {buscando ? 'Buscando…' : 'Buscar'}
          </BotonPrincipal>
        </form>
      </main>
    </>
  )
}
