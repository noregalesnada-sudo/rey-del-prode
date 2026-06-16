import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { getCachedMatches, getCachedLeaderboard } from '@/lib/cached-queries'
import { Clock } from 'lucide-react'
import MatchSection from '@/components/matches/MatchSection'
import { fetchWorldCupOdds, oddsForMatch } from '@/lib/odds-api'
import { getProdePickDistributions } from '@/lib/pick-distribution'
import ProdeMatchesSection from '@/components/prode/ProdeMatchesSection'
import Leaderboard from '@/components/prode/Leaderboard'
import InviteLink from '@/components/prode/InviteLink'
import PrizesSection from '@/components/prode/PrizesSection'
import PendingMembers from '@/components/prode/PendingMembers'
import ProdeBannerUpload from '@/components/prode/ProdeBannerUpload'
import ProdeSettings from '@/components/prode/ProdeSettings'
import { type Match } from '@/components/matches/MatchCard'
import { savePick, clearPick } from '@/lib/actions/picks'
import { translateTeam } from '@/lib/team-names'
import AreaLeaderboard from '@/components/prode/AreaLeaderboard'
import ProdePlayerStats from '@/components/prode/ProdePlayerStats'
import ProdeTabs from '@/components/prode/ProdeTabs'
import ChampionPickSelector from '@/components/champion/ChampionPickSelector'
import RealtimeRefresh from '@/components/prode/RealtimeRefresh'
import { connection } from 'next/server'
import { getDictionary, hasLocale } from '@/app/[lang]/dictionaries'
import { notFound } from 'next/navigation'

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function ProdePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; lang: string }>
  searchParams: Promise<{ pago?: string; tab?: string }>
}) {
  const { slug, lang } = await params
  if (!hasLocale(lang)) notFound()
  const t = await getDictionary(lang)
  const { pago, tab } = await searchParams
  const initialProdeTab: 'tabla' | 'partidos' = tab === 'partidos' ? 'partidos' : 'tabla'

  await connection()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${lang}/login`)

  // Batch 1: datos que solo necesitan user.id o son independientes
  const [prodeRes, matches, defaultPicksRes] = await Promise.all([
    adminClient
      .from('prodes')
      .select('id, name, description, description_es, description_en, owner_id, invite_code, requires_approval, plan, banner_url')
      .eq('slug', slug)
      .single(),
    getCachedMatches(),
    adminClient
      .from('default_picks')
      .select('match_id, home_pick, away_pick')
      .eq('user_id', user.id),
  ])

  const prode = prodeRes.data
  if (!prode) redirect(`/${lang}`)

  // Batch 2: todo lo que necesita prode.id — en paralelo
  const [
    linkedCompanyRes,
    membershipRes,
    prodePicksRes,
    leaderboard,
    activeMembersRes,
    prizesRes,
    prodeChampRes,
    defaultChampRes,
    tournamentRes,
  ] = await Promise.all([
    adminClient
      .from('companies')
      .select('slug, plan, primary_color, secondary_color, logo_url, banner_url, prode_name, areas_enabled, area_label')
      .eq('prode_id', prode.id)
      .maybeSingle(),
    adminClient
      .from('prode_members')
      .select('role, status, area, spectator')
      .eq('prode_id', prode.id)
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('picks')
      .select('match_id, home_pick, away_pick, points')
      .eq('user_id', user.id)
      .eq('prode_id', prode.id),
    getCachedLeaderboard(prode.id),
    adminClient
      .from('prode_members')
      .select('user_id')
      .eq('prode_id', prode.id)
      .eq('status', 'active')
      .eq('spectator', false),
    adminClient
      .from('prode_prizes')
      .select('position, description')
      .eq('prode_id', prode.id)
      .order('position', { ascending: true }),
    adminClient.from('champion_picks').select('team, points').eq('user_id', user.id).eq('prode_id', prode.id).maybeSingle(),
    adminClient.from('champion_picks').select('team').eq('user_id', user.id).is('prode_id', null).maybeSingle(),
    adminClient.from('tournament_settings').select('champion_team').eq('id', 1).maybeSingle(),
  ])

  const linkedCompany = linkedCompanyRes.data
  const membership = membershipRes.data
  if (!membership) redirect(`/${lang}`)

  if (membership.status === 'pending') {
    return (
      <div style={{ maxWidth: '420px', paddingTop: '40px', textAlign: 'center' }}>
        <Clock size={40} style={{ color: '#FFD700', marginBottom: '16px' }} />
        <h1 style={{ fontWeight: 900, fontSize: '18px', marginBottom: '8px' }}>{prode.name}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
          {t.prode.pendingApproval} <strong style={{ color: '#FFD700' }}>{t.prode.pendingBold}</strong>.<br />
          {t.prode.pendingDesc}
        </p>
      </div>
    )
  }

  const isEnterprise = linkedCompany?.plan === 'enterprise'
  const areasEnabled = (linkedCompany as any)?.areas_enabled ?? true
  const areaLabel = (linkedCompany as any)?.area_label ?? t.prode.areaDefault
  const isAdmin = membership.role === 'admin'
  const isSpectator = (membership as any).spectator ?? false
  const userArea = (membership as { role: string; status: string; area?: string | null }).area ?? null
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/unirse/${slug}`

  const prodeAny = prode as any
  const localizedDescription =
    lang === 'es'
      ? (prodeAny.description_es ?? prode.description ?? null)
      : (prodeAny.description_en ?? prodeAny.description_es ?? prode.description ?? null)

  const companyPrimary   = linkedCompany?.primary_color ?? null
  const companySecondary = linkedCompany?.secondary_color ?? null
  const companyLogo      = linkedCompany?.logo_url ?? null
  const companyBanner    = linkedCompany?.banner_url ?? null
  const displayName      = linkedCompany?.prode_name || prode.name

  const prodePicks = prodePicksRes.data
  const defaultPicks = defaultPicksRes.data
  const activeMembers = activeMembersRes.data
  const prizes = prizesRes.data

  // Nota: ya NO copiamos default_picks → picks al abrir el prode. La herencia de
  // "Mis Pronósticos" se muestra en pantalla (activePick más abajo) y se materializa
  // a la hora de puntuar (materializeDefaultPicksForMatch en el cron sync-matches),
  // así puntúa aunque el usuario nunca abra el prode. Esto deja la × solo en picks
  // realmente editados en este prode.

  const prodePicksMap = new Map(prodePicks?.map((p) => [p.match_id, p]) ?? [])
  const defaultPicksMap = new Map(defaultPicks?.map((p) => [p.match_id, p]) ?? [])

  const activeMemberIds = new Set((activeMembers ?? []).map((m: { user_id: string }) => m.user_id))
  const activeLeaderboard = leaderboard.filter((r) => activeMemberIds.has(r.user_id))
  const leaderboardUserIds = activeLeaderboard.map((r) => r.user_id)

  // Batch 3: datos que dependen del leaderboard + condicionales en paralelo
  const [profilesRes, pendingMembersRes, membersWithAreaRes, activeMembersWithUsernameRes] = await Promise.all([
    leaderboardUserIds.length > 0
      ? adminClient.from('profiles').select('id, avatar_url').in('id', leaderboardUserIds)
      : Promise.resolve({ data: [] as { id: string; avatar_url: string | null }[] }),
    isAdmin
      ? adminClient.from('prode_members').select('user_id, profiles(username)').eq('prode_id', prode.id).eq('status', 'pending')
      : Promise.resolve({ data: [] as { user_id: string; profiles: unknown }[] }),
    (isEnterprise && areasEnabled)
      ? adminClient.from('prode_members').select('user_id, area').eq('prode_id', prode.id).eq('status', 'active').not('area', 'is', null)
      : Promise.resolve({ data: [] as { user_id: string; area: string | null }[] }),
    isAdmin
      ? adminClient.from('prode_members').select('user_id, profiles(username)').eq('prode_id', prode.id).eq('status', 'active').eq('spectator', false)
      : Promise.resolve({ data: [] as { user_id: string; profiles: unknown }[] }),
  ])

  const profilesData = profilesRes.data
  const avatarMap = new Map((profilesData ?? []).map((p: { id: string; avatar_url: string | null }) => [p.id, p.avatar_url]))

  // El bonus de campeón ya viene sumado en total_points por la vista leaderboard.
  const leaderboardRows = activeLeaderboard.map((r) => ({
    ...r,
    avatar_url: avatarMap.get(r.user_id) ?? null,
    total_points: r.total_points ?? 0,
  }))

  const sortedLeaderboard = [...leaderboardRows].sort((a, b) => (b.total_points ?? 0) - (a.total_points ?? 0))
  const userLeaderboardEntry = sortedLeaderboard.find((r) => r.user_id === user.id)
  const userPosition = userLeaderboardEntry ? sortedLeaderboard.indexOf(userLeaderboardEntry) + 1 : 0
  const userProdePoints = userLeaderboardEntry?.total_points ?? 0
  const userProdeExact = userLeaderboardEntry?.exact_hits ?? 0
  const userProdePartial = userLeaderboardEntry?.partial_hits ?? 0

  const pendingMembers: { user_id: string; username: string }[] = (pendingMembersRes.data ?? []).map((r: { user_id: string; profiles: unknown }) => {
    const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
    return {
      user_id: r.user_id,
      username: (profile as { username?: string } | null)?.username ?? 'usuario',
    }
  })

  const kickableMembers: { user_id: string; username: string }[] = (activeMembersWithUsernameRes.data ?? [])
    .filter((r: { user_id: string }) => r.user_id !== user.id)
    .map((r: { user_id: string; profiles: unknown }) => {
      const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
      return {
        user_id: r.user_id,
        username: (profile as { username?: string } | null)?.username ?? 'usuario',
      }
    })

  const membersWithArea: { user_id: string; area: string | null }[] = membersWithAreaRes.data ?? []
  let areaRows: { area: string; miembros: number; promedio: number; total: number }[] = []
  let myAreaLeaderboard: typeof leaderboardRows = []

  if (isEnterprise && areasEnabled && membersWithArea.length > 0) {
    const areaMap = new Map<string, { userIds: string[] }>()
    for (const m of membersWithArea) {
      if (!m.area) continue
      if (!areaMap.has(m.area)) areaMap.set(m.area, { userIds: [] })
      areaMap.get(m.area)!.userIds.push(m.user_id)
    }
    for (const [area, { userIds }] of areaMap.entries()) {
      const members = leaderboardRows.filter((r) => userIds.includes(r.user_id))
      if (members.length === 0) continue
      const total = members.reduce((sum, r) => sum + (r.total_points ?? 0), 0)
      const promedio = total / members.length
      areaRows.push({ area, miembros: members.length, total, promedio })
    }
    areaRows.sort((a, b) => b.promedio - a.promedio)

    myAreaLeaderboard = userArea
      ? leaderboardRows.filter((r) => {
          const m = membersWithArea.find((x) => x.user_id === r.user_id)
          return m?.area === userArea
        })
      : []
  }

  const userChampionPick = prodeChampRes.data?.team ?? defaultChampRes.data?.team ?? null
  const officialChampion = tournamentRes.data?.champion_team ?? null

  const participatingTeams = [...new Set(
    (matches as any[]).flatMap((m) => [m.home_team, m.away_team])
      .filter((t: string | null) => t && t !== 'A definir' && t !== 'TBD')
      .map((t: string) => translateTeam(t, lang) || t)
  )].sort() as string[]

  // Cuotas (consenso). Aislado y tolerante a fallos.
  let oddsMap: Awaited<ReturnType<typeof fetchWorldCupOdds>> = new Map()
  try {
    oddsMap = await fetchWorldCupOdds()
  } catch {
    oddsMap = new Map()
  }

  // Distribución de picks del prode — solo partidos ya cerrados (15 min antes del inicio) y
  // no finalizados. Espeja el scoring (pick del prode ?? carga global). Tolerante a fallos.
  const lockedMatchIds = (matches as any[])
    .filter((m) => m.status !== 'finished' && (new Date(m.match_date).getTime() - Date.now()) / 60000 <= 15)
    .map((m) => m.id as string)
  const distMap = await getProdePickDistributions(prode.id, lockedMatchIds)

  const matchesFormatted: Match[] = (matches).map((m) => {
    const prodePick = prodePicksMap.get(m.id)
    const defaultPick = defaultPicksMap.get(m.id)
    const activePick = prodePick ?? defaultPick

    return {
      id: m.id,
      homeTeam: translateTeam(m.home_team, lang) || t.prode.tbd,
      awayTeam: translateTeam(m.away_team, lang) || t.prode.tbd,
      homeFlag: m.home_flag,
      awayFlag: m.away_flag,
      matchDate: m.match_date,
      status: m.status,
      homeScore: m.home_score,
      awayScore: m.away_score,
      minute: m.minute,
      group: m.group_name,
      phase: m.phase,
      userPickHome: activePick?.home_pick,
      userPickAway: activePick?.away_pick,
      userPoints: prodePick?.points,
      hasProdeOverride: !!prodePick,
      defaultPickHome: defaultPick?.home_pick,
      defaultPickAway: defaultPick?.away_pick,
      minutesUntilStart: (new Date(m.match_date).getTime() - Date.now()) / 60000,
      odds: (m.home_team && m.away_team) ? oddsForMatch(oddsMap, m.home_team, m.away_team) ?? undefined : undefined,
      distribution: distMap.get(m.id),
    }
  })

  const groupMatches = matchesFormatted.filter((m) => m.phase === 'groups')
  const knockoutMatches = matchesFormatted.filter((m) => m.phase !== 'groups' && m.status !== 'live')
  const liveMatches = matchesFormatted.filter((m) => m.status === 'live')

  const isPaidPlan = prode.plan === 'pro' || prode.plan === 'business' || isEnterprise

  return (
    <div {...(isEnterprise && (companyPrimary || companySecondary) ? { 'data-enterprise': 'true' } : {})} style={{ maxWidth: 900, margin: '0 auto' }}>
      <RealtimeRefresh prodeId={prode.id} />

      {isEnterprise && (companyPrimary || companySecondary) && (
        <style dangerouslySetInnerHTML={{ __html: `
          [data-enterprise="true"] {
            ${companyPrimary   ? `--accent: ${companyPrimary};`   : ''}
            ${companySecondary ? `--accent-secondary: ${companySecondary};` : ''}
          }
        `}} />
      )}

      {pago === 'ok' && (
        <div style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '14px', color: '#4ade80', fontWeight: 600 }}>
          {t.prode.paymentOk.replace('{plan}', prode.plan === 'business' ? 'Business' : 'Pro')}
        </div>
      )}
      {pago === 'error' && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '14px', color: '#ef4444' }}>
          {t.prode.paymentError}
        </div>
      )}

      {isEnterprise && isAdmin && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
          <ProdeSettings
            prodeId={prode.id}
            currentName={prode.name}
            currentDescriptionEs={prodeAny.description_es ?? prode.description ?? ''}
            currentDescriptionEn={prodeAny.description_en ?? ''}
            enterpriseAdminUrl={linkedCompany?.slug ? `/empresa-admin/${linkedCompany.slug}` : undefined}
          />
        </div>
      )}

      {isEnterprise && companyBanner && (
        <div style={{ marginBottom: '20px', borderRadius: '8px', overflow: 'hidden', aspectRatio: '3 / 1' }}>
          <img src={companyBanner} alt={t.prode.bannerAlt} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center', display: 'block' }} />
        </div>
      )}

      {!isEnterprise && isPaidPlan && isAdmin && (
        <ProdeBannerUpload prodeId={prode.id} currentUrl={prode.banner_url} />
      )}
      {!isEnterprise && isPaidPlan && !isAdmin && prode.banner_url && (
        <div style={{ marginBottom: '20px', borderRadius: '8px', overflow: 'hidden', aspectRatio: '3 / 1', position: 'relative' }}>
          <img src={prode.banner_url} alt="Banner del prode" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', display: 'block' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to bottom, transparent, var(--bg-primary))', pointerEvents: 'none' }} />
        </div>
      )}

      {isEnterprise ? (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            {companyLogo && (
              <img src={companyLogo} alt={t.prode.logoAlt} style={{ height: '96px', maxWidth: '240px', objectFit: 'contain' }} />
            )}
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ fontWeight: 900, fontSize: 'clamp(18px, 5vw, 26px)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{t.prode.worldCupTitle}</h1>
                <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(255,215,0,0.15)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.3)', whiteSpace: 'nowrap' }}>{t.prode.enterpriseBadge}</span>
              </div>
              {localizedDescription && (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>{localizedDescription}</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h1 style={{ fontWeight: 900, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '1px' }}>{displayName}</h1>
              {(prode.plan && prode.plan !== 'free') && (
                <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(255,215,0,0.15)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.3)' }}>
                  {prode.plan === 'business' ? 'Business' : 'Pro'}
                </span>
              )}
            </div>
            {localizedDescription && (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{localizedDescription}</p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {isAdmin && (
              <ProdeSettings
                prodeId={prode.id}
                currentName={prode.name}
                currentDescriptionEs={prodeAny.description_es ?? prode.description ?? ''}
                currentDescriptionEn={prodeAny.description_en ?? ''}
                members={kickableMembers}
              />
            )}
            <InviteLink url={inviteUrl} inviteCode={prode.invite_code ?? ''} isAdmin={isAdmin} />
          </div>
        </div>
      )}

      {isAdmin && pendingMembers.length > 0 && (
        <PendingMembers prodeId={prode.id} members={pendingMembers} labels={t.prode.pendingMembers} />
      )}

      {!isSpectator && userLeaderboardEntry && (
        <ProdePlayerStats
          position={userPosition}
          totalMembers={sortedLeaderboard.length}
          totalPoints={userProdePoints}
          exactHits={userProdeExact}
          partialHits={userProdePartial}
          labels={t.prode.stats}
        />
      )}

      <ProdeTabs
        initialTab={initialProdeTab}
        tabla={
          <>
            <PrizesSection prodeId={prode.id} prizes={prizes ?? []} isAdmin={isAdmin} isEnterprise={isEnterprise} labels={t.prode.prizes} />

            {leaderboardRows.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <Leaderboard rows={leaderboardRows} currentUserId={user.id} />
              </div>
            )}

            {areasEnabled && areaRows.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <AreaLeaderboard
                  rows={areaRows}
                  labels={{
                    ...(t.prode.areaLeaderboard as any),
                    title: `${(t.prode.areaLeaderboard as any).rankingPrefix} ${areaLabel}`,
                    department: areaLabel,
                  }}
                />
              </div>
            )}

            {areasEnabled && myAreaLeaderboard.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <Leaderboard
                  rows={myAreaLeaderboard}
                  currentUserId={user.id}
                  title={`${t.prode.myAreaPrefix} ${areaLabel} — ${userArea}`}
                  subtitle={`${myAreaLeaderboard.length} ${t.prode.players}`}
                />
              </div>
            )}
          </>
        }
        partidos={isSpectator ? undefined : (
          <>
            <ChampionPickSelector
              currentPick={userChampionPick}
              prodeId={prode.id}
              officialChampion={officialChampion}
              teams={participatingTeams}
            />

            {liveMatches.length > 0 && (
              <MatchSection title={t.prode.liveSection} icon="🔴" matches={liveMatches} canEdit={false} prodeId={prode.id} showOdds />
            )}

            {(groupMatches.length > 0 || knockoutMatches.length > 0) && (
              <ProdeMatchesSection
                groupMatches={groupMatches}
                knockoutMatches={knockoutMatches}
                prodeId={prode.id}
                canEdit={true}
                onPickSave={async (matchId, home, away) => {
                  'use server'
                  await savePick(matchId, prode.id, home, away)
                }}
                onPickClear={async (matchId) => {
                  'use server'
                  await clearPick(matchId, prode.id)
                }}
              />
            )}
          </>
        )}
      />
    </div>
  )
}
