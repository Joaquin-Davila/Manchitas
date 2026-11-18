import { Route, Routes } from 'react-router-dom'
import Bienvenida from '../features/auth/Bienvenida'
import IniciarSesion from '../features/auth/IniciarSesion'
import LayoutAuth from '../features/auth/LayoutAuth'
import Privacidad from '../features/auth/Privacidad'
import Registro from '../features/auth/Registro'
import RutaProtegida from '../features/auth/RutaProtegida'
import BuscarPorId from '../features/publico/BuscarPorId'
import PerfilPublico from '../features/publico/PerfilPublico'
import FichaMascota from '../features/mascotas/FichaMascota'
import Inicio from '../features/mascotas/Inicio'
import ListaMascotas from '../features/mascotas/ListaMascotas'
import NuevaMascota from '../features/mascotas/NuevaMascota'
import Salud from '../features/salud/Salud'
import Layout from './Layout'
import PantallaVacia from './PantallaVacia'
import { rutas } from './rutas'

// Pantallas que aún no existen: solo muestran el encabezado correcto.
const pendientes = rutas.filter((r) => r.path !== '/' && r.path !== '/mascotas' && r.path !== '/salud')

export default function App() {
  return (
    <Routes>
      <Route element={<LayoutAuth />}>
        <Route path="bienvenida" element={<Bienvenida />} />
        <Route path="iniciar-sesion" element={<IniciarSesion />} />
        <Route path="registro" element={<Registro />} />
        <Route path="privacidad" element={<Privacidad />} />
        <Route path="buscar" element={<BuscarPorId />} />
        <Route path="m/:token" element={<PerfilPublico />} />
      </Route>

      <Route element={<RutaProtegida />}>
        <Route element={<Layout />}>
          <Route index element={<Inicio />} />
          <Route path="mascotas" element={<ListaMascotas />} />
          <Route path="mascotas/nueva" element={<NuevaMascota />} />
          <Route path="mascotas/:id" element={<FichaMascota />} />
          <Route path="salud" element={<Salud />} />
          {pendientes.map((r) => (
            <Route key={r.path} path={r.path} element={<PantallaVacia />} />
          ))}
        </Route>
      </Route>
    </Routes>
  )
}
