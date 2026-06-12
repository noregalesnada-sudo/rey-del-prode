import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { revalidateTag } from 'next/cache'
import logger from '@/lib/logger'
import { calcPointsForMatch, recalcAllActiveMatches } from '@/lib/scoring'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST — protegido con x-sync-secret
// Body: { matchId?: string }  → calcula puntos de un partido específico
//       { champion?: string } → asigna 10 pts a los que acertaron el campeón
//       Sin body              → calcula puntos de TODOS los partidos finished con picks sin puntuar
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-sync-secret')
  if (secret !== process.env.SYNC_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { matchId?: string; champion?: string } = {}
  try {
    body = await req.json()
  } catch {
    // body vacío es válido — procesa todos los partidos
  }

  if (body.champion) {
    return handleChampion(body.champion)
  }

  if (body.matchId) {
    const result = await calcPointsForMatch(body.matchId)
    if (result.success) {
      revalidateTag('leaderboard', { expire: 0 })
    }
    return NextResponse.json(result)
  }

  const result = await recalcAllActiveMatches()
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: 500 })

  logger.info({ processed: result.processed, materialized: result.materialized, errors: result.errors?.length ?? 0 }, 'calculate-points batch ok')
  return NextResponse.json(result)
}

async function handleChampion(championTeam: string) {
  await adminClient
    .from('tournament_settings')
    .update({ champion_team: championTeam })
    .eq('id', 1)

  const { data: correct } = await adminClient
    .from('champion_picks')
    .select('id')
    .eq('team', championTeam)
    .eq('points', 0)

  if (!correct || correct.length === 0) {
    return NextResponse.json({ success: true, champion: championTeam, updated: 0 })
  }

  const ids = correct.map((r) => r.id)
  await adminClient.from('champion_picks').update({ points: 10 }).in('id', ids)

  revalidateTag('leaderboard', { expire: 0 })

  return NextResponse.json({ success: true, champion: championTeam, updated: ids.length })
}
