'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Plazo: 15 min antes del primer partido (11 jun 2026 19:00 Ciudad de México UTC-6)
const CHAMPION_DEADLINE = new Date('2026-06-11T19:00:00-06:00').getTime() - 15 * 60 * 1000

export function isChampionLocked(): boolean {
  return Date.now() >= CHAMPION_DEADLINE
}

// Guardar pick de campeón. prodeId = undefined → default (Mis Pronósticos)
export async function saveChampionPick(
  team: string,
  prodeId?: string
): Promise<{ error?: string }> {
  if (isChampionLocked()) return { error: 'El plazo para elegir campeón ya cerró.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // Delete + insert para manejar correctamente índices parciales con NULL
  if (prodeId) {
    await adminClient
      .from('champion_picks')
      .delete()
      .eq('user_id', user.id)
      .eq('prode_id', prodeId)

    const { error } = await adminClient
      .from('champion_picks')
      .insert({ user_id: user.id, prode_id: prodeId, team, points: 0 })

    if (error) return { error: error.message }
  } else {
    await adminClient
      .from('champion_picks')
      .delete()
      .eq('user_id', user.id)
      .is('prode_id', null)

    const { error } = await adminClient
      .from('champion_picks')
      .insert({ user_id: user.id, prode_id: null, team, points: 0 })

    if (error) return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return {}
}

// Cuando el campeón es oficial: otorgar 10 pts a todos los que acertaron
export async function calculateChampionPoints(championTeam: string): Promise<{ updated: number }> {
  // Guardar en tournament_settings
  await adminClient
    .from('tournament_settings')
    .update({ champion_team: championTeam })
    .eq('id', 1)

  // Actualizar puntos
  const { data: correct } = await adminClient
    .from('champion_picks')
    .select('id')
    .eq('team', championTeam)
    .eq('points', 0)

  if (!correct || correct.length === 0) return { updated: 0 }

  const ids = correct.map((r) => r.id)
  await adminClient
    .from('champion_picks')
    .update({ points: 10 })
    .in('id', ids)

  return { updated: ids.length }
}
