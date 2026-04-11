import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST /api/empresa/whitelist
// Body: multipart/form-data con campos: company_slug, file (CSV)
// CSV formato: email,area  (header obligatorio)
export async function POST(request: NextRequest) {
  const syncSecret = request.headers.get('x-sync-secret')
  if (syncSecret !== process.env.SYNC_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const formData = await request.formData()
  const companySlug = formData.get('company_slug') as string
  const file = formData.get('file') as File

  if (!companySlug || !file) {
    return NextResponse.json({ error: 'Faltan campos: company_slug y file' }, { status: 400 })
  }

  // Verificar que la empresa existe
  const { data: company } = await adminClient
    .from('companies')
    .select('slug')
    .eq('slug', companySlug)
    .single()

  if (!company) {
    return NextResponse.json({ error: `Empresa '${companySlug}' no encontrada` }, { status: 404 })
  }

  const text = await file.text()
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

  if (lines.length < 2) {
    return NextResponse.json({ error: 'CSV vacío o sin datos' }, { status: 400 })
  }

  // Validar header
  const header = lines[0].toLowerCase()
  if (!header.includes('email')) {
    return NextResponse.json({ error: 'El CSV debe tener una columna "email"' }, { status: 400 })
  }

  const cols = lines[0].split(',').map(c => c.trim().toLowerCase())
  const emailIdx = cols.indexOf('email')
  const areaIdx  = cols.indexOf('area')

  const rows = lines.slice(1).map(line => {
    const parts = line.split(',').map(p => p.trim())
    const email = parts[emailIdx]?.toLowerCase()
    const area  = areaIdx >= 0 ? parts[areaIdx] || null : null
    return { company_slug: companySlug, email, area }
  }).filter(r => r.email && r.email.includes('@'))

  if (rows.length === 0) {
    return NextResponse.json({ error: 'No se encontraron emails válidos en el CSV' }, { status: 400 })
  }

  // Upsert — si el mail ya existe para esa empresa, actualiza el área
  const { error, count } = await adminClient
    .from('company_whitelist')
    .upsert(rows, { onConflict: 'company_slug,email', ignoreDuplicates: false })
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, imported: rows.length })
}
