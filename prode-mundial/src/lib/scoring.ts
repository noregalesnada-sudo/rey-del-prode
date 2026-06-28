import { createClient } from '@supabase/supabase-js'
import { revalidateTag } from 'next/cache'
import { computePoints } from '@/lib/compute-points'

export { computePoints }

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// PostgREST devuelve como máximo 1000 filas por request. Con 1648 membresías y 1153 picks
// por partido, las queries sin paginar se truncaban en silencio: los miembros/picks más allá
// del 1000 nunca se materializaban ni puntuaban → figuraban con 0 en el leaderboard.
// fetchAll pagina con .range() hasta traer TODO.
async function fetchAll<T>(
  page: (from: number, to: number) => PromiseLike<{ data: unknown; error: { message: string } | null }>
): Promise<T[]> {
  const SIZE = 1000
  const all: T[] = []
  for (let from = 0; ; from += SIZE) {
    const { data, error } = await page(from, from + SIZE - 1)
    if (error) throw new Error(error.message)
    const rows = (data ?? []) as T[]
    if (rows.length === 0) break
    all.push(...rows)
    if (rows.length < SIZE) break
  }
  return all
}

/**
 * Red de seguridad: cuando un partido arranca/termina, completa con el pronóstico de
 * "Mis Pronósticos" (default_picks) a todo miembro activo que NO cargó pick en su prode.
 * Así puntúa aunque nunca haya abierto ese prode. Idempotente (no pisa picks existentes).
 */
export async function materializeDefaultPicksForMatch(matchId: string) {
  try {
    const [defaults, members, existing] = await Promise.all([
      fetchAll<{ user_id: string; home_pick: number; away_pick: number }>((from, to) =>
        adminClient.from('default_picks').select('user_id, home_pick, away_pick').eq('match_id', matchId).range(from, to)),
      fetchAll<{ prode_id: string; user_id: string }>((from, to) =>
        adminClient.from('prode_members').select('prode_id, user_id').eq('status', 'active').eq('spectator', false).range(from, to)),
      fetchAll<{ user_id: string; prode_id: string }>((from, to) =>
        adminClient.from('picks').select('user_id, prode_id').eq('match_id', matchId).range(from, to)),
    ])

    if (defaults.length === 0 || members.length === 0) {
      return { success: true, inserted: 0 }
    }

    const defaultMap = new Map(defaults.map((d) => [d.user_id, d]))
    const existingSet = new Set(existing.map((p) => `${p.user_id}|${p.prode_id}`))

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
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) }
  }
}

export async function calcPointsForMatch(matchId: string) {
  const { data: match } = await adminClient
    .from('matches')
    .select('home_score, away_score, reg_home_score, reg_away_score, status')
    .eq('id', matchId)
    .single()

  if (!match) return { error: 'Partido no encontrado' }
  if (match.status !== 'finished' && match.status !== 'live') return { success: true, updated: 0 }
  // Se puntúa SIEMPRE el resultado de los 90' (reg_*). Fallback a home_score por si reg_*
  // todavía no está poblado (partido manual recién creado, antes de cualquier sync/backfill).
  const actualHome = match.reg_home_score ?? match.home_score
  const actualAway = match.reg_away_score ?? match.away_score
  if (actualHome == null || actualAway == null) return { success: true, updated: 0 }

  let picks: Array<{ id: string; user_id: string; prode_id: string; match_id: string; home_pick: number; away_pick: number; points: number | null }>
  try {
    picks = await fetchAll((from, to) =>
      adminClient.from('picks').select('id, user_id, prode_id, match_id, home_pick, away_pick, points').eq('match_id', matchId).range(from, to))
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) }
  }

  if (picks.length === 0) return { success: true, updated: 0 }

  // Solo re-escribir los picks cuyo puntaje cambió. En un partido en vivo con marcador
  // estable esto deja el upsert en 0 filas, en vez de reescribir 1000+ picks cada minuto
  // (lo que saturaba la DB durante el partido).
  const upsertRows: Array<{ id: string; user_id: string; prode_id: string; match_id: string; home_pick: number; away_pick: number; points: number; updated_at: string }> = []
  for (const pick of picks) {
    const points = computePoints(pick.home_pick, pick.away_pick, actualHome, actualAway)
    if (points === pick.points) continue
    upsertRows.push({
      id: pick.id,
      user_id: pick.user_id,
      prode_id: pick.prode_id,
      match_id: pick.match_id,
      home_pick: pick.home_pick,
      away_pick: pick.away_pick,
      points,
      updated_at: new Date().toISOString(),
    })
  }

  if (upsertRows.length === 0) return { success: true, updated: 0 }

  const { error } = await adminClient
    .from('picks')
    .upsert(upsertRows, { onConflict: 'user_id,prode_id,match_id' })

  if (error) return { error: error.message }
  return { success: true, updated: upsertRows.length }
}

/**
 * Aplica el resultado de un partido de punta a punta, para usar desde el backoffice
 * cuando se carga/edita/limpia un resultado a mano (no hay que esperar al cron de sync):
 * - Si el partido está finalizado/en vivo con goles → materializa los default picks de
 *   quienes heredan "Mis Pronósticos" y puntúa.
 * - Si volvió a "no jugado" (scheduled/sin goles) → descarta los puntos previos de ese
 *   partido para que no queden colgados en el leaderboard.
 * Siempre refresca el leaderboard. Es idempotente.
 */
export async function applyMatchResult(matchId: string) {
  const { data: match } = await adminClient
    .from('matches')
    .select('home_score, away_score, reg_home_score, reg_away_score, status')
    .eq('id', matchId)
    .single()

  const isScored =
    !!match &&
    (match.status === 'finished' || match.status === 'live') &&
    (match.reg_home_score ?? match.home_score) != null &&
    (match.reg_away_score ?? match.away_score) != null

  if (isScored) {
    await materializeDefaultPicksForMatch(matchId)
    await calcPointsForMatch(matchId)
  } else {
    // Partido revertido a no jugado: los puntos vuelven a null (la view de leaderboard
    // ignora null en sum/exact/partial/miss, así que el partido deja de contar).
    await adminClient
      .from('picks')
      .update({ points: null, updated_at: new Date().toISOString() })
      .eq('match_id', matchId)
  }

  revalidateTag('leaderboard', { expire: 0 })
  return { success: true }
}

/**
 * Recalcula TODO de punta a punta para todos los prodes: por cada partido en vivo o
 * finalizado, primero materializa los default_picks pendientes (los que heredan
 * "Mis Pronósticos" y nunca abrieron el prode) y después puntúa. Esto cubre el caso de
 * un pronóstico correcto que solo vivía en `default_picks` y figuraba con 0 en el
 * leaderboard porque la vista solo suma la tabla `picks`. Idempotente.
 */
export async function recalcAllActiveMatches() {
  const { data: activeMatches, error: mErr } = await adminClient
    .from('matches')
    .select('id')
    .in('status', ['live', 'finished'])

  if (mErr) return { error: mErr.message }
  if (!activeMatches || activeMatches.length === 0) return { success: true, processed: 0 }

  let processed = 0
  let materialized = 0
  const errors: string[] = []

  for (const match of activeMatches) {
    const mat = await materializeDefaultPicksForMatch(match.id)
    if ('error' in mat && mat.error) {
      errors.push(`materialize ${match.id}: ${mat.error}`)
      continue
    }
    materialized += ('inserted' in mat ? mat.inserted : 0) ?? 0
    const res = await calcPointsForMatch(match.id)
    if ('error' in res && res.error) errors.push(`score ${match.id}: ${res.error}`)
    else processed++
  }

  revalidateTag('leaderboard', { expire: 0 })

  return { success: true, processed, materialized, errors: errors.length > 0 ? errors : undefined }
}
