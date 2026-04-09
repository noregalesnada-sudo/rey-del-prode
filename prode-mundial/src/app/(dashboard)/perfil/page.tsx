import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AvatarUpload from '@/components/profile/AvatarUpload'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, avatar_url')
    .eq('id', user.id)
    .single()

  const username = profile?.username ?? user.email ?? 'Usuario'

  return (
    <div style={{ maxWidth: '480px' }}>
      <h1 style={{ fontWeight: 900, fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px' }}>
        Mi Perfil
      </h1>

      {/* Foto de perfil */}
      <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{
          background: 'var(--bg-section-header)', padding: '8px 12px',
          borderBottom: '1px solid var(--border)',
          fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.3px',
        }}>
          Foto de Perfil
        </div>
        <div style={{ padding: '16px' }}>
          <AvatarUpload currentUrl={profile?.avatar_url} username={username} />
        </div>
      </div>

      {/* Info de cuenta */}
      <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{
          background: 'var(--bg-section-header)', padding: '8px 12px',
          borderBottom: '1px solid var(--border)',
          fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.3px',
        }}>
          Datos de Cuenta
        </div>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
              Usuario
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {username}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
              Email
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
              {user.email}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
