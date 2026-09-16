'use client'

import Link from 'next/link'
import { ArrowLeft, Check, MapPin, Send } from 'lucide-react'
import { useState } from 'react'
import dynamic from 'next/dynamic'
const PlacementMap = dynamic(() => import('@/components/origin-map').then((module) => module.PlacementMap), { ssr: false })
import { createClient } from '@/lib/supabase/client'

export default function SubmitPage() {
  const [position, setPosition] = useState<[number, number]>([20, 0])
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const save = async () => {
    setSaving(true)
    const { error } = await createClient().from('origins').insert({ latitude: position[0], longitude: position[1] })
    setSaving(false)
    if (!error) setSaved(true)
  }
  return <main className="submit-shell">
    <PlacementMap onPosition={setPosition} />
    <Link href="/" className="back-button" aria-label="Back to map"><ArrowLeft size={18} /></Link>
    <div className="placement-instruction"><span className="instruction-icon"><MapPin size={16} /></span><div><strong>Where are you from?</strong><span>Move the map until the pin lands on your home.</span></div></div>
    <div className="coordinate-readout"><span>{position[0].toFixed(5)}°</span><span>{position[1].toFixed(5)}°</span></div>
    <div className="save-wrap">{saved ? <div className="saved-message"><Check size={18} /> Your origin is on the map</div> : <button className="save-button" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Place my origin'} <Send size={16} /></button>}<small>No name, email, or exact address is collected.</small></div>
  </main>
}
