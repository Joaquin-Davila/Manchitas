import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Tarjeta from '../../components/ui/Tarjeta'
import { actualizarMascota, obtenerMascota } from '../../lib/mascotas'
import type { Mascota } from '../../types/mascota'
import { useSesion } from '../auth/contextoSesion'
import FormularioMascota from './FormularioMascota'

// `undefined` = cargando; `null` = no existe o no es de esta cuenta.
export default function EditarMascota() {
  const { id } = useParams()
  const { sesion } = useSesion()
  const navigate = useNavigate()
  const [mascota, setMascota] = useState<Mascota | null | undefined>(undefined)

  const correo = sesion?.correo
  useEffect(() => {
    if (!id || !correo) return
    let vigente = true
    obtenerMascota(id, correo)
      .then((m) => vigente && setMascota(m))
      .catch(() => vigente && setMascota(null))
    return () => {
      vigente = false
    }
  }, [id, correo])

  if (mascota === undefined) {
    return <div aria-hidden="true" className="h-96 animate-pulse rounded-[24px] bg-white/70" />
  }

  if (mascota === null) {
    return (
      <Tarjeta className="flex flex-col items-start gap-3 p-5">
        <h2 className="font-titulo text-lg font-semibold">No encontramos a esa mascota</h2>
        <p className="text-sm text-cafe-suave">Puede que el enlace sea incorrecto o que no sea de tu cuenta.</p>
        <Link to="/mascotas" className="min-h-11 py-2 font-semibold text-naranja-sombra underline">
          Ver mis mascotas
        </Link>
      </Tarjeta>
    )
  }

  return (
    <FormularioMascota
      mascota={mascota}
      volverA={`/mascotas/${mascota.id}`}
      guardar={async (datos) => {
        if (!sesion) return
        await actualizarMascota(mascota.id, datos, sesion)
        navigate(`/mascotas/${mascota.id}`, { replace: true, state: { editada: true } })
      }}
    />
  )
}
