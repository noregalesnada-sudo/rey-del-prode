import { createClient } from '@supabase/supabase-js'
import { cacheTag, cacheLife } from 'next/cache'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Todos los partidos del torneo — mismo para todos los usuarios.
// TTL 'minutes' (revalidate 60s) como fallback; el origen de verdad es
// revalidateTag('matches', { expire: 0 }) que llama sync-matches post-upsert.
export async function getCachedMatches() {
  'use cache'
  cacheTag('matches')
  cacheLife('minutes')

  const { data } = await adminClient
    .from('matches')
    .select('*')
    .order('match_date', { ascending: true })

  return data ?? []
}

// Leaderboard por prode — misma vista para todos los miembros del mismo prode.
// Invalidado via revalidateTag('leaderboard', { expire: 0 }) en calculate-points.
export async function getCachedLeaderboard(prodeId: string) {
  'use cache'
  cacheTag('leaderboard', `leaderboard-${prodeId}`)
  cacheLife('minutes')

  const { data } = await adminClient
    .from('leaderboard')
    .select('user_id, username, total_points, exact_hits, partial_hits')
    .eq('prode_id', prodeId)
    .order('total_points', { ascending: false })

  return data ?? []
}
