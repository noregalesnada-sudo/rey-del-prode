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
      .from('leaderboard')
      .select('user_id, username, total_points, exact_hits, partial_hits')
      .eq('prode_id', prodeId)
      .order('total_points', { ascending: false })
    return data ?? []
  },
  ['leaderboard'],
  { tags: ['leaderboard'], revalidate: 60 }
)
