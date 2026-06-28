'use client'
import { useState } from 'react'

export type Coords = { lat: number; lng: number; label: string }

export function useLocation() {
  const [coords, setCoords] = useState<Coords | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function getLocation(): Promise<Coords> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) { reject(new Error('Not supported')); return }
      setLoading(true)
      navigator.geolocation.getCurrentPosition(async pos => {
        const { latitude: lat, longitude: lng } = pos.coords
        let label = `${lat.toFixed(4)}, ${lng.toFixed(4)}`
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, { headers: { 'Accept-Language': 'en' } })
          const d = await r.json()
          label = d.display_name?.split(',').slice(0, 2).join(',') ?? label
        } catch { /* use coords */ }
        const result = { lat, lng, label }
        setCoords(result)
        setLoading(false)
        resolve(result)
      }, err => { setError(err.message); setLoading(false); reject(err) }, { enableHighAccuracy: true, timeout: 10000 })
    })
  }

  return { coords, loading, error, getLocation }
}
