import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import MatchSection from '@/components/matches/MatchSection'
import Leaderboard from '@/components/prode/Leaderboard'
import InviteLink from '@/components/prode/InviteLink'
import PrizesSection from '@/components/prode/PrizesSection'
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
    .select('id, name, description, owner_id')
    .eq('slug', slug)
    .single()

  if (!prode) redirect('/')

  const { data: membership } = await supabase
    .from('prode_members')
    .select('role')
    .eq('prode_id', prode.id)
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/')

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .order('match_date', { ascending: true })

  // Picks específicos del prode
  const { data: prodePicks } = await supabase
    .from('picks')
    .select('match_id, home_pick, away_pick, points')
    .eq('user_id', user.id)
    .eq('prode_id', prode.id)

  // Default picks del perfil (fallback) — usamos admin para garantizar lectura
  const { data: defaultPicks } = await adminClient
    .from('default_picks')
    .select('match_id, home_pick, away_pick')
    .eq('user_id', user.id)

  const prodePicksMap = new Map(prodePicks?.map((p) => [p.match_id, p]) ?? [])
  const defaultPicksMap = new Map(defaultPicks?.map((p) => [p.match_id, p]) ?? [])

  const { data: leaderboard } = await supabase
    .from('leaderboard')
    .select('user_id, username, total_points, exact_hits, partial_hits')
    .eq('prode_id', prode.id)
    .order('total_points', { ascending: false })

  // Avatar URLs para el leaderboard
  const leaderboardUserIds = (leaderboard ?? []).map((r) => r.user_id)
  const { data: profilesData } = leaderboardUserIds.length > 0
    ? await adminClient.from('profiles').select('id, avatar_url').in('id', leaderboardUserIds)
    : { data: [] }
  const avatarMap = new Map((profilesData ?? []).map((p: { id: string; avatar_url: string | null }) => [p.id, p.avatar_url]))

  const leaderboardRows = (leaderboard ?? []).map((r) => ({
    ...r,
    avatar_url: avatarMap.get(r.user_id) ?? null,
  }))

  // Premios del prode
  const { data: prizes } = await adminClient
    .from('prode_prizes')
    .select('position, description')
    .eq('prode_id', prode.id)
    .order('position', { ascending: true })

  const matchesFormatted: Match[] = (matches ?? []).map((m) => {
    // Prode pick tiene prioridad, si no existe usa el default pick
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
  const isAdmin = membership.role === 'admin'
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/unirse/${slug}`

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
        <InviteLink url={inviteUrl} isAdmin={isAdmin} />
      </div>

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
