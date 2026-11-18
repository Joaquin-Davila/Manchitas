import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import type { ComponentProps } from 'react'
import CampoTexto from '../../components/ui/CampoTexto'

type Props = Omit<ComponentProps<typeof CampoTexto>, 'type' | 'adorno'>

// Campo de contraseña con botón para mostrarla u ocultarla. Permite pegar y usar el administrador de contraseñas.
export default function CampoContrasena(props: Props) {
  const [visible, setVisible] = useState(false)

  return (
    <CampoTexto
      {...props}
      type={visible ? 'text' : 'password'}
      spellCheck={false}
      autoCapitalize="none"
      adorno={
        <button
          type="button"
          aria-pressed={visible}
          aria-label="Mostrar contraseña"
          onClick={() => setVisible((v) => !v)}
          className="flex size-11 items-center justify-center text-cafe-suave"
        >
          {visible ? <EyeOff aria-hidden="true" size={22} /> : <Eye aria-hidden="true" size={22} />}
        </button>
      }
    />
  )
}
