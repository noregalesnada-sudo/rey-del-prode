'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Plazo: 15 min antes del primer partido (11 jun 2026 16:00 ART = 19:00 UTC)
const CHAMPION_DEADLINE = new Date('2026-06-11T16:00:00-03:00').getTime() - 15 * 60 * 1000


// Guardar pick de campeón. prodeId = undefined → default (Mis Pronósticos)
export async function saveChampionPick(
  team: string,
  prodeId?: string
): Promise<{ error?: string }> {
  if (Date.now() >= CHAMPION_DEADLINE) return { error: 'El plazo para elegir campeón ya cerró.' }

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

export interface RevealedChampion {
  userId: string
  name: string
  avatarUrl: string | null
  team: string | null
  isYou: boolean
}

// Lista el campeón elegido por cada miembro activo del prode. Los picks ya están
// congelados (el plazo cerró al inicio del torneo), así que no hay gate: se revela
// siempre. Campeón efectivo = override del prode ?? default global ("Mis Pronósticos").
export async function getChampionPicks(
  prodeId: string
): Promise<{ error: string } | { champions: RevealedChampion[]; officialChampion: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // El que pide tiene que ser miembro activo del prode
  const { data: membership } = await adminClient
    .from('prode_members')
    .select('status')
    .eq('prode_id', prodeId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()
  if (!membership) return { error: 'No autorizado' }

  // Miembros activos no espectadores
  const { data: members } = await adminClient
    .from('prode_members')
    .select('user_id')
    .eq('prode_id', prodeId)
    .eq('status', 'active')
    .eq('spectator', false)
  const memberIds = (members ?? []).map((m: { user_id: string }) => m.user_id)
  if (memberIds.length === 0) return { champions: [], officialChampion: null }

  const [prodeChampsRes, defaultChampsRes, profilesRes, tournamentRes] = await Promise.all([
    adminClient
      .from('champion_picks')
      .select('user_id, team')
      .eq('prode_id', prodeId)
      .in('user_id', memberIds),
    adminClient
      .from('champion_picks')
      .select('user_id, team')
      .is('prode_id', null)
      .in('user_id', memberIds),
    adminClient
      .from('profiles')
      .select('id, username, first_name, last_name, avatar_url')
      .in('id', memberIds),
    adminClient.from('tournament_settings').select('champion_team').eq('id', 1).maybeSingle(),
  ])

  type ChampRow = NonNullable<typeof prodeChampsRes.data>[number]
  type Profile = NonNullable<typeof profilesRes.data>[number]

  const prodeMap = new Map<string, ChampRow>((prodeChampsRes.data ?? []).map((r) => [r.user_id, r]))
  const defaultMap = new Map<string, ChampRow>((defaultChampsRes.data ?? []).map((r) => [r.user_id, r]))
  const profileMap = new Map<string, Profile>((profilesRes.data ?? []).map((p) => [p.id, p]))

  const officialChampion = tournamentRes.data?.champion_team ?? null

  const champions: RevealedChampion[] = memberIds
    .map((id: string): RevealedChampion => {
      const effective = prodeMap.get(id)?.team ?? defaultMap.get(id)?.team ?? null
      const profile = profileMap.get(id)
      const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim()
      return {
        userId: id,
        name: fullName || profile?.username || 'usuario',
        avatarUrl: profile?.avatar_url ?? null,
        team: effective,
        isYou: id === user.id,
      }
    })
    // Vos primero; después los que eligieron antes que los que no; luego alfabético
    .sort((a, b) => {
      if (a.isYou !== b.isYou) return a.isYou ? -1 : 1
      const ha = a.team ? 0 : 1
      const hb = b.team ? 0 : 1
      if (ha !== hb) return ha - hb
      return a.name.localeCompare(b.name)
    })

  return { champions, officialChampion }
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
