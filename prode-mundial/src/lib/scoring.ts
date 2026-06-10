import { createClient } from '@supabase/supabase-js'
import { revalidateTag } from 'next/cache'
import { computePoints } from '@/lib/compute-points'

export { computePoints }

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Red de seguridad: cuando un partido arranca/termina, completa con el pronóstico de
 * "Mis Pronósticos" (default_picks) a todo miembro activo que NO cargó pick en su prode.
 * Así puntúa aunque nunca haya abierto ese prode. Idempotente (no pisa picks existentes).
 */
export async function materializeDefaultPicksForMatch(matchId: string) {
  const [{ data: defaults }, { data: members }, { data: existing }] = await Promise.all([
    adminClient.from('default_picks').select('user_id, home_pick, away_pick').eq('match_id', matchId),
    adminClient.from('prode_members').select('prode_id, user_id').eq('status', 'active').eq('spectator', false),
    adminClient.from('picks').select('user_id, prode_id').eq('match_id', matchId),
  ])

  if (!defaults || defaults.length === 0 || !members || members.length === 0) {
    return { success: true, inserted: 0 }
  }

  const defaultMap = new Map(defaults.map((d) => [d.user_id, d]))
  const existingSet = new Set((existing ?? []).map((p) => `${p.user_id}|${p.prode_id}`))

  const rows = members
    .filter((m) => defaultMap.has(m.user_id) && !existingSet.has(`${m.user_id}|${m.prode_id}`))
    .map((m) => {
      const d = defaultMap.get(m.user_id)!
      return {
        user_id: m.user_id,
        prode_id: m.prode_id,
        match_id: matchId,
        home_pick: d.home_pick,
        away_pick: d.away_pick,
        updated_at: new Date().toISOString(),
      }
    })

  if (rows.length === 0) return { success: true, inserted: 0 }

  const { error } = await adminClient
    .from('picks')
    .upsert(rows, { onConflict: 'user_id,prode_id,match_id', ignoreDuplicates: true })

  if (error) return { error: error.message }
  return { success: true, inserted: rows.length }
}

export async function calcPointsForMatch(matchId: string) {
  const { data: match } = await adminClient
    .from('matches')
    .select('home_score, away_score, status')
    .eq('id', matchId)
    .single()

  if (!match) return { error: 'Partido no encontrado' }
  if (match.status !== 'finished' && match.status !== 'live') return { success: true, updated: 0 }
  if (match.home_score == null || match.away_score == null) return { success: true, updated: 0 }

  const { data: picks } = await adminClient
    .from('picks')
    .select('id, user_id, prode_id, match_id, home_pick, away_pick')
    .eq('match_id', matchId)

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
