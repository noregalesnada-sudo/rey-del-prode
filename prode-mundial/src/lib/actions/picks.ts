'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function savePick(matchId: string, prodeId: string, home: number, away: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // Verificar que el partido todavía no empezó (15 min de gracia)
  const { data: match } = await supabase
    .from('matches')
    .select('match_date, status')
    .eq('id', matchId)
    .single()

  if (!match) return { error: 'Partido no encontrado' }
  if (match.status !== 'scheduled') return { error: 'El partido ya comenzó' }

  const minutesUntilStart = (new Date(match.match_date).getTime() - Date.now()) / 60000
  if (minutesUntilStart < 15) return { error: 'Ya no podés modificar este pick (cierra 15 min antes)' }

  const { error } = await supabase
    .from('picks')
    .upsert(
      {
        user_id: user.id,
        prode_id: prodeId,
        match_id: matchId,
        home_pick: home,
        away_pick: away,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,prode_id,match_id' }
    )

  if (error) return { error: error.message }

  revalidatePath('/')
  return { success: true }
}

export async function calculatePoints(matchId: string) {
  const supabase = await createClient()

  const { data: match } = await supabase
    .from('matches')
    .select('home_score, away_score, status')
    .eq('id', matchId)
    .single()

  if (!match || match.status !== 'finished') return { error: 'Partido no finalizado' }

  // Solo picks sin puntuar para no recalcular trabajo ya hecho
  const { data: picks } = await supabase
    .from('picks')
    .select('id, user_id, prode_id, match_id, home_pick, away_pick')
    .eq('match_id', matchId)
    .is('points', null)

  if (!picks || picks.length === 0) return { success: true }

  const actualHome = match.home_score!
  const actualAway = match.away_score!
  const actualWinner = actualHome > actualAway ? 'home' : actualAway > actualHome ? 'away' : 'draw'
  const actualDiff = actualHome - actualAway

  const upsertRows = picks.map((pick) => {
    const pickWinner =
      pick.home_pick > pick.away_pick ? 'home' : pick.away_pick > pick.home_pick ? 'away' : 'draw'
    const pickDiff = pick.home_pick - pick.away_pick

    let points = 0
    if (pick.home_pick === actualHome && pick.away_pick === actualAway) {
      points = 3
    } else if (pickWinner === actualWinner && pickDiff === actualDiff) {
      points = 2
    } else if (pickWinner === actualWinner) {
      points = 1
    }

    return { ...pick, points, updated_at: new Date().toISOString() }
  })

  // Un solo upsert batch reemplaza N UPDATEs secuenciales
  await supabase.from('picks').upsert(upsertRows, { onConflict: 'user_id,prode_id,match_id' })

  return { success: true }
}
