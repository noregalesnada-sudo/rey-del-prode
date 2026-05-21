'use server'

import { createClient as createAdmin } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin-auth'

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
  return { success: true }
}

export async function getMatches(phase?: string, status?: string) {
  await requireAdmin()

  let query = adminClient
    .from('matches')
    .select('id, home_team, away_team, match_date, phase, grupo, sede, estadio, home_score, away_score, status')
    .order('match_date', { ascending: true })

  if (phase)  query = query.eq('phase', phase)
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}
