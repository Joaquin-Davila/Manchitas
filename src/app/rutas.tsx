import type { ComponentType } from 'react'
import { Bell, Heart, House, Users } from 'lucide-react'
import Huella from '../components/ui/Huella'

export type Ruta = {
  path: string
  /** Título del encabezado de la pantalla */
  titulo: string
  /** Nombre accesible del ítem en la barra inferior */
  etiqueta: string
  icono: ComponentType<{ size?: number; 'aria-hidden'?: boolean | 'true' | 'false' }>
}

// Orden de la barra inferior: Inicio va al centro.
export const rutas: Ruta[] = [
  { path: '/mascotas', titulo: 'Mascotas', etiqueta: 'Mascotas', icono: Huella },
  { path: '/comunidad', titulo: 'Comunidad', etiqueta: 'Comunidad', icono: Users },
  { path: '/', titulo: 'Inicio', etiqueta: 'Inicio', icono: House },
  { path: '/salud', titulo: 'Salud', etiqueta: 'Salud', icono: Heart },
  // Avisos: centro de avisos calculados y, abajo, los reportes ciudadanos.
  { path: '/avisos', titulo: 'Avisos', etiqueta: 'Avisos', icono: Bell },
]
