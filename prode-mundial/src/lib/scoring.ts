import { createClient } from '@supabase/supabase-js'
import { revalidateTag } from 'next/cache'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export function computePoints(
  homePick: number,
  awayPick: number,
  actualHome: number,
  actualAway: number
): number {
  const actualWinner = actualHome > actualAway ? 'home' : actualAway > actualHome ? 'away' : 'draw'
  const actualDiff   = actualHome - actualAway
  const pickWinner   = homePick  > awayPick  ? 'home' : awayPick  > homePick  ? 'away' : 'draw'
  const pickDiff     = homePick  - awayPick

  if (homePick === actualHome && awayPick === actualAway) return 3
  if (pickWinner === actualWinner && pickDiff === actualDiff) return 2
  if (pickWinner === actualWinner) return 1
  return 0
}

export async function calcPointsForMatch(matchId: string) {
  const { data: match } = await adminClient
    .from('matches')
    .select('home_score, away_score, status')
    .eq('id', matchId)
    .single()

  if (!match)                       return { error: 'Partido no encontrado' }
  if (match.status !== 'finished')  return { error: 'Partido no finalizado' }

  const { data: picks } = await adminClient
    .from('picks')
    .select('id, user_id, prode_id, match_id, home_pick, away_pick')
    .eq('match_id', matchId)
    .is('points', null)

  if (!picks || picks.length === 0) return { success: true, updated: 0 }

  const actualHome = match.home_score as number
  const actualAway = match.away_score as number

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

export async function recalculateAllFinishedMatches() {
  const { data: finishedMatches, error: mErr } = await adminClient
    .from('matches')
    .select('id')
    .eq('status', 'finished')

  if (mErr) return { error: mErr.message }
  if (!finishedMatches || finishedMatches.length === 0) return { success: true, processed: 0 }

  let processed = 0
  const errors: string[] = []

  for (const match of finishedMatches) {
    const res = await calcPointsForMatch(match.id)
    if (res.error) errors.push(`match ${match.id}: ${res.error}`)
    else processed++
  }

  await adminClient.rpc('refresh_leaderboard_mv')
  revalidateTag('leaderboard', { expire: 0 })

  return { success: true, processed, errors: errors.length > 0 ? errors : undefined }
}
