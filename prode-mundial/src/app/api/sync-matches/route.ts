import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { fetchWCMatches, getFlag, mapStage, mapStatus } from '@/lib/football-data'

// Cliente admin — bypasea RLS para escritura
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  // Proteger la ruta con un secret
  const secret = req.headers.get('x-sync-secret')
  if (secret !== process.env.SYNC_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const matches = await fetchWCMatches()

    const rows = matches.map((m) => {
        const hasBothTeams = m.homeTeam?.name && m.awayTeam?.name
        const isThirdPlace = m.stage === 'THIRD_PLACE'
        return {
          external_id: String(m.id),
          home_team: hasBothTeams ? (m.homeTeam.shortName || m.homeTeam.name) : null,
          away_team: hasBothTeams ? (m.awayTeam.shortName || m.awayTeam.name) : null,
          home_flag: hasBothTeams ? getFlag(m.homeTeam.tla) : null,
          away_flag: hasBothTeams ? getFlag(m.awayTeam.tla) : null,
          match_date: m.utcDate,
          phase: mapStage(m.stage),
          group_name: m.group ? m.group.replace('GROUP_', '') : null,
          is_third_place: isThirdPlace,
          status: mapStatus(m.status),
          home_score: m.score.fullTime.home,
          away_score: m.score.fullTime.away,
        }
      })

    const { error, count } = await supabaseAdmin
      .from('matches')
      .upsert(rows, { onConflict: 'external_id', count: 'exact' })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, upserted: count, total: rows.length })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// GET para ver estado actual — con ?debug=1 muestra los stages de la API
export async function GET(req: NextRequest) {
  const debug = req.nextUrl.searchParams.get('debug')

  if (debug === '1') {
    const matches = await fetchWCMatches()
    const stageCounts: Record<string, number> = {}
    matches.forEach((m) => { stageCounts[m.stage] = (stageCounts[m.stage] ?? 0) + 1 })
    return NextResponse.json({ stages: stageCounts })
  }

  const { count } = await supabaseAdmin
    .from('matches')
    .select('*', { count: 'exact', head: true })

  return NextResponse.json({ matches_in_db: count })
}
