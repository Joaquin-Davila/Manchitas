import { Route, Routes } from 'react-router-dom'
import Bienvenida from '../features/auth/Bienvenida'
import IniciarSesion from '../features/auth/IniciarSesion'
import LayoutAuth from '../features/auth/LayoutAuth'
import Privacidad from '../features/auth/Privacidad'
import Registro from '../features/auth/Registro'
import RutaProtegida from '../features/auth/RutaProtegida'
import Inicio from '../features/mascotas/Inicio'
import Layout from './Layout'
import PantallaVacia from './PantallaVacia'
import { rutas } from './rutas'

export default function App() {
  return (
    <Routes>
      <Route element={<LayoutAuth />}>
        <Route path="bienvenida" element={<Bienvenida />} />
        <Route path="iniciar-sesion" element={<IniciarSesion />} />
        <Route path="registro" element={<Registro />} />
        <Route path="privacidad" element={<Privacidad />} />
      </Route>

      <Route element={<RutaProtegida />}>
        <Route element={<Layout />}>
          <Route index element={<Inicio />} />
          {rutas
            .filter((r) => r.path !== '/')
            .map((r) => (
              <Route key={r.path} path={r.path} element={<PantallaVacia />} />
            ))}
        </Route>
      </Route>
    </Routes>
  )
}
