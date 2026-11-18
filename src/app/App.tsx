import { Route, Routes } from 'react-router-dom'
import Inicio from '../features/mascotas/Inicio'
import Layout from './Layout'
import PantallaVacia from './PantallaVacia'
import { rutas } from './rutas'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        {rutas
          .filter((r) => r.path !== '/')
          .map((r) => (
            <Route key={r.path} path={r.path} element={<PantallaVacia />} />
          ))}
      </Route>
    </Routes>
  )
}
