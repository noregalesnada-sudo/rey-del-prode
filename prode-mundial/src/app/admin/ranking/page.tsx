import { createClient } from '@supabase/supabase-js'
import RankingTable from './_components/RankingTable'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type ProdeOption = { id: string; name: string }

export type LeaderboardRow = {
  prode_id: string
  user_id: string
  username: string | null
  first_name: string | null
  last_name: string | null
  total_points: number
  exact_hits: number
  partial_hits: number
}

async function fetchData(): Promise<{ prodes: ProdeOption[]; rows: LeaderboardRow[] }> {
  const [prodesRes, leaderboardRes, spectatorsRes] = await Promise.all([
    adminClient
      .from('prodes')
      .select('id, name')
      .order('name', { ascending: true }),
    adminClient
      // Vista plana en vez de la MV (eliminamos el REFRESH; página admin, datos en RAM)
      .from('leaderboard')
      .select('prode_id, user_id, username, first_name, last_name, total_points, exact_hits, partial_hits')
      .order('total_points', { ascending: false }),
    adminClient
      .from('prode_members')
      .select('user_id, prode_id')
      .eq('spectator', true),
  ])

  const spectatorSet = new Set(
    (spectatorsRes.data ?? []).map((r: { user_id: string; prode_id: string }) => `${r.user_id}:${r.prode_id}`)
  )

  const rows = (leaderboardRes.data ?? [] as LeaderboardRow[]).filter(
    (r: LeaderboardRow) => !spectatorSet.has(`${r.user_id}:${r.prode_id}`)
  )

  return {
    prodes: (prodesRes.data ?? []) as ProdeOption[],
    rows,
  }
}

export default async function RankingPage() {
  const { prodes, rows } = await fetchData()

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Ranking por Prode</h1>
      </div>
      <RankingTable prodes={prodes} rows={rows} />
    </>
  )
}
