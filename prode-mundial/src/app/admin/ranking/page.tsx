import { createClient } from '@supabase/supabase-js'
import RankingTable from './_components/RankingTable'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type LeaderboardRow = {
  user_id: string
  username: string | null
  first_name: string | null
  last_name: string | null
  total_points: number
  exact_hits: number
  partial_hits: number
}

async function fetchGlobalRanking() {
  const PAGE_SIZE = 1000
  let page = 0
  const allRows: LeaderboardRow[] = []

  while (true) {
    const { data, error } = await adminClient
      .from('leaderboard_mv')
      .select('user_id, username, first_name, last_name, total_points, exact_hits, partial_hits')
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (error || !data || data.length === 0) break
    allRows.push(...(data as LeaderboardRow[]))
    if (data.length < PAGE_SIZE) break
    page++
  }

  // Agrupar por usuario sumando puntos de todos sus prodes
  const byUser = new Map<string, {
    user_id: string
    username: string | null
    first_name: string | null
    last_name: string | null
    total_points: number
    exact_hits: number
    partial_hits: number
    prodes_count: number
  }>()

  for (const row of allRows) {
    const existing = byUser.get(row.user_id)
    if (existing) {
      existing.total_points += row.total_points ?? 0
      existing.exact_hits += row.exact_hits ?? 0
      existing.partial_hits += row.partial_hits ?? 0
      existing.prodes_count += 1
    } else {
      byUser.set(row.user_id, {
        user_id: row.user_id,
        username: row.username,
        first_name: row.first_name,
        last_name: row.last_name,
        total_points: row.total_points ?? 0,
        exact_hits: row.exact_hits ?? 0,
        partial_hits: row.partial_hits ?? 0,
        prodes_count: 1,
      })
    }
  }

  return [...byUser.values()].sort((a, b) => b.total_points - a.total_points)
}

export default async function RankingPage() {
  const rows = await fetchGlobalRanking()

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Ranking General</h1>
        <span style={{ color: '#64748b', fontSize: '13px' }}>{rows.length} usuarios</span>
      </div>
      <RankingTable rows={rows} />
    </>
  )
}
