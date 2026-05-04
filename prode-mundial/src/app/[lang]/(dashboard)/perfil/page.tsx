import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import AvatarUpload from '@/components/profile/AvatarUpload'
import ProfileForm from '@/components/profile/ProfileForm'
import DeleteAccountButton from '@/components/profile/DeleteAccountButton'
import { getDictionary, hasLocale } from '@/app/[lang]/dictionaries'
import { notFound } from 'next/navigation'

export default async function PerfilPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const t = await getDictionary(lang)

  await connection()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${lang}/login`)

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, avatar_url, first_name, last_name')
    .eq('id', user.id)
    .single()

  const username  = profile?.username   ?? user.email ?? 'Usuario'
  const firstName = profile?.first_name ?? ''
  const lastName  = profile?.last_name  ?? ''

  return (
    <div style={{ maxWidth: '480px' }}>
      <h1 style={{ fontWeight: 900, fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px' }}>
        {t.profile.title}
      </h1>

      <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ background: 'var(--bg-section-header)', padding: '8px 12px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
          {t.profile.photo}
        </div>
        <div style={{ padding: '16px' }}>
          <AvatarUpload currentUrl={profile?.avatar_url} username={username} />
        </div>
      </div>

      <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ background: 'var(--bg-section-header)', padding: '8px 12px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
          {t.profile.personalData}
        </div>
        <div style={{ padding: '16px' }}>
          <ProfileForm username={username} firstName={firstName} lastName={lastName} />
        </div>
      </div>

      <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ background: 'var(--bg-section-header)', padding: '8px 12px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
          {t.profile.account}
        </div>
        <div style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
            {t.profile.email}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
            {user.email}
          </div>
        </div>
      </div>

      <div style={{ border: '1px solid rgba(231,76,60,0.25)', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ background: 'rgba(231,76,60,0.06)', padding: '8px 12px', borderBottom: '1px solid rgba(231,76,60,0.2)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.3px', color: 'var(--live)' }}>
          Zona de peligro
        </div>
        <div style={{ padding: '16px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.5 }}>
            Podés eliminar tu cuenta permanentemente. Esta acción no se puede deshacer.
          </p>
          <DeleteAccountButton />
        </div>
      </div>
    </div>
  )
}
