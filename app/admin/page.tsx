'use client'

import Link from 'next/link'
import { ArrowLeft, Check, LockKeyhole, Pencil, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import type { Origin } from '@/components/origin-map'
const LiveMap = dynamic(() => import('@/components/origin-map').then((module) => module.LiveMap), { ssr: false })

const callAdmin = (body: object) => fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then((response) => response.json())

export default function AdminPage() {
  const [passcode, setPasscode] = useState('')
  const [authorized, setAuthorized] = useState(false)
  const [origins, setOrigins] = useState<Origin[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<[number, number]>([0, 0])
  const [error, setError] = useState('')

  const load = async (code = passcode) => {
    const result = await callAdmin({ action: 'list', passcode: code })
    if (result.error) { setError(result.error); return false }
    setOrigins(result.data || []); setAuthorized(true); return true
  }
  useEffect(() => { if (typeof window === 'undefined') return; const code = window.sessionStorage.getItem('origins-admin'); if (code) { setPasscode(code); void load(code) } }, [])
  const login = async (event: React.FormEvent) => { event.preventDefault(); if (await load() && typeof window !== 'undefined') window.sessionStorage.setItem('origins-admin', passcode) }
  const mutate = async (body: object) => { await callAdmin({ ...body, passcode }); await load() }

  if (!authorized) return <main className="admin-login"><div className="login-card"><div className="login-icon"><LockKeyhole /></div><p className="eyebrow">ORIGINS / ADMIN</p><h1>Keep the map true.</h1><p>Enter the shared passcode to manage the locations on this map.</p><form onSubmit={login}><input aria-label="Admin passcode" type="password" value={passcode} onChange={(event) => setPasscode(event.target.value)} placeholder="Shared passcode" /><button type="submit">Unlock</button></form>{error && <span className="form-error">{error}</span>}<Link href="/" className="text-link"><ArrowLeft size={15} /> Return to map</Link></div></main>

  return <main className="admin-shell"><header className="admin-header"><Link href="/" className="back-button" aria-label="Back to map"><ArrowLeft size={18} /></Link><div><p className="eyebrow">ORIGINS / ADMIN</p><h1>Map control room</h1></div><button className="outline-button" onClick={() => { window.sessionStorage.removeItem('origins-admin'); setAuthorized(false) }}>Lock</button></header><section className="admin-grid"><div className="admin-preview"><div className="preview-label">LIVE PREVIEW <span>{origins.length} pins</span></div><LiveMap origins={origins} className="preview-map" /></div><div className="origin-list"><div className="list-heading"><div><p className="eyebrow">SUBMISSIONS</p><h2>Every origin</h2></div><button className="danger-button" onClick={() => mutate({ action: 'deleteAll' })}><Trash2 size={15} /> Clear all</button></div>{origins.length === 0 ? <div className="empty-state">No origins yet.<br />Share the QR code to begin.</div> : origins.map((origin) => <div className="origin-row" key={origin.id}>{editing === origin.id ? <><input aria-label="Latitude" value={draft[0]} onChange={(e) => setDraft([Number(e.target.value), draft[1]])} /><input aria-label="Longitude" value={draft[1]} onChange={(e) => setDraft([draft[0], Number(e.target.value)])} /><button onClick={() => { void mutate({ action: 'update', id: origin.id, latitude: draft[0], longitude: draft[1] }); setEditing(null) }} aria-label="Save edit"><Check size={16} /></button><button onClick={() => setEditing(null)} aria-label="Cancel edit"><X size={16} /></button></> : <><div className="origin-coords"><strong>{origin.latitude.toFixed(4)}°</strong><span>{origin.longitude.toFixed(4)}°</span></div><span className="origin-date">{new Date(origin.created_at).toLocaleDateString()}</span><button onClick={() => { setEditing(origin.id); setDraft([origin.latitude, origin.longitude]) }} aria-label="Edit origin"><Pencil size={15} /></button><button onClick={() => void mutate({ action: 'delete', id: origin.id })} aria-label="Delete origin"><Trash2 size={15} /></button></>}</div>)}</div></section></main>
}
