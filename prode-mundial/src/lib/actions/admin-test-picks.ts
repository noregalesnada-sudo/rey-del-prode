'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { fetchMatches, getFlag, mapStage, mapStatus } from '@/lib/football-data'

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function saveAdminTestPick(matchId: string, homePick: number, awayPick: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: roleRow } = await adminClient
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()
  if (!roleRow) return { error: 'No autorizado' }

  const { data: match } = await adminClient
    .from('matches')
    .select('match_date, status')
    .eq('id', matchId)
    .single()
  if (!match) return { error: 'Partido no encontrado' }
  if (match.status !== 'scheduled') return { error: 'El partido ya comenzó — no se puede modificar el pick' }
  if (new Date(match.match_date) <= new Date()) return { error: 'El partido ya comenzó — no se puede modificar el pick' }

  const { error } = await adminClient
    .from('admin_test_picks')
    .upsert(
      { user_id: user.id, user_email: user.email!, match_id: matchId, home_pick: homePick, away_pick: awayPick },
      { onConflict: 'user_id,match_id' }
    )

  if (error) return { error: error.message }
  revalidatePath('/admin/partidos-live')
  return { success: true }
}

export async function updateMatchScore(
  matchId: string,
  homeScore: number | null,
  awayScore: number | null,
  status: 'scheduled' | 'live' | 'finished'
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: roleRow } = await adminClient
    .from('user_roles').select('role').eq('user_id', user.id).single()
  if (!roleRow) return { error: 'No autorizado' }

  const { error } = await adminClient
    .from('matches')
    .update({ home_score: homeScore, away_score: awayScore, status })
    .eq('id', matchId)

  if (error) return { error: error.message }
  revalidatePath('/admin/partidos-live')
  return { success: true }
}

export async function runSyncForAdmin(competitions?: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: roleRow } = await adminClient
    .from('user_roles').select('role').eq('user_id', user.id).single()
  if (!roleRow) return { error: 'No autorizado' }

  const comps = competitions ?? (process.env.SYNC_COMPETITIONS ?? 'WC').split(',').map((s) => s.trim()).filter(Boolean)
  const results: Array<{ competition: string; total?: number; upserted?: number | null; error?: string }> = []

  for (const competition of comps) {
    try {
      const matches = await fetchMatches(competition)
      const rows = matches.map((m) => {
        const hasBothTeams = m.homeTeam?.name && m.awayTeam?.name
        return {
          external_id: String(m.id),
          home_team: hasBothTeams ? (m.homeTeam.shortName || m.homeTeam.name) : null,
          away_team: hasBothTeams ? (m.awayTeam.shortName || m.awayTeam.name) : null,
          home_flag: hasBothTeams ? getFlag(m.homeTeam.tla) : null,
          away_flag: hasBothTeams ? getFlag(m.awayTeam.tla) : null,
          match_date: m.utcDate,
          phase: mapStage(m.stage),
          group_name: m.group ? m.group.replace('GROUP_', '') : null,
          is_third_place: m.stage === 'THIRD_PLACE',
          status: mapStatus(m.status),
          home_score: m.score.fullTime.home,
          away_score: m.score.fullTime.away,
          competition_code: competition,
        }
      })
      const { error, count } = await adminClient
        .from('matches')
        .upsert(rows, { onConflict: 'external_id', count: 'exact' })
      if (error) throw new Error(error.message)
      results.push({ competition, total: rows.length, upserted: count })
    } catch (err) {
      results.push({ competition, error: String(err) })
    }
  }

  revalidatePath('/admin/partidos-live')
  return { results }
}
