import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface PickDistribution {
  home: number
  draw: number
  away: number
  total: number
}

// PostgREST devuelve máximo 1000 filas por request. Igual que en scoring.ts, paginamos con
// .range() para no truncar en prodes grandes (miembros/picks por encima del 1000).
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

const classify = (h: number, a: number): keyof Omit<PickDistribution, 'total'> =>
  h > a ? 'home' : h < a ? 'away' : 'draw'

/**
 * Distribución Local/Empate/Visita de lo que eligió la gente del prode, por partido.
 *
 * Espeja el scoring: por cada miembro activo no-espectador se toma su **pick efectivo**
 * = pick cargado en el prode ?? carga global de "Mis Pronósticos" (default_picks). El pick
 * del prode pisa al default. Los miembros sin ninguno de los dos no cuentan (no se puntúan).
 *
 * Pensado para mostrarse recién cuando cierran los pronósticos (15 min antes del inicio).
 * Tolerante a fallos: ante cualquier error devuelve un Map vacío (la UI simplemente no muestra
 * la barra).
 */
export async function getProdePickDistributions(
  prodeId: string,
  matchIds: string[]
): Promise<Map<string, PickDistribution>> {
  const result = new Map<string, PickDistribution>()
  if (matchIds.length === 0) return result

  try {
    const [members, prodePicks, defaultPicks] = await Promise.all([
      fetchAll<{ user_id: string }>((from, to) =>
        adminClient
          .from('prode_members')
          .select('user_id')
          .eq('prode_id', prodeId)
          .eq('status', 'active')
          .eq('spectator', false)
          .range(from, to)),
      fetchAll<{ match_id: string; user_id: string; home_pick: number; away_pick: number }>((from, to) =>
        adminClient
          .from('picks')
          .select('match_id, user_id, home_pick, away_pick')
          .eq('prode_id', prodeId)
          .in('match_id', matchIds)
          .range(from, to)),
      fetchAll<{ match_id: string; user_id: string; home_pick: number; away_pick: number }>((from, to) =>
        adminClient
          .from('default_picks')
          .select('match_id, user_id, home_pick, away_pick')
          .in('match_id', matchIds)
          .range(from, to)),
    ])

    const memberSet = new Set(members.map((m) => m.user_id))

    // Pick efectivo por (partido, usuario): el default primero, el pick del prode lo pisa.
    const effective = new Map<string, Map<string, { h: number; a: number }>>()
    for (const id of matchIds) effective.set(id, new Map())

    for (const p of defaultPicks) {
      if (!memberSet.has(p.user_id)) continue
      effective.get(p.match_id)?.set(p.user_id, { h: p.home_pick, a: p.away_pick })
    }
    for (const p of prodePicks) {
      if (!memberSet.has(p.user_id)) continue
      effective.get(p.match_id)?.set(p.user_id, { h: p.home_pick, a: p.away_pick })
    }

    for (const id of matchIds) {
      const dist: PickDistribution = { home: 0, draw: 0, away: 0, total: 0 }
      for (const { h, a } of effective.get(id)!.values()) {
        dist[classify(h, a)]++
        dist.total++
      }
      if (dist.total > 0) result.set(id, dist)
    }
  } catch {
    return new Map()
  }

  return result
}
