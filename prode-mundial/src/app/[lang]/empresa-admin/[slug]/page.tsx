import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminJugadores from '@/components/admin/AdminJugadores'
import AdminConfig from '@/components/admin/AdminConfig'
import AdminWhitelist from '@/components/admin/AdminWhitelist'
import { connection } from 'next/server'

const SUPERADMIN_EMAIL = 'santiagodambrosio2@gmail.com'

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const tabStyle = (active: boolean): React.CSSProperties => ({
  padding: '8px 18px',
  fontSize: '13px',
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
  color: active ? 'var(--accent)' : 'var(--text-muted)',
  transition: 'color 0.15s',
})

export default async function EmpresaAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; lang: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { slug, lang } = await params
  const { tab = 'jugadores' } = await searchParams

  await connection()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${lang}/login?next=/empresa-admin/${slug}`)

  const isSuperAdmin = user.email === SUPERADMIN_EMAIL
  if (!isSuperAdmin) {
    const { data: adminEntry } = await adminClient
      .from('company_admins')
      .select('id')
      .eq('company_slug', slug)
      .eq('email', user.email!)
      .single()
    if (!adminEntry) redirect(`/${lang}`)
  }

  const { data: company } = await adminClient
    .from('companies')
    .select('slug, name, logo_url, banner_url, prode_id, primary_color, secondary_color, prode_name')
    .eq('slug', slug)
    .single()

  if (!company) redirect(`/${lang}`)

  const { data: prodeData } = await adminClient
    .from('prodes')
    .select('slug, description')
    .eq('id', company.prode_id)
    .maybeSingle()

  const prodeSlug = prodeData?.slug ?? null

  const { data: members } = await adminClient
    .from('prode_members')
    .select('user_id, area, status, role, spectator, profiles(username, first_name, last_name)')
    .eq('prode_id', company.prode_id)
    .eq('status', 'active')

  const memberIds = (members ?? []).map((m: any) => m.user_id)

  const { count: totalPickable } = await adminClient
    .from('matches')
    .select('id', { count: 'exact', head: true })
    .not('home_team', 'is', null)
    .not('away_team', 'is', null)
    .not('home_team', 'eq', 'A definir')
    .not('away_team', 'eq', 'A definir')

  const { data: pickCounts } = memberIds.length > 0
    ? await adminClient
        .from('picks')
        .select('user_id')
        .eq('prode_id', company.prode_id)
        .in('user_id', memberIds)
    : { data: [] }

  const pickCountMap = new Map<string, number>()
  for (const p of (pickCounts ?? [])) {
    pickCountMap.set(p.user_id, (pickCountMap.get(p.user_id) ?? 0) + 1)
  }

  const { data: leaderboard } = await adminClient
    .from('leaderboard')
    .select('user_id, total_points')
    .eq('prode_id', company.prode_id)

  const pointsMap = new Map((leaderboard ?? []).map((r: any) => [r.user_id, r.total_points]))

  const { data: authUsers } = memberIds.length > 0
    ? await adminClient.auth.admin.listUsers({ perPage: 1000 })
    : { data: { users: [] } }
  const emailMap = new Map<string, string>(
    ((authUsers as any)?.users ?? []).map((u: any) => [u.id as string, (u.email ?? '—') as string])
  )

  const jugadores = (members ?? []).map((m: any) => {
    const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles
    return {
      user_id: m.user_id,
      username: profile?.username ?? '—',
      first_name: profile?.first_name ?? '',
      last_name: profile?.last_name ?? '',
      email: emailMap.get(m.user_id) ?? '—',
      area: m.area ?? '—',
      picks: pickCountMap.get(m.user_id) ?? 0,
      puntos: pointsMap.get(m.user_id) ?? 0,
      role: m.role ?? 'player',
      spectator: m.spectator ?? false,
    }
  }).sort((a: any, b: any) => b.puntos - a.puntos)

  const { data: whitelist } = await adminClient
    .from('company_whitelist')
    .select('email, area, used')
    .eq('company_slug', slug)
    .order('used', { ascending: true })

  const { data: prizes } = await adminClient
    .from('prode_prizes')
    .select('position, description')
    .eq('prode_id', company.prode_id)
    .order('position', { ascending: true })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'Roboto, Arial, sans-serif' }}>
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '0 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0 0', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {company.logo_url && (
                <img src={company.logo_url} alt={company.name} style={{ height: '36px', objectFit: 'contain' }} />
              )}
              <div>
                <h1 style={{ fontWeight: 900, fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>{company.name}</h1>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>Panel de administración</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Link href={`/${lang}/empresa-admin/${slug}/guia`} style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'rgba(116,172,223,0.1)', border: '1px solid rgba(116,172,223,0.3)',
                color: 'var(--accent)', borderRadius: '6px', padding: '8px 14px',
                fontSize: '12px', fontWeight: 700, textDecoration: 'none',
                textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap',
              }}>
                Guía de uso
              </Link>
              {prodeSlug && (
                <Link href={`/${lang}/prode/${prodeSlug}`} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'var(--accent)', border: 'none',
                  color: '#fff', borderRadius: '6px', padding: '8px 16px',
                  fontSize: '12px', fontWeight: 700, textDecoration: 'none',
                  textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap',
                }}>
                  <span style={{ fontSize: '14px' }}>→</span> Ver vista general del Prode
                </Link>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '4px', marginTop: '12px' }}>
            <a href={`/${lang}/empresa-admin/${slug}?tab=jugadores`} style={{ textDecoration: 'none' }}>
              <div style={tabStyle(tab === 'jugadores')}>Jugadores</div>
            </a>
            <a href={`/${lang}/empresa-admin/${slug}?tab=whitelist`} style={{ textDecoration: 'none' }}>
              <div style={tabStyle(tab === 'whitelist')}>Whitelist</div>
            </a>
            <a href={`/${lang}/empresa-admin/${slug}?tab=config`} style={{ textDecoration: 'none' }}>
              <div style={tabStyle(tab === 'config')}>Configuración</div>
            </a>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 24px' }}>
        {tab === 'jugadores' && (
          <AdminJugadores jugadores={jugadores} prodeId={company.prode_id} companySlug={slug} totalMatches={totalPickable ?? 0} />
        )}
        {tab === 'whitelist' && (
          <AdminWhitelist whitelist={whitelist ?? []} companySlug={slug} />
        )}
        {tab === 'config' && (
          <AdminConfig
            companySlug={slug}
            currentName={company.prode_name ?? ''}
            currentDescription={prodeData?.description ?? ''}
            currentPrimary={company.primary_color ?? ''}
            currentSecondary={company.secondary_color ?? ''}
            currentLogo={company.logo_url ?? ''}
            currentBanner={company.banner_url ?? ''}
            prodeId={company.prode_id}
            initialPrizes={prizes ?? []}
          />
        )}
      </div>
    </div>
  )
}
