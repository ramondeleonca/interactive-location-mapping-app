'use client'

import 'leaflet/dist/leaflet.css'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import { LocateFixed } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export type Origin = { id: string; latitude: number; longitude: number; created_at: string }

const markerIcon = L.divIcon({ className: 'origin-marker', html: '<span></span>', iconSize: [18, 18], iconAnchor: [9, 9] })
const centerIcon = L.divIcon({ className: 'center-pin', html: '<span></span>', iconSize: [34, 42], iconAnchor: [17, 60] })

function WorldCenterControl() {
  const map = useMap()
  return <button type="button" className="map-center-button" aria-label="Center map on the world" onClick={() => map.flyTo([20, 0], 2, { duration: 0.7 })}><LocateFixed size={17} /></button>
}

function MapCenterListener({ onChange, event = 'moveend' }: { onChange: (value: [number, number]) => void; event?: 'move' | 'moveend' }) {
  const map = useMap()
  useEffect(() => {
    const handler = () => { const c = map.getCenter(); onChange([Number(c.lat.toFixed(5)), Number(c.lng.toFixed(5))]) }
    map.on(event, handler)
    return () => { map.off(event, handler) }
  }, [event, map, onChange])
  return null
}

export function LiveMap({ origins, className = '' }: { origins: Origin[]; className?: string }) {
  return (
    <MapContainer center={[20, 0]} zoom={2} minZoom={2} maxZoom={18} worldCopyJump className={className} zoomControl attributionControl={false}>
      <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}?v=4" />
      <WorldCenterControl />
      {origins.map((origin) => <Marker key={origin.id} position={[origin.latitude, origin.longitude]} icon={markerIcon} />)}
    </MapContainer>
  )
}

export function PlacementMap({ onPosition }: { onPosition: (value: [number, number]) => void }) {
  const [position, setPosition] = useState<[number, number]>([20, 0])
  const handlePosition = useCallback((value: [number, number]) => { setPosition(value); onPosition(value) }, [onPosition])
  return (
    <div className="placement-map">
      <MapContainer center={position} zoom={2} minZoom={2} maxZoom={18} worldCopyJump className="map-canvas" zoomControl attributionControl={false}>
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}?v=4" />
        <MapCenterListener onChange={handlePosition} event="move" />
      </MapContainer>
      <div className="center-pin-overlay" aria-hidden="true"><span /></div>
    </div>
  )
}

export function useOrigins() {
  const supabase = useMemo(() => createClient(), [])
  const [origins, setOrigins] = useState<Origin[]>([])
  useEffect(() => {
    let mounted = true
    supabase.from('origins').select('id, latitude, longitude, created_at').order('created_at', { ascending: true }).then(({ data }) => { if (mounted && data) setOrigins(data as Origin[]) })
    const channel = supabase.channel('origins-live').on('postgres_changes', { event: '*', schema: 'public', table: 'origins' }, (payload) => {
      if (payload.eventType === 'INSERT') setOrigins((current) => current.some((item) => item.id === payload.new.id) ? current : [...current, payload.new as Origin])
      if (payload.eventType === 'DELETE') setOrigins((current) => current.filter((item) => item.id !== payload.old.id))
      if (payload.eventType === 'UPDATE') setOrigins((current) => current.map((item) => item.id === payload.new.id ? payload.new as Origin : item))
    }).subscribe()
    return () => { mounted = false; supabase.removeChannel(channel) }
  }, [supabase])
  return origins
}

export { centerIcon }
