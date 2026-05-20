import { createClient as createAdmin } from '@supabase/supabase-js'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { connection } from 'next/server'
import Link from 'next/link'
import { requestToJoinEnterprise } from '@/lib/actions/enterprise'
import { Clock } from 'lucide-react'
import { getDictionary, hasLocale } from '@/app/[lang]/dictionaries'

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function EmpresaPage({ params }: { params: Promise<{ empresa: string; lang: string }> }) {
  const { empresa, lang } = await params

  const locale = hasLocale(lang) ? lang : 'es'
  const t = (await getDictionary(locale)).enterprisePage

  const { data: company } = await adminClient
    .from('companies')
    .select('slug, name, logo_url, banner_url, prode_id, primary_color, secondary_color, access_mode')
    .eq('slug', empresa)
    .eq('active', true)
    .single()

  if (!company) notFound()

  const accessMode: string = (company as any).access_mode ?? 'whitelist'
  const allowsInviteLink = accessMode === 'invite_link' || accessMode === 'both'

  let prodeSlug: string | null = null
  if (company.prode_id) {
    const { data: prodeData } = await adminClient
      .from('prodes')
      .select('slug')
      .eq('id', company.prode_id)
      .single()
    prodeSlug = prodeData?.slug ?? null
  }

  await connection()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let membershipStatus: string | null = null
  if (user && company.prode_id) {
    const { data: membership } = await adminClient
      .from('prode_members')
      .select('status')
      .eq('prode_id', company.prode_id)
      .eq('user_id', user.id)
      .maybeSingle()
    membershipStatus = membership?.status ?? null
  }

  if (membershipStatus === 'active' && prodeSlug) {
    redirect(`/${lang}/prode/${prodeSlug}`)
  }

  const loginNext = prodeSlug ? `/${lang}/login?next=/${lang}/${empresa}` : `/${lang}/login`

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      fontFamily: 'Roboto, Arial, sans-serif',
      position: 'relative',
    }}>
      {(company.primary_color || company.secondary_color) && (
        <style>{`
          :root {
            ${company.primary_color   ? `--accent: ${company.primary_color};`            : ''}
            ${company.secondary_color ? `--accent-secondary: ${company.secondary_color};` : ''}
          }
        `}</style>
      )}
      <img src="/estadio.jpg" alt="" aria-hidden="true" style={{
        position: 'fixed', inset: 0, width: '100%', height: '100%',
        objectFit: 'cover', objectPosition: 'center 40%',
        opacity: 0.07, filter: 'blur(3px) saturate(0.6)', zIndex: 0, pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {company.logo_url && (
            <>
              <img src={company.logo_url} alt={company.name} style={{ height: '72px', objectFit: 'contain' }} />
              <div style={{ width: '1px', height: '48px', background: 'rgba(116,172,223,0.3)' }} />
            </>
          )}
          <img src="/escudo.png" alt="Rey del Prode" style={{ height: '72px', objectFit: 'contain' }} />
        </div>

        <h1 style={{ fontWeight: 900, fontSize: 'clamp(22px, 4vw, 36px)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
          {t.title}
        </h1>
        <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '16px', marginBottom: '40px', textAlign: 'center' }}>
          {company.name}
        </p>

        <div style={{ width: '100%', maxWidth: '380px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '32px 28px' }}>

          {membershipStatus === 'pending' ? (
            <div style={{ textAlign: 'center' }}>
              <Clock size={36} style={{ color: '#FFD700', marginBottom: '14px' }} />
              <h2 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>{t.pendingTitle}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6 }}>
                {t.pendingDesc.replace('{company}', company.name)}<br /><br />
                {t.pendingFooter}
              </p>
            </div>

          ) : user && allowsInviteLink && !membershipStatus ? (
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', marginBottom: '24px', lineHeight: 1.6 }}>
                {t.requestDesc}
              </p>
              <form action={requestToJoinEnterprise} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input type="hidden" name="company_slug" value={empresa} />
                <input type="hidden" name="prode_id" value={company.prode_id ?? ''} />
                <input type="hidden" name="lang" value={lang} />
                <button type="submit" style={{
                  display: 'block', width: '100%', textAlign: 'center',
                  background: 'var(--accent)', color: '#fff',
                  padding: '12px', borderRadius: '6px',
                  fontWeight: 700, fontSize: '14px', border: 'none',
                  textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer',
                }}>
                  {t.requestBtn}
                </button>
              </form>
            </div>

          ) : (
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', marginBottom: '24px', lineHeight: 1.6 }}>
                {allowsInviteLink ? t.descInvite : t.descWhitelist}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link href={`/${lang}/${empresa}/register`} style={{
                  display: 'block', textAlign: 'center',
                  background: 'var(--accent)', color: '#fff',
                  padding: '12px', borderRadius: '6px',
                  fontWeight: 700, fontSize: '14px', textDecoration: 'none',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>
                  {t.register}
                </Link>
                <Link href={loginNext} style={{
                  display: 'block', textAlign: 'center',
                  background: 'transparent', color: 'var(--accent)',
                  padding: '12px', borderRadius: '6px',
                  fontWeight: 700, fontSize: '14px', textDecoration: 'none',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                  border: '2px solid var(--accent)',
                }}>
                  {t.login}
                </Link>
              </div>
            </div>
          )}
        </div>

        <p style={{ marginTop: '40px', fontSize: '12px', color: 'rgba(116,172,223,0.4)' }}>
          {t.poweredBy} <strong style={{ color: 'rgba(116,172,223,0.6)' }}>Rey del Prode</strong>
        </p>
      </div>
    </div>
  )
}
