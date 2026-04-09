'use server'

import { createClient } from '@/lib/supabase/server'

export async function saveDefaultPick(matchId: string, home: number, away: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // Verificar cierre 15 min antes
  const { data: match } = await supabase
    .from('matches')
    .select('match_date, status')
    .eq('id', matchId)
    .single()

  if (!match) return { error: 'Partido no encontrado' }
  if (match.status !== 'scheduled') return { error: 'El partido ya comenzó' }

  const minutesUntilStart = (new Date(match.match_date).getTime() - Date.now()) / 60000
  if (minutesUntilStart < 15) return { error: 'Cerrado (menos de 15 min)' }

  const { error } = await supabase
    .from('default_picks')
    .upsert(
      { user_id: user.id, match_id: matchId, home_pick: home, away_pick: away, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,match_id' }
    )

  if (error) return { error: error.message }
  return { success: true }
}

export async function saveAllDefaultPicks(picks: { matchId: string; home: number; away: number }[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // Filtrar solo partidos que aún se pueden editar
  const { data: matches } = await supabase
    .from('matches')
    .select('id, match_date, status')
    .in('id', picks.map((p) => p.matchId))

  if (!matches) return { error: 'Error al verificar partidos' }

  const now = Date.now()
  const validPicks = picks.filter((p) => {
    const match = matches.find((m) => m.id === p.matchId)
    if (!match) return false
    if (match.status !== 'scheduled') return false
    const minutes = (new Date(match.match_date).getTime() - now) / 60000
    return minutes >= 15
  })

  if (validPicks.length === 0) return { error: 'No hay picks válidos para guardar' }

  const rows = validPicks.map((p) => ({
    user_id: user.id,
    match_id: p.matchId,
    home_pick: p.home,
    away_pick: p.away,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase
    .from('default_picks')
    .upsert(rows, { onConflict: 'user_id,match_id' })

  if (error) return { error: error.message }
  return { success: true, saved: validPicks.length }
}
