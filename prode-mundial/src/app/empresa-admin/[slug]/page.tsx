import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import AdminJugadores from '@/components/admin/AdminJugadores'
import AdminConfig from '@/components/admin/AdminConfig'
import AdminWhitelist from '@/components/admin/AdminWhitelist'

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
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { slug } = await params
  const { tab = 'jugadores' } = await searchParams

  // Verificar autenticación
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/empresa-admin/${slug}`)

  // Verificar acceso: superadmin o admin de esta empresa
  const isSuperAdmin = user.email === SUPERADMIN_EMAIL
  if (!isSuperAdmin) {
    const { data: adminEntry } = await adminClient
      .from('company_admins')
      .select('id')
      .eq('company_slug', slug)
      .eq('email', user.email!)
      .single()
    if (!adminEntry) redirect('/')
  }

  // Cargar empresa
  const { data: company } = await adminClient
    .from('companies')
    .select('slug, name, logo_url, banner_url, prode_id, primary_color, secondary_color, prode_name')
    .eq('slug', slug)
    .single()

  if (!company) redirect('/')

  // Cargar jugadores con puntos
  const { data: members } = await adminClient
    .from('prode_members')
    .select('user_id, area, status, profiles(username, first_name, last_name)')
    .eq('prode_id', company.prode_id)
    .eq('status', 'active')

  const memberIds = (members ?? []).map((m: any) => m.user_id)

  // Picks por jugador
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

  // Puntos del leaderboard
  const { data: leaderboard } = await adminClient
    .from('leaderboard')
    .select('user_id, total_points')
    .eq('prode_id', company.prode_id)

  const pointsMap = new Map((leaderboard ?? []).map((r: any) => [r.user_id, r.total_points]))

  // Emails desde auth.users
  const { data: authUsers } = memberIds.length > 0
    ? await adminClient.auth.admin.listUsers({ perPage: 1000 })
    : { data: { users: [] } }
  const emailMap = new Map(
    ((authUsers as any)?.users ?? []).map((u: any) => [u.id, u.email as string])
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
    }
  }).sort((a: any, b: any) => b.puntos - a.puntos)

  // Whitelist
  const { data: whitelist } = await adminClient
    .from('company_whitelist')
    .select('email, area, used')
    .eq('company_slug', slug)
    .order('used', { ascending: true })

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      fontFamily: 'Roboto, Arial, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0 0' }}>
            {company.logo_url && (
              <img src={company.logo_url} alt={company.name} style={{ height: '36px', objectFit: 'contain' }} />
            )}
            <div>
              <h1 style={{ fontWeight: 900, fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {company.name}
              </h1>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>Panel de administración</p>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px', marginTop: '12px' }}>
            <a href={`/empresa-admin/${slug}?tab=jugadores`} style={{ textDecoration: 'none' }}>
              <div style={tabStyle(tab === 'jugadores')}>Jugadores</div>
            </a>
            <a href={`/empresa-admin/${slug}?tab=whitelist`} style={{ textDecoration: 'none' }}>
              <div style={tabStyle(tab === 'whitelist')}>Whitelist</div>
            </a>
            <a href={`/empresa-admin/${slug}?tab=config`} style={{ textDecoration: 'none' }}>
              <div style={tabStyle(tab === 'config')}>Configuración</div>
            </a>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 24px' }}>
        {tab === 'jugadores' && (
          <AdminJugadores jugadores={jugadores} prodeId={company.prode_id} companySlug={slug} />
        )}
        {tab === 'whitelist' && (
          <AdminWhitelist whitelist={whitelist ?? []} companySlug={slug} />
        )}
        {tab === 'config' && (
          <AdminConfig
            companySlug={slug}
            currentName={company.prode_name ?? ''}
            currentPrimary={company.primary_color ?? ''}
            currentSecondary={company.secondary_color ?? ''}
            currentLogo={company.logo_url ?? ''}
            currentBanner={company.banner_url ?? ''}
          />
        )}
      </div>
    </div>
  )
}
