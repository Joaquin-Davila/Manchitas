import { useNavigate } from 'react-router-dom'
import { crearMascota } from '../../lib/mascotas'
import { useSesion } from '../auth/contextoSesion'
import FormularioMascota from './FormularioMascota'

export default function NuevaMascota() {
  const { sesion } = useSesion()
  const navigate = useNavigate()

  return (
    <FormularioMascota
      volverA="/mascotas"
      guardar={async (datos) => {
        if (!sesion) return
        const mascota = await crearMascota(datos, sesion)
        navigate(`/mascotas/${mascota.id}`, { replace: true, state: { nueva: true } })
      }}
    />
  )
}
