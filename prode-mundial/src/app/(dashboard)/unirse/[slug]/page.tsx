import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { joinProde } from '@/lib/actions/prodes'
import { redirect } from 'next/navigation'
import { Trophy, Users, Lock } from 'lucide-react'

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function UnirseProdePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/unirse/${slug}`)

  // adminClient para bypassear RLS — el invitado aún no es miembro del prode
  const { data: prode } = await adminClient
    .from('prodes')
    .select('id, name, description, owner_id, requires_approval, profiles(username)')
    .eq('slug', slug)
    .single()

  if (!prode) {
    return (
      <div style={{ maxWidth: '400px', textAlign: 'center', paddingTop: '40px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Este prode no existe o el link no es válido.</p>
      </div>
    )
  }

  // Si ya es miembro, redirigir directo al prode
  const { data: membership } = await supabase
    .from('prode_members')
    .select('role')
    .eq('prode_id', prode.id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (membership) redirect(`/prode/${slug}`)

  const owner = Array.isArray(prode.profiles) ? prode.profiles[0] : prode.profiles

  async function joinAction() {
    'use server'
    await joinProde(slug)
  }

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
          <span>Creado por <strong style={{ color: 'var(--accent)' }}>{(owner as { username: string } | null)?.username ?? 'usuario'}</strong></span>
        </div>

        {(prode as { requires_approval?: boolean }).requires_approval && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#FFD700', fontSize: '12px', marginBottom: '20px', fontWeight: 600 }}>
            <Lock size={13} />
            Este prode requiere aprobación del admin
          </div>
        )}
        {!(prode as { requires_approval?: boolean }).requires_approval && (
          <div style={{ marginBottom: '20px' }} />
        )}

        <form action={joinAction}>
          <button
            type="submit"
            style={{
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '12px 32px',
              fontWeight: 700,
              fontSize: '14px',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Unirme al Prode
          </button>
        </form>
      </div>
    </div>
  )
}
