import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { Trophy, Users, Lock } from 'lucide-react'
import JoinProdeButton from '@/components/prode/JoinProdeButton'
import { getDictionary, hasLocale } from '@/app/[lang]/dictionaries'
import { notFound } from 'next/navigation'

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function UnirseProdePage({ params }: { params: Promise<{ slug: string; lang: string }> }) {
  const { slug, lang } = await params
  if (!hasLocale(lang)) notFound()
  const t = await getDictionary(lang)

  await connection()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${lang}/login?next=/unirse/${slug}`)

  const { data: prode } = await adminClient
    .from('prodes')
    .select('id, name, description, owner_id, requires_approval, profiles(username)')
    .eq('slug', slug)
    .single()

  if (!prode) {
    return (
      <div style={{ maxWidth: '400px', textAlign: 'center', paddingTop: '40px' }}>
        <p style={{ color: 'var(--text-muted)' }}>{t.joinProde.notFound}</p>
      </div>
    )
  }

  const { data: membership } = await supabase
    .from('prode_members')
    .select('role')
    .eq('prode_id', prode.id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (membership) redirect(`/${lang}/prode/${slug}`)

  const owner = Array.isArray(prode.profiles) ? prode.profiles[0] : prode.profiles

  return (
    <div style={{ maxWidth: '420px', paddingTop: '20px' }}>
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '32px 28px', textAlign: 'center' }}>
        <Trophy size={36} style={{ color: 'var(--accent)', marginBottom: '16px' }} />

        <h1 style={{ fontWeight: 900, fontSize: '20px', letterSpacing: '0.5px', marginBottom: '8px' }}>
          {prode.name}
        </h1>

        {prode.description && (
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
            {prode.description}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px', marginBottom: '12px' }}>
          <Users size={14} />
          <span>{t.joinProde.createdBy} <strong style={{ color: 'var(--accent)' }}>{(owner as { username: string } | null)?.username ?? 'usuario'}</strong></span>
        </div>

        {(prode as { requires_approval?: boolean }).requires_approval && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#FFD700', fontSize: '12px', marginBottom: '20px', fontWeight: 600 }}>
            <Lock size={13} />
            {t.joinProde.requiresApproval}
          </div>
        )}
        {!(prode as { requires_approval?: boolean }).requires_approval && (
          <div style={{ marginBottom: '20px' }} />
        )}

        <JoinProdeButton slug={slug} />
      </div>
    </div>
  )
}
