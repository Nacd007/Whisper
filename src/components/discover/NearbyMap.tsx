'use client'
import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Coords } from '@/hooks/useLocation'
import 'leaflet/dist/leaflet.css'

const youIcon = L.divIcon({
  className: '',
  html: `<div style="width:14px;height:14px;background:#0ea5e9;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 8px #0ea5e925"></div>`,
  iconSize: [14, 14], iconAnchor: [7, 7],
})

function Recenter({ coords }: { coords: Coords }) {
  const map = useMap()
  useEffect(() => { map.setView([coords.lat, coords.lng], 14) }, [coords, map])
  return null
}

export default function NearbyMap({ userCoords }: { userCoords: Coords | null }) {
  const center: [number, number] = userCoords ? [userCoords.lat, userCoords.lng] : [5.6037, -0.1870]
  return (
    <div className="mx-4 rounded-2xl overflow-hidden border border-dark-400" style={{ height: 200 }}>
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false} attributionControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {userCoords && (
          <>
            <Recenter coords={userCoords} />
            <Marker position={[userCoords.lat, userCoords.lng]} icon={youIcon} />
            <Circle center={[userCoords.lat, userCoords.lng]} radius={5000} pathOptions={{ color: '#0ea5e9', fillOpacity: 0.05, weight: 1 }} />
          </>
        )}
      </MapContainer>
    </div>
  )
}
