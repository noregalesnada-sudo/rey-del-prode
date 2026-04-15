import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST — protegido con x-sync-secret
// Body: { matchId?: string }  → calcula puntos de un partido específico
//       { champion?: string } → asigna 10 pts a los que acertaron el campeón
//       Sin body              → calcula puntos de TODOS los partidos finished con picks sin puntuar
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-sync-secret')
  if (secret !== process.env.SYNC_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { matchId?: string; champion?: string } = {}
  try {
    body = await req.json()
  } catch {
    // body vacío es válido — procesa todos los partidos
  }

  // --- Campeón ---
  if (body.champion) {
    return handleChampion(body.champion)
  }

  // --- Partido específico ---
  if (body.matchId) {
    const result = await calcPointsForMatch(body.matchId)
    return NextResponse.json(result)
  }

  // --- Todos los partidos finished con picks sin puntuar ---
  const { data: finishedMatches, error: mErr } = await adminClient
    .from('matches')
    .select('id')
    .eq('status', 'finished')

  if (mErr) return NextResponse.json({ error: mErr.message }, { status: 500 })
  if (!finishedMatches || finishedMatches.length === 0) {
    return NextResponse.json({ success: true, processed: 0 })
  }

  let processed = 0
  const errors: string[] = []

  for (const match of finishedMatches) {
    const res = await calcPointsForMatch(match.id)
    if (res.error) {
      errors.push(`match ${match.id}: ${res.error}`)
    } else {
      processed++
    }
  }

  return NextResponse.json({ success: true, processed, errors: errors.length > 0 ? errors : undefined })
}

async function calcPointsForMatch(matchId: string) {
  const { data: match } = await adminClient
    .from('matches')
    .select('home_score, away_score, status')
    .eq('id', matchId)
    .single()

  if (!match) return { error: 'Partido no encontrado' }
  if (match.status !== 'finished') return { error: 'Partido no finalizado' }

  const { data: picks } = await adminClient
    .from('picks')
    .select('id, home_pick, away_pick')
    .eq('match_id', matchId)

  if (!picks || picks.length === 0) return { success: true, updated: 0 }

  const actualHome = match.home_score as number
  const actualAway = match.away_score as number
  const actualWinner = actualHome > actualAway ? 'home' : actualAway > actualHome ? 'away' : 'draw'
  const actualDiff = actualHome - actualAway

  let updated = 0
  for (const pick of picks) {
    const pickWinner =
      pick.home_pick > pick.away_pick ? 'home' : pick.away_pick > pick.home_pick ? 'away' : 'draw'
    const pickDiff = pick.home_pick - pick.away_pick

    let points = 0
    if (pick.home_pick === actualHome && pick.away_pick === actualAway) {
      points = 3
    } else if (pickWinner === actualWinner && pickDiff === actualDiff) {
      points = 2
    } else if (pickWinner === actualWinner) {
      points = 1
    }

    await adminClient.from('picks').update({ points }).eq('id', pick.id)
    updated++
  }

  return { success: true, updated }
}

async function handleChampion(championTeam: string) {
  await adminClient
    .from('tournament_settings')
    .update({ champion_team: championTeam })
    .eq('id', 1)

  const { data: correct } = await adminClient
    .from('champion_picks')
    .select('id')
    .eq('team', championTeam)
    .eq('points', 0)

  if (!correct || correct.length === 0) {
    return NextResponse.json({ success: true, champion: championTeam, updated: 0 })
  }

  const ids = correct.map((r) => r.id)
  await adminClient.from('champion_picks').update({ points: 10 }).in('id', ids)

  return NextResponse.json({ success: true, champion: championTeam, updated: ids.length })
}
