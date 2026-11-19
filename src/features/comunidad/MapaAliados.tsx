import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './mapa.css'
import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, TileLayer, useMap, ZoomControl } from 'react-leaflet'
import type { Aliado } from '../../lib/campanasEjemplo'
import { categoriaDe, simboloSvg } from './categoriasMapa'

// Centro aproximado de Hermosillo.
const CENTRO: [number, number] = [29.0729, -110.9559]

// Marcador SVG propio por categoría: evita las imágenes por defecto de Leaflet, que Vite no resuelve
// solas. El seleccionado es más grande y rebota una vez (mapa.css).
function icono(aliado: Aliado, activo: boolean) {
  const { color, simbolo } = categoriaDe(aliado.tipo)
  const ancho = activo ? 42 : 32
  const alto = activo ? 52 : 40
  return L.divIcon({
    className: activo ? 'marcador marcador-activo' : 'marcador',
    iconSize: [ancho, alto],
    iconAnchor: [ancho / 2, alto],
    html: `<svg width="${ancho}" height="${alto}" viewBox="0 0 32 40" aria-hidden="true"><path d="M16 1C8 1 2 7 2 15c0 10 14 24 14 24s14-14 14-24C30 7 24 1 16 1z" fill="${color}" stroke="#fff" stroke-width="2.5"/>${simboloSvg(simbolo)}</svg>`,
  })
}

/** Encuadra todos los lugares visibles cuando cambian los filtros. */
function Ajustar({ aliados }: { aliados: Aliado[] }) {
  const mapa = useMap()
  useEffect(() => {
    if (aliados.length === 0) mapa.setView(CENTRO, 12)
    else if (aliados.length === 1) mapa.setView([aliados[0].lat, aliados[0].lng], 14)
    else mapa.fitBounds(L.latLngBounds(aliados.map((a) => [a.lat, a.lng])), { paddingTopLeft: [30, 56], paddingBottomRight: [30, 20] })
  }, [aliados, mapa])
  return null
}

/** Lleva el mapa al lugar seleccionado (desde un marcador, la lista o el directorio). */
function Volar({ destino }: { destino?: Aliado }) {
  const mapa = useMap()
  useEffect(() => {
    if (!destino) return
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const zoom = Math.max(mapa.getZoom(), 14)
    if (reducido) mapa.setView([destino.lat, destino.lng], zoom)
    else mapa.flyTo([destino.lat, destino.lng], zoom, { duration: 0.6 })
  }, [destino, mapa])
  return null
}

type Props = {
  aliados: Aliado[]
  seleccionado: string | null
  onSeleccionar: (id: string) => void
}

export default function MapaAliados({ aliados, seleccionado, onSeleccionar }: Props) {
  const destino = useMemo(() => aliados.find((a) => a.id === seleccionado), [aliados, seleccionado])

  return (
    <MapContainer center={CENTRO} zoom={12} scrollWheelZoom={false} zoomControl={false} className="h-full w-full">
      <ZoomControl position="topright" zoomInTitle="Acercar el mapa" zoomOutTitle="Alejar el mapa" />
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'
      />
      <Ajustar aliados={aliados} />
      <Volar destino={destino} />
      {aliados.map((a) => (
        // Leaflet hace los marcadores enfocables; Enter dispara el mismo clic.
        <Marker
          key={a.id}
          position={[a.lat, a.lng]}
          icon={icono(a, a.id === seleccionado)}
          zIndexOffset={a.id === seleccionado ? 1000 : 0}
          title={`${a.nombre} (${a.tipo})`}
          alt={a.nombre}
          eventHandlers={{ click: () => onSeleccionar(a.id) }}
        />
      ))}
    </MapContainer>
  )
}
