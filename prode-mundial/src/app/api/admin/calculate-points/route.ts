import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { revalidateTag } from 'next/cache'

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

  if (body.champion) {
    return handleChampion(body.champion)
  }

  if (body.matchId) {
    const result = await calcPointsForMatch(body.matchId)
    if (result.success) {
      revalidateTag('leaderboard', { expire: 0 })
    }
    return NextResponse.json(result)
  }

  // Todos los partidos finished — solo procesa picks sin puntuar (points IS NULL)
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

  // Invalidar caché del leaderboard una sola vez al terminar el batch
  revalidateTag('leaderboard', { expire: 0 })

  return NextResponse.json({ success: true, processed, errors: errors.length > 0 ? errors : undefined })
}

function computePoints(
  homePick: number,
  awayPick: number,
  actualHome: number,
  actualAway: number
): number {
  const actualWinner = actualHome > actualAway ? 'home' : actualAway > actualHome ? 'away' : 'draw'
  const actualDiff = actualHome - actualAway
  const pickWinner = homePick > awayPick ? 'home' : awayPick > homePick ? 'away' : 'draw'
  const pickDiff = homePick - awayPick

  if (homePick === actualHome && awayPick === actualAway) return 3
  if (pickWinner === actualWinner && pickDiff === actualDiff) return 2
  if (pickWinner === actualWinner) return 1
  return 0
}

async function calcPointsForMatch(matchId: string) {
  const { data: match } = await adminClient
    .from('matches')
    .select('home_score, away_score, status')
    .eq('id', matchId)
    .single()

  if (!match) return { error: 'Partido no encontrado' }
  if (match.status !== 'finished') return { error: 'Partido no finalizado' }

  // Solo picks sin puntuar — evita recalcular trabajo ya hecho
  const { data: picks } = await adminClient
    .from('picks')
    .select('id, user_id, prode_id, match_id, home_pick, away_pick')
    .eq('match_id', matchId)
    .is('points', null)

  if (!picks || picks.length === 0) return { success: true, updated: 0 }

  const actualHome = match.home_score as number
  const actualAway = match.away_score as number

  // Calcular todos los puntos en memoria y hacer UN SOLO upsert batch
  const upsertRows = picks.map((pick) => ({
    ...pick,
    points: computePoints(pick.home_pick, pick.away_pick, actualHome, actualAway),
    updated_at: new Date().toISOString(),
  }))

  const { error } = await adminClient
    .from('picks')
    .upsert(upsertRows, { onConflict: 'user_id,prode_id,match_id' })

  if (error) return { error: error.message }

  return { success: true, updated: upsertRows.length }
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

  revalidateTag('leaderboard', { expire: 0 })

  return NextResponse.json({ success: true, champion: championTeam, updated: ids.length })
}
