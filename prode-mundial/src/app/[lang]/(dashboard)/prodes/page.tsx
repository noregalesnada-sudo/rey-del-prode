import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { connection } from 'next/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Trophy, Plus } from 'lucide-react'
import { hasLocale } from '@/app/[lang]/dictionaries'

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function ProdesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()

  await connection()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${lang}/login`)

  const { data: rows } = await supabase
    .from('prode_members')
    .select('prodes(id, slug, name)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('joined_at', { ascending: true })

  const prodesRaw = (rows ?? [])
    .map((m: { prodes: { id: string; slug: string; name: string } | { id: string; slug: string; name: string }[] | null }) => {
      const p = Array.isArray(m.prodes) ? m.prodes[0] : m.prodes
      return p ? { id: p.id, slug: p.slug, name: p.name } : null
    })
    .filter(Boolean) as { id: string; slug: string; name: string }[]

  // Color y nombre propios de los prodes enterprise.
  const prodeIds = prodesRaw.map((p) => p.id)
  const { data: companies } = prodeIds.length > 0
    ? await adminClient.from('companies').select('prode_id, prode_name, primary_color').in('prode_id', prodeIds)
    : { data: [] as { prode_id: string; prode_name: string | null; primary_color: string | null }[] }
  const companyMap = new Map(
    (companies ?? []).map((c: { prode_id: string; prode_name: string | null; primary_color: string | null }) => [c.prode_id, c])
  )

  const prodes = prodesRaw.map((p) => {
    const co = companyMap.get(p.id)
    return { slug: p.slug, name: co?.prode_name || p.name, color: co?.primary_color ?? undefined }
  })

  const en = lang === 'en'
  const lp = (p: string) => `/${lang}${p}`

  return (
    <div style={{ maxWidth: 980, margin: '0 auto' }}>
      <h1 style={{ fontSize: 18, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>
        {en ? 'Your pools' : 'Tus prodes'}
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {prodes.map((p) => {
          const c = p.color
          return (
            <Link
              key={p.slug}
              href={lp(`/prode/${p.slug}`)}
              style={{
                background: 'linear-gradient(160deg,#0e2f5e,#0b2348)', border: `1px solid ${c ? c + '88' : 'var(--border-light)'}`,
                borderRadius: 16, padding: '16px 16px', boxShadow: c ? `0 8px 22px ${c}33` : '0 8px 22px rgba(0,0,0,.3)',
                textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <Trophy size={20} color={c ?? '#fad54a'} />
                <span style={{ fontSize: 17, fontWeight: 900 }}>{p.name}</span>
              </div>
              <span style={{ display: 'block', textAlign: 'center', background: c ? c + '22' : 'rgba(116,172,223,.14)', border: `1px solid ${c ?? 'var(--accent)'}`, color: c ?? 'var(--accent-light)', borderRadius: 11, padding: 11, fontSize: 13.5, fontWeight: 800 }}>
                {en ? 'See table & picks →' : 'Ver tabla y pronósticos →'}
              </span>
            </Link>
          )
        })}

        <Link
          href={lp('/crear-prode')}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
            border: '1.5px dashed var(--border-light)', borderRadius: 16, background: 'rgba(255,255,255,.02)',
            padding: 24, color: 'var(--accent-light)', textDecoration: 'none', minHeight: 120,
          }}
        >
          <span style={{ width: 42, height: 42, borderRadius: '50%', border: '1.5px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={22} />
          </span>
          <span style={{ fontSize: 13.5, fontWeight: 700, textAlign: 'center' }}>
            {en ? 'Join or create a pool' : 'Unirme o crear un prode'}
          </span>
        </Link>
      </div>
    </div>
  )
}
