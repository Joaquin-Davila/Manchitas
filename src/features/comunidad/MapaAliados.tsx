import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './mapa.css'
import { useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap, ZoomControl } from 'react-leaflet'
import { enlaceComoLlegar } from '../../lib/campanasEjemplo'
import type { Aliado } from '../../lib/campanasEjemplo'

// Centro aproximado de Hermosillo.
const CENTRO: [number, number] = [29.0729, -110.9559]

// Marcador SVG propio: evita las imágenes por defecto de Leaflet, que Vite no resuelve solas.
function icono(abierto24h: boolean) {
  const color = abierto24h ? '#0b6f66' : '#0284c7'
  return L.divIcon({
    className: '',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -36],
    html: `<svg width="32" height="40" viewBox="0 0 32 40" aria-hidden="true"><path d="M16 1C8 1 2 7 2 15c0 10 14 24 14 24s14-14 14-24C30 7 24 1 16 1z" fill="${color}" stroke="#fff" stroke-width="2.5"/><circle cx="16" cy="15" r="5.5" fill="#fff"/></svg>`,
  })
}

function Ajustar({ aliados }: { aliados: Aliado[] }) {
  const mapa = useMap()
  useEffect(() => {
    if (aliados.length === 0) mapa.setView(CENTRO, 12)
    else if (aliados.length === 1) mapa.setView([aliados[0].lat, aliados[0].lng], 14)
    else mapa.fitBounds(L.latLngBounds(aliados.map((a) => [a.lat, a.lng])), { paddingTopLeft: [30, 56], paddingBottomRight: [30, 20] })
  }, [aliados, mapa])
  return null
}

export default function MapaAliados({ aliados }: { aliados: Aliado[] }) {
  return (
    <MapContainer center={CENTRO} zoom={12} scrollWheelZoom={false} zoomControl={false} className="h-full w-full">
      <ZoomControl zoomInTitle="Acercar el mapa" zoomOutTitle="Alejar el mapa" />
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'
      />
      <Ajustar aliados={aliados} />
      {aliados.map((a) => (
        <Marker key={a.id} position={[a.lat, a.lng]} icon={icono(a.abierto24h)} title={a.nombre} alt={a.nombre}>
          <Popup>
            <p className="m-0 text-[13px] font-semibold text-cafe">{a.nombre}</p>
            <p className="m-0 text-xs text-cafe-suave">
              {a.zona} · {a.horario}
            </p>
            <a
              href={enlaceComoLlegar(a)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block min-h-11 py-2.5 text-[13px] font-semibold text-marca-azul underline"
            >
              Cómo llegar (se abre en otra pestaña)
            </a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
