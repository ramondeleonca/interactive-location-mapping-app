'use client'

import QRCode from 'qrcode'
import { LockKeyhole, MapPin, Radio, ScanLine } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { LiveMap, useOrigins } from '@/components/origin-map'

export default function Viewer() {
  const origins = useOrigins()
  const [qr, setQr] = useState('')
  useEffect(() => { QRCode.toDataURL(`${window.location.origin}/submit`, { width: 180, margin: 1, color: { dark: '#13251f', light: '#ffffffcc' } }).then(setQr) }, [])
  return <main className="map-shell"><LiveMap origins={origins} className="map-canvas" /><div className="viewer-brand"><span className="brand-mark"><MapPin size={16} /></span><span>ORIGINS</span></div><div className="live-pill"><Radio size={13} /> {origins.length} {origins.length === 1 ? 'origin' : 'origins'} live</div><div className="qr-card"><div className="qr-copy"><ScanLine size={15} /><span>Scan to add<br />your origin</span></div>{qr && <img src={qr} alt="QR code to add your origin" />}</div><Link href="/admin" className="lock-button" aria-label="Open admin"><LockKeyhole size={17} /></Link></main>
}
