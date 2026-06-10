'use server'

import { createClient as createAdmin } from '@supabase/supabase-js'
import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin-auth'
import { fetchMatches, getFlag, mapStage, mapStatus } from '@/lib/football-data'
import { recalculateAllFinishedMatches, applyMatchResult } from '@/lib/scoring'

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const MatchSchema = z.object({
  home_team:      z.string().min(1, 'Requerido'),
  away_team:      z.string().min(1, 'Requerido'),
  match_date:     z.string().min(1, 'Requerido'),
  phase:          z.string().min(1, 'Requerido'),
  grupo:          z.string().optional().nullable(),
  sede:           z.string().optional().nullable(),
  estadio:        z.string().optional().nullable(),
  home_score:     z.coerce.number().int().min(0).nullable().optional(),
  away_score:     z.coerce.number().int().min(0).nullable().optional(),
  status:         z.enum(['scheduled', 'live', 'finished', 'postponed']),
})

type MatchInput = z.infer<typeof MatchSchema>

async function auditLog(
  adminEmail: string,
  action: string,
  entity: string,
  entityId: string,
  before?: unknown,
  after?: unknown
) {
  await adminClient.from('audit_logs').insert({
    company_slug: '__admin__',
    admin_email: adminEmail,
    action,
    entity,
    entity_id: entityId,
    before: before ?? null,
    after: after ?? null,
  })
}

export async function createMatch(data: MatchInput) {
  const admin = await requireAdmin()
  const parsed = MatchSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { data: row, error } = await adminClient
    .from('matches')
    .insert(parsed.data)
    .select('id')
    .single()

  if (error) return { error: error.message }

  await auditLog(admin.userId, 'match_created', 'match', row.id, null, parsed.data)
  revalidatePath('/admin/partidos')
  revalidateTag('matches', { expire: 0 })
  await applyMatchResult(row.id)
  return { success: true, id: row.id }
}

export async function updateMatch(id: string, data: MatchInput) {
  const admin = await requireAdmin()
  const parsed = MatchSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { data: before } = await adminClient
    .from('matches')
    .select('*')
    .eq('id', id)
    .single()

  const { error } = await adminClient
    .from('matches')
    .update(parsed.data)
    .eq('id', id)

  if (error) return { error: error.message }

  await auditLog(admin.userId, 'match_updated', 'match', id, before, parsed.data)
  revalidatePath('/admin/partidos')
  revalidateTag('matches', { expire: 0 })
  // Cargar/editar/limpiar el resultado impacta al instante en los prodes: puntúa
  // (o descarta puntos si volvió a no jugado) y refresca el leaderboard.
  await applyMatchResult(id)
  return { success: true }
}

export async function deleteMatch(id: string) {
  const admin = await requireAdmin()

  const { data: before } = await adminClient
    .from('matches')
    .select('*')
    .eq('id', id)
    .single()

  const { error } = await adminClient
    .from('matches')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  await auditLog(admin.userId, 'match_deleted', 'match', id, before, null)
  revalidatePath('/admin/partidos')
  revalidateTag('matches', { expire: 0 })
  return { success: true }
}

export async function syncMatchesFromAPI() {
  await requireAdmin()

  try {
    const matches = await fetchMatches('WC')

    const rows = matches.map((m) => {
      const hasBothTeams = m.homeTeam?.name && m.awayTeam?.name
      return {
        external_id:    String(m.id),
        home_team:      hasBothTeams ? (m.homeTeam.shortName || m.homeTeam.name) : null,
        away_team:      hasBothTeams ? (m.awayTeam.shortName || m.awayTeam.name) : null,
        home_flag:      hasBothTeams ? getFlag(m.homeTeam.tla) : null,
        away_flag:      hasBothTeams ? getFlag(m.awayTeam.tla) : null,
        match_date:     m.utcDate,
        phase:          mapStage(m.stage),
        group_name:     m.group ? m.group.replace('GROUP_', '') : null,
        is_third_place: m.stage === 'THIRD_PLACE',
        status:         mapStatus(m.status),
        home_score:     m.score.fullTime.home,
        away_score:     m.score.fullTime.away,
      }
    })

    const { error, count } = await adminClient
      .from('matches')
      .upsert(rows, { onConflict: 'external_id', count: 'exact' })

    if (error) return { error: error.message }

    revalidatePath('/admin/partidos')
    revalidateTag('matches', { expire: 0 })
    return { success: true, total: rows.length, upserted: count }
  } catch (err) {
    return { error: String(err) }
  }
}

export async function recalculatePointsAction() {
  await requireAdmin()
  const result = await recalculateAllFinishedMatches()
  if ('error' in result && result.error) return { error: result.error }
  revalidatePath('/admin/partidos')
  return result
}

export async function getMatches(phase?: string, status?: string) {
  await requireAdmin()

  let query = adminClient
    .from('matches')
    .select('id, home_team, away_team, home_flag, away_flag, match_date, phase, grupo, sede, estadio, home_score, away_score, status')
    .eq('competition_code', 'WC')
    .order('match_date', { ascending: true })

  if (phase)  query = query.eq('phase', phase)
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}
