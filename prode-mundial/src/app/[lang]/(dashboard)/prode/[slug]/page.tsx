import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { getCachedMatches, getCachedLeaderboard } from '@/lib/cached-queries'
import { Clock } from 'lucide-react'
import MatchSection from '@/components/matches/MatchSection'
import Leaderboard from '@/components/prode/Leaderboard'
import InviteLink from '@/components/prode/InviteLink'
import PrizesSection from '@/components/prode/PrizesSection'
import PendingMembers from '@/components/prode/PendingMembers'
import ProdeBannerUpload from '@/components/prode/ProdeBannerUpload'
import ProdeSettings from '@/components/prode/ProdeSettings'
import { type Match } from '@/components/matches/MatchCard'
import { savePick } from '@/lib/actions/picks'
import AreaLeaderboard from '@/components/prode/AreaLeaderboard'
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
  searchParams: Promise<{ pago?: string }>
}) {
  const { slug, lang } = await params
  if (!hasLocale(lang)) notFound()
  const t = await getDictionary(lang)
  const { pago } = await searchParams

  await connection()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${lang}/login`)

  const { data: prode } = await adminClient
    .from('prodes')
    .select('id, name, description, owner_id, invite_code, requires_approval, plan, banner_url')
    .eq('slug', slug)
    .single()

  if (!prode) redirect(`/${lang}`)

  const { data: linkedCompany } = await adminClient
    .from('companies')
    .select('slug, plan, primary_color, secondary_color, logo_url, banner_url, prode_name')
    .eq('prode_id', prode.id)
    .maybeSingle()
  const isEnterprise = linkedCompany?.plan === 'enterprise'

  const companyPrimary   = linkedCompany?.primary_color ?? null
  const companySecondary = linkedCompany?.secondary_color ?? null
  const companyLogo      = linkedCompany?.logo_url ?? null
  const companyBanner    = linkedCompany?.banner_url ?? null
  const displayName      = linkedCompany?.prode_name || prode.name

  const { data: membership } = await adminClient
    .from('prode_members')
    .select('role, status, area, spectator')
    .eq('prode_id', prode.id)
    .eq('user_id', user.id)
    .single()

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

  const isAdmin = membership.role === 'admin'
  const isSpectator = (membership as any).spectator ?? false
  const userArea = (membership as { role: string; status: string; area?: string | null }).area ?? null
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/unirse/${slug}`

  const matches = await getCachedMatches()

  const { data: prodePicks } = await supabase
    .from('picks')
    .select('match_id, home_pick, away_pick, points')
    .eq('user_id', user.id)
    .eq('prode_id', prode.id)

  const { data: defaultPicks } = await adminClient
    .from('default_picks')
    .select('match_id, home_pick, away_pick')
    .eq('user_id', user.id)

  if (!isSpectator && (prodePicks ?? []).length === 0 && (defaultPicks ?? []).length > 0) {
    const scheduledIds = new Set(
      (matches).filter((m) => m.status === 'scheduled').map((m) => m.id)
    )
    const toInsert = (defaultPicks ?? [])
      .filter((p) => scheduledIds.has(p.match_id))
      .map((p) => ({
        user_id: user.id,
        prode_id: prode.id,
        match_id: p.match_id,
        home_pick: p.home_pick,
        away_pick: p.away_pick,
        updated_at: new Date().toISOString(),
      }))
    if (toInsert.length > 0) {
      await adminClient.from('picks').insert(toInsert)
    }
  }

  const prodePicksMap = new Map(prodePicks?.map((p) => [p.match_id, p]) ?? [])
  const defaultPicksMap = new Map(defaultPicks?.map((p) => [p.match_id, p]) ?? [])

  const leaderboard = await getCachedLeaderboard(prode.id)

  const { data: activeMembers } = await adminClient
    .from('prode_members')
    .select('user_id')
    .eq('prode_id', prode.id)
    .eq('status', 'active')
    .eq('spectator', false)

  const activeMemberIds = new Set((activeMembers ?? []).map((m: { user_id: string }) => m.user_id))
  const activeLeaderboard = leaderboard.filter((r) => activeMemberIds.has(r.user_id))

  const leaderboardUserIds = activeLeaderboard.map((r) => r.user_id)
  const { data: profilesData } = leaderboardUserIds.length > 0
    ? await adminClient.from('profiles').select('id, avatar_url').in('id', leaderboardUserIds)
    : { data: [] }
  const avatarMap = new Map((profilesData ?? []).map((p: { id: string; avatar_url: string | null }) => [p.id, p.avatar_url]))

  const [prodeChampRes, defaultChampRes, champAllRes, tournamentRes] = await Promise.all([
    adminClient.from('champion_picks').select('team, points').eq('user_id', user.id).eq('prode_id', prode.id).maybeSingle(),
    adminClient.from('champion_picks').select('team').eq('user_id', user.id).is('prode_id', null).maybeSingle(),
    adminClient.from('champion_picks').select('user_id, points').eq('prode_id', prode.id),
    adminClient.from('tournament_settings').select('champion_team').eq('id', 1).maybeSingle(),
  ])
  const champPointsMap = new Map<string, number>(
    (champAllRes.data ?? []).map((r: { user_id: string; points: number }) => [r.user_id, r.points])
  )

  const leaderboardRows = activeLeaderboard.map((r) => ({
    ...r,
    avatar_url: avatarMap.get(r.user_id) ?? null,
    total_points: (r.total_points ?? 0) + (champPointsMap.get(r.user_id) ?? 0),
  }))

  let pendingMembers: { user_id: string; username: string }[] = []
  if (isAdmin) {
    const { data: pendingRows } = await adminClient
      .from('prode_members')
      .select('user_id, profiles(username)')
      .eq('prode_id', prode.id)
      .eq('status', 'pending')

    pendingMembers = (pendingRows ?? []).map((r: { user_id: string; profiles: unknown }) => {
      const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
      return {
        user_id: r.user_id,
        username: (profile as { username?: string } | null)?.username ?? 'usuario',
      }
    })
  }

  let membersWithArea: { user_id: string; area: string | null }[] = []
  let areaRows: { area: string; miembros: number; promedio: number; total: number }[] = []
  let myAreaLeaderboard: typeof leaderboardRows = []

  if (isEnterprise) {
    const { data: mwa } = await adminClient
      .from('prode_members')
      .select('user_id, area')
      .eq('prode_id', prode.id)
      .eq('status', 'active')
      .not('area', 'is', null)

    membersWithArea = mwa ?? []

    if (membersWithArea.length > 0) {
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
    }

    myAreaLeaderboard = userArea
      ? leaderboardRows.filter((r) => {
          const m = membersWithArea.find((x) => x.user_id === r.user_id)
          return m?.area === userArea
        })
      : []
  }

  const userChampionPick = prodeChampRes.data?.team ?? defaultChampRes.data?.team ?? null
  const officialChampion = tournamentRes.data?.champion_team ?? null

  const { data: prizes } = await adminClient
    .from('prode_prizes')
    .select('position, description')
    .eq('prode_id', prode.id)
    .order('position', { ascending: true })

  const matchesFormatted: Match[] = (matches).map((m) => {
    const prodePick = prodePicksMap.get(m.id)
    const defaultPick = defaultPicksMap.get(m.id)
    const activePick = prodePick ?? defaultPick

    return {
      id: m.id,
      homeTeam: m.home_team ?? t.prode.tbd,
      awayTeam: m.away_team ?? t.prode.tbd,
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
      minutesUntilStart: (new Date(m.match_date).getTime() - Date.now()) / 60000,
    }
  })

  const groupMatches = matchesFormatted.filter((m) => m.phase === 'groups')
  const knockoutMatches = matchesFormatted.filter((m) => m.phase !== 'groups' && m.status !== 'live')
  const liveMatches = matchesFormatted.filter((m) => m.status === 'live')

  const isPaidPlan = prode.plan === 'pro' || prode.plan === 'business' || isEnterprise

  return (
    <div>
      <RealtimeRefresh prodeId={prode.id} />

      {isEnterprise && (companyPrimary || companySecondary) && (
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
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
            currentDescription={prode.description ?? ''}
            enterpriseAdminUrl={linkedCompany?.slug ? `/empresa-admin/${linkedCompany.slug}` : undefined}
          />
        </div>
      )}

      {isEnterprise && companyBanner && (
        <div style={{ marginBottom: '20px', borderRadius: '8px', overflow: 'hidden', aspectRatio: '3 / 1' }}>
          <img src={companyBanner} alt="Banner del prode" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center', display: 'block' }} />
        </div>
      )}

      {!isEnterprise && isPaidPlan && isAdmin && (
        <ProdeBannerUpload prodeId={prode.id} currentUrl={prode.banner_url} />
      )}
      {!isEnterprise && isPaidPlan && !isAdmin && prode.banner_url && (
        <div style={{ marginBottom: '20px', borderRadius: '8px', overflow: 'hidden', height: '180px', position: 'relative' }}>
          <img src={prode.banner_url} alt="Banner del prode" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', display: 'block' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to bottom, transparent, var(--bg-primary))', pointerEvents: 'none' }} />
        </div>
      )}

      {isEnterprise ? (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              {companyLogo && (
                <img src={companyLogo} alt="Logo empresa" style={{ height: '72px', maxWidth: '180px', objectFit: 'contain', flexShrink: 0 }} />
              )}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h1 style={{ fontWeight: 900, fontSize: '26px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{displayName}</h1>
                  <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(255,215,0,0.15)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.3)', flexShrink: 0 }}>Enterprise</span>
                </div>
                {prode.description && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>{prode.description}</p>
                )}
              </div>
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
            {prode.description && (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{prode.description}</p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {isAdmin && (
              <ProdeSettings
                prodeId={prode.id}
                currentName={prode.name}
                currentDescription={prode.description ?? ''}
              />
            )}
            <InviteLink url={inviteUrl} inviteCode={prode.invite_code ?? ''} isAdmin={isAdmin} />
          </div>
        </div>
      )}

      {isAdmin && pendingMembers.length > 0 && (
        <PendingMembers prodeId={prode.id} members={pendingMembers} />
      )}

      <PrizesSection prodeId={prode.id} prizes={prizes ?? []} isAdmin={isAdmin} isEnterprise={isEnterprise} />

      {leaderboardRows.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <Leaderboard rows={leaderboardRows} currentUserId={user.id} />
        </div>
      )}

      {areaRows.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <AreaLeaderboard rows={areaRows} />
        </div>
      )}

      {myAreaLeaderboard.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <Leaderboard
            rows={myAreaLeaderboard}
            currentUserId={user.id}
            title={`${t.prode.myArea} — ${userArea}`}
            subtitle={`${myAreaLeaderboard.length} jugadores`}
          />
        </div>
      )}

      {!isSpectator && (
        <ChampionPickSelector
          currentPick={userChampionPick}
          prodeId={prode.id}
          officialChampion={officialChampion}
        />
      )}

      {!isSpectator && liveMatches.length > 0 && (
        <MatchSection title={t.prode.liveSection} icon="🔴" matches={liveMatches} canEdit={false} prodeId={prode.id} />
      )}

      {!isSpectator && groupMatches.length > 0 && (
        <MatchSection
          title={t.prode.groupStage}
          icon="🏆"
          matches={groupMatches}
          canEdit={true}
          prodeId={prode.id}
          onPickSave={async (matchId, home, away) => {
            'use server'
            await savePick(matchId, prode.id, home, away)
          }}
        />
      )}

      {!isSpectator && knockoutMatches.length > 0 && (
        <MatchSection
          title={t.prode.knockout}
          icon="⚽"
          matches={knockoutMatches}
          canEdit={true}
          prodeId={prode.id}
          onPickSave={async (matchId, home, away) => {
            'use server'
            await savePick(matchId, prode.id, home, away)
          }}
        />
      )}
    </div>
  )
}
