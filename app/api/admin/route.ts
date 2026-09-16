import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const passcode = 'Bruno"Samuel'

export async function POST(request: Request) {
  const body = await request.json()
  if (body.passcode !== passcode) return NextResponse.json({ error: 'Invalid passcode' }, { status: 401 })
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return NextResponse.json({ error: 'Admin database is not configured' }, { status: 500 })
  const admin = createClient(url, key)
  if (body.action === 'list') {
    const { data, error } = await admin.from('origins').select('id, latitude, longitude, created_at').order('created_at', { ascending: false })
    return NextResponse.json({ data, error: error?.message })
  }
  if (body.action === 'delete') await admin.from('origins').delete().eq('id', body.id)
  if (body.action === 'deleteAll') await admin.from('origins').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (body.action === 'update') await admin.from('origins').update({ latitude: body.latitude, longitude: body.longitude }).eq('id', body.id)
  return NextResponse.json({ ok: true })
}
