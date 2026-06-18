import { createClient } from '@supabase/supabase-js'
import { unstable_cache } from 'next/cache'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Todos los partidos del torneo — mismo para todos los usuarios.
// TTL 60s como fallback; el origen de verdad es
// revalidateTag('matches') que llama sync-matches post-upsert.
export const getCachedMatches = unstable_cache(
  async () => {
    const { data } = await adminClient
      .from('matches')
      .select('*')
      .eq('competition_code', 'WC')
      .order('match_date', { ascending: true })
    return data ?? []
  },
  ['matches'],
  { tags: ['matches'], revalidate: 60 }
)

// Leaderboard por prode — misma vista para todos los miembros del mismo prode.
// Invalidado via revalidateTag('leaderboard') en calculate-points.
export const getCachedLeaderboard = unstable_cache(
  async (prodeId: string) => {
    const { data } = await adminClient
      // Vista plana (se computa on-read, cacheada 60s acá) en vez de la materializada:
      // la base entra en RAM, así que el read sale de caché y eliminamos el
      // REFRESH MATERIALIZED VIEW, que era el 2º mayor generador de escritura a disco.
      .from('leaderboard')
      .select('user_id, username, first_name, last_name, total_points, exact_hits, partial_hits, diff_hits, winner_hits, misses')
      .eq('prode_id', prodeId)
      // Desempate determinístico: puntos → exactos → aciertos de 2 pts → de 1 pt → menos
      // errados → alfabético. Sin estos criterios extra, a igualdad de puntos el orden de
      // PostgreSQL es arbitrario y puede variar entre lecturas. username al final lo estabiliza.
      .order('total_points', { ascending: false })
      .order('exact_hits', { ascending: false })
      .order('diff_hits', { ascending: false })
      .order('winner_hits', { ascending: false })
      .order('misses', { ascending: true })
      .order('first_name', { ascending: true })
      .order('username', { ascending: true })
    return data ?? []
  },
  ['leaderboard'],
  { tags: ['leaderboard'], revalidate: 60 }
)
