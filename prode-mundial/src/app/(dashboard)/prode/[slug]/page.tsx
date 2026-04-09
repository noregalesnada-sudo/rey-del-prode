import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { Clock } from 'lucide-react'
import MatchSection from '@/components/matches/MatchSection'
import Leaderboard from '@/components/prode/Leaderboard'
import InviteLink from '@/components/prode/InviteLink'
import PrizesSection from '@/components/prode/PrizesSection'
import PendingMembers from '@/components/prode/PendingMembers'
import { type Match } from '@/components/matches/MatchCard'
import { savePick } from '@/lib/actions/picks'

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function ProdePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: prode } = await supabase
    .from('prodes')
    .select('id, name, description, owner_id, invite_code, requires_approval')
    .eq('slug', slug)
    .single()

  if (!prode) redirect('/')

  const { data: membership } = await adminClient
    .from('prode_members')
    .select('role, status')
    .eq('prode_id', prode.id)
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/')

  // Usuario pendiente de aprobación — mostrar pantalla de espera
  if (membership.status === 'pending') {
    return (
      <div style={{ maxWidth: '420px', paddingTop: '40px', textAlign: 'center' }}>
        <Clock size={40} style={{ color: '#FFD700', marginBottom: '16px' }} />
        <h1 style={{ fontWeight: 900, fontSize: '18px', marginBottom: '8px' }}>{prode.name}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
          Tu solicitud para unirte está <strong style={{ color: '#FFD700' }}>pendiente de aprobación</strong>.<br />
          El admin del prode tiene que aceptarte para que puedas participar.
        </p>
      </div>
    )
  }

  const isAdmin = membership.role === 'admin'
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/unirse/${slug}`

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .order('match_date', { ascending: true })

  // Picks del prode del usuario actual
  const { data: prodePicks } = await supabase
    .from('picks')
    .select('match_id, home_pick, away_pick, points')
    .eq('user_id', user.id)
    .eq('prode_id', prode.id)

  // Default picks del perfil (fallback)
  const { data: defaultPicks } = await adminClient
    .from('default_picks')
    .select('match_id, home_pick, away_pick')
    .eq('user_id', user.id)

  const prodePicksMap = new Map(prodePicks?.map((p) => [p.match_id, p]) ?? [])
  const defaultPicksMap = new Map(defaultPicks?.map((p) => [p.match_id, p]) ?? [])

  // Leaderboard — solo miembros activos
  const { data: leaderboard } = await supabase
    .from('leaderboard')
    .select('user_id, username, total_points, exact_hits, partial_hits')
    .eq('prode_id', prode.id)
    .order('total_points', { ascending: false })

  // Filtrar solo activos
  const { data: activeMembers } = await adminClient
    .from('prode_members')
    .select('user_id')
    .eq('prode_id', prode.id)
    .eq('status', 'active')

  const activeMemberIds = new Set((activeMembers ?? []).map((m: { user_id: string }) => m.user_id))
  const activeLeaderboard = (leaderboard ?? []).filter((r) => activeMemberIds.has(r.user_id))

  // Avatars para leaderboard
  const leaderboardUserIds = activeLeaderboard.map((r) => r.user_id)
  const { data: profilesData } = leaderboardUserIds.length > 0
    ? await adminClient.from('profiles').select('id, avatar_url').in('id', leaderboardUserIds)
    : { data: [] }
  const avatarMap = new Map((profilesData ?? []).map((p: { id: string; avatar_url: string | null }) => [p.id, p.avatar_url]))

  const leaderboardRows = activeLeaderboard.map((r) => ({
    ...r,
    avatar_url: avatarMap.get(r.user_id) ?? null,
  }))

  // Miembros pendientes (solo para el admin)
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

  // Premios del prode
  const { data: prizes } = await adminClient
    .from('prode_prizes')
    .select('position, description')
    .eq('prode_id', prode.id)
    .order('position', { ascending: true })

  const matchesFormatted: Match[] = (matches ?? []).map((m) => {
    const prodePick = prodePicksMap.get(m.id)
    const defaultPick = defaultPicksMap.get(m.id)
    const activePick = prodePick ?? defaultPick

    return {
      id: m.id,
      homeTeam: m.home_team ?? 'A definir',
      awayTeam: m.away_team ?? 'A definir',
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

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
            {prode.name}
          </h1>
          {prode.description && (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{prode.description}</p>
          )}
        </div>
        <InviteLink url={inviteUrl} inviteCode={prode.invite_code ?? ''} isAdmin={isAdmin} />
      </div>

      {isAdmin && pendingMembers.length > 0 && (
        <PendingMembers prodeId={prode.id} members={pendingMembers} />
      )}

      <PrizesSection prodeId={prode.id} prizes={prizes ?? []} isAdmin={isAdmin} />

      {leaderboardRows.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <Leaderboard rows={leaderboardRows} currentUserId={user.id} />
        </div>
      )}

      {liveMatches.length > 0 && (
        <MatchSection title="EN VIVO" icon="🔴" matches={liveMatches} canEdit={false} prodeId={prode.id} />
      )}

      {groupMatches.length > 0 && (
        <MatchSection
          title="FASE DE GRUPOS"
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

      {knockoutMatches.length > 0 && (
        <MatchSection
          title="ELIMINATORIAS"
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
