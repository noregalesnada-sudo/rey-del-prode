import { createClient } from '@supabase/supabase-js'
import { connection } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'
import { computePoints } from '@/lib/compute-points'
import LiveMatchesView from './_components/LiveMatchesView'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type AdminPickData = {
  matchId: string
  homePick: number
  awayPick: number
}

export type LeaderboardEntry = {
  userId: string
  email: string
  displayName: string
  totalPicks: number
  points: number
  provisionalPoints: number
  exactHits: number
  partialHits: number
}

export default async function PartidosLivePage() {
  await connection()

  const admin = await getAdminUser()
  if (!admin) redirect('/')

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const windowEnd = new Date(todayStart)
  windowEnd.setDate(windowEnd.getDate() + 3) // hoy + próximos 3 días
  windowEnd.setHours(23, 59, 59, 999)

  const { data: windowMatches } = await supabaseAdmin
    .from('matches')
    .select('*')
    .gte('match_date', todayStart.toISOString())
    .lte('match_date', windowEnd.toISOString())
    .order('match_date', { ascending: true })

  const { data: liveMatches } = await supabaseAdmin
    .from('matches')
    .select('*')
    .eq('status', 'live')
    .order('match_date', { ascending: true })

  // Merge window + cualquier live de otro día, deduped
  const seenIds = new Set((windowMatches ?? []).map((m) => m.id))
  const extraLive = (liveMatches ?? []).filter((m) => !seenIds.has(m.id))
  const matches = [...(windowMatches ?? []), ...extraLive]

  const matchIds = matches.map((m) => m.id)

  // Picks del usuario actual
  const { data: myPicksRaw } = matchIds.length
    ? await supabaseAdmin
        .from('admin_test_picks')
        .select('match_id, home_pick, away_pick')
        .eq('user_id', admin.userId)
        .in('match_id', matchIds)
    : { data: [] }

  const myPicks: AdminPickData[] = (myPicksRaw ?? []).map((p) => ({
    matchId: p.match_id,
    homePick: p.home_pick,
    awayPick: p.away_pick,
  }))

  // Todos los picks (para leaderboard)
  const { data: allPicksRaw } = matchIds.length
    ? await supabaseAdmin
        .from('admin_test_picks')
        .select('user_id, user_email, match_id, home_pick, away_pick')
        .in('match_id', matchIds)
    : { data: [] }

  // Construir leaderboard calculando puntos contra scores actuales
  const matchMap = new Map(matches.map((m) => [m.id, m]))
  type PickRow = NonNullable<typeof allPicksRaw>[number]
  const userMap = new Map<string, { email: string; picks: PickRow[] }>()

  for (const pick of allPicksRaw ?? []) {
    let entry = userMap.get(pick.user_id)
    if (!entry) {
      entry = { email: pick.user_email, picks: [] }
      userMap.set(pick.user_id, entry)
    }
    entry.picks.push(pick)
  }

  const leaderboard: LeaderboardEntry[] = Array.from(userMap.entries()).map(([userId, { email, picks }]) => {
    let points = 0
    let provisionalPoints = 0
    let exactHits = 0
    let partialHits = 0

    for (const pick of picks ?? []) {
      const match = matchMap.get(pick.match_id)
      if (!match) continue
      if (match.status === 'finished' && match.home_score != null && match.away_score != null) {
        const pts = computePoints(pick.home_pick, pick.away_pick, match.home_score, match.away_score)
        points += pts
        if (pts === 3) exactHits++
        else if (pts > 0) partialHits++
      } else if (match.status === 'live' && match.home_score != null && match.away_score != null) {
        provisionalPoints += computePoints(pick.home_pick, pick.away_pick, match.home_score, match.away_score)
      }
    }

    return {
      userId,
      email,
      displayName: email.split('@')[0],
      totalPicks: (picks ?? []).length,
      points,
      provisionalPoints,
      exactHits,
      partialHits,
    }
  }).sort((a, b) => (b.points + b.provisionalPoints) - (a.points + a.provisionalPoints))

  return (
    <LiveMatchesView
      initialMatches={matches}
      myPicks={myPicks}
      leaderboard={leaderboard}
      currentUserId={admin.userId}
    />
  )
}
