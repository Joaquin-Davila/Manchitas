import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import AvisoSinConexion from '../components/ui/AvisoSinConexion'
import Bienvenida from '../features/auth/Bienvenida'
import IniciarSesion from '../features/auth/IniciarSesion'
import LayoutAuth from '../features/auth/LayoutAuth'
import Registro from '../features/auth/Registro'
import RutaProtegida from '../features/auth/RutaProtegida'
import RutaAutoridad from '../features/autoridad/RutaAutoridad'
import LayoutPoliticas from '../features/politicas/LayoutPoliticas'
import Inicio from '../features/mascotas/Inicio'
import ListaMascotas from '../features/mascotas/ListaMascotas'
import Layout from './Layout'
import PantallaVacia from './PantallaVacia'
import { rutas } from './rutas'

// Pantallas diferidas: cada una es su propio chunk. El service worker los guarda todos en el
// pre-caché, así que también abren sin red.
const PanelAutoridad = lazy(() => import('../features/autoridad/PanelAutoridad'))
const Comunidad = lazy(() => import('../features/comunidad/Comunidad'))
const FichaVeterinaria = lazy(() => import('../features/veterinarias/FichaVeterinaria'))
const PaginaColecta = lazy(() => import('../features/solidario/PaginaColecta'))
const NuevaColecta = lazy(() => import('../features/solidario/NuevaColecta'))
const BuscarPorId = lazy(() => import('../features/publico/BuscarPorId'))
const PerfilPublico = lazy(() => import('../features/publico/PerfilPublico'))
const CentroAvisos = lazy(() => import('../features/avisos/CentroAvisos'))
const Confirmacion = lazy(() => import('../features/reportes/Confirmacion'))
const NuevoReporte = lazy(() => import('../features/reportes/NuevoReporte'))
const Reglamento = lazy(() => import('../features/reportes/Reglamento'))
const Seguimiento = lazy(() => import('../features/reportes/Seguimiento'))
const FichaMascota = lazy(() => import('../features/mascotas/FichaMascota'))
const NuevaMascota = lazy(() => import('../features/mascotas/NuevaMascota'))
const EditarMascota = lazy(() => import('../features/mascotas/EditarMascota'))
const Salud = lazy(() => import('../features/salud/Salud'))
const Privacidad = lazy(() => import('../features/auth/Privacidad'))
const Terminos = lazy(() => import('../features/politicas/Terminos'))
const Cookies = lazy(() => import('../features/politicas/Cookies'))
const RecuperarContrasena = lazy(() => import('../features/auth/RecuperarContrasena'))
const RestablecerContrasena = lazy(() => import('../features/auth/RestablecerContrasena'))

// Pantallas que aún no existen: solo muestran el encabezado correcto.
const pendientes = rutas.filter((r) => r.path !== '/' && r.path !== '/mascotas' && r.path !== '/salud' && r.path !== '/avisos' && r.path !== '/comunidad')

export default function App() {
  return (
    <>
    <AvisoSinConexion />
    <Suspense fallback={<p role="status" className="p-6 text-center text-sm text-cafe-suave">Cargando…</p>}>
    <Routes>
      <Route element={<LayoutAuth />}>
        <Route path="bienvenida" element={<Bienvenida />} />
        <Route path="iniciar-sesion" element={<IniciarSesion />} />
        <Route path="registro" element={<Registro />} />
        <Route path="recuperar" element={<RecuperarContrasena />} />
        <Route path="restablecer" element={<RestablecerContrasena />} />
        <Route path="buscar" element={<BuscarPorId />} />
        <Route path="m/:token" element={<PerfilPublico />} />
        <Route path="reportar" element={<NuevoReporte />} />
        <Route path="reportar/enviado" element={<Confirmacion />} />
        <Route path="reportar/seguimiento" element={<Seguimiento />} />
      </Route>

      {/* Documentos de políticas: públicos, en una columna editorial ancha y sin barra de la app. */}
      <Route element={<LayoutPoliticas />}>
        <Route path="terminos" element={<Terminos />} />
        <Route path="privacidad" element={<Privacidad />} />
        <Route path="cookies" element={<Cookies />} />
        <Route path="reglamento" element={<Reglamento />} />
      </Route>

      <Route element={<RutaProtegida />}>
        {/* Panel de autoridad: sin barra inferior y fuera de rutas.tsx (no aparece en la navegación). */}
        <Route element={<RutaAutoridad />}>
          <Route path="autoridad" element={<PanelAutoridad />} />
        </Route>
        <Route element={<Layout />}>
          <Route index element={<Inicio />} />
          <Route path="mascotas" element={<ListaMascotas />} />
          <Route path="mascotas/nueva" element={<NuevaMascota />} />
          <Route path="mascotas/:id" element={<FichaMascota />} />
          <Route path="mascotas/:id/editar" element={<EditarMascota />} />
          <Route path="comunidad" element={<Comunidad />} />
          <Route path="comunidad/veterinarias/:id" element={<FichaVeterinaria />} />
          <Route path="comunidad/solidario/nueva" element={<NuevaColecta />} />
          <Route path="comunidad/solidario/:id" element={<PaginaColecta />} />
          <Route path="salud" element={<Salud />} />
          <Route path="avisos" element={<CentroAvisos />} />
          {pendientes.map((r) => (
            <Route key={r.path} path={r.path} element={<PantallaVacia />} />
          ))}
        </Route>
      </Route>
    </Routes>
    </Suspense>
    </>
  )
}
