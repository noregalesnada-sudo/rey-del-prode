'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { computePoints } from '@/lib/compute-points'

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
  if (!Number.isInteger(home) || !Number.isInteger(away) || home < 0 || away < 0) return { error: 'Marcador inválido' }

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

export async function clearPick(matchId: string, prodeId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: match } = await supabase
    .from('matches')
    .select('match_date, status')
    .eq('id', matchId)
    .single()

  if (!match) return { error: 'Partido no encontrado' }
  if (match.status !== 'scheduled') return { error: 'El partido ya comenzó' }

  const minutesUntilStart = (new Date(match.match_date).getTime() - Date.now()) / 60000
  if (minutesUntilStart < 15) return { error: 'Ya no podés modificar este pick' }

  // adminClient: no existe policy de DELETE en `picks` (RLS la bloquea silenciosamente).
  // La validación de dueño la hacemos arriba + el filtro user_id, igual que en default-picks.
  const { error } = await adminClient
    .from('picks')
    .delete()
    .eq('user_id', user.id)
    .eq('prode_id', prodeId)
    .eq('match_id', matchId)

  if (error) return { error: error.message }

  revalidatePath('/')
  return { success: true }
}

export async function saveAllPicksBulk(
  picks: { matchId: string; home: number; away: number }[],
  prodeId: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: matches } = await supabase
    .from('matches')
    .select('id, match_date, status')
    .in('id', picks.map(p => p.matchId))

  if (!matches) return { error: 'Error al verificar partidos' }

  const now = Date.now()
  const validPicks = picks.filter(p => {
    const match = matches.find(m => m.id === p.matchId)
    if (!match) return false
    if (match.status !== 'scheduled') return false
    if (!Number.isInteger(p.home) || !Number.isInteger(p.away) || p.home < 0 || p.away < 0) return false
    return (new Date(match.match_date).getTime() - now) / 60000 >= 15
  })

  if (validPicks.length === 0) return { error: 'No hay picks válidos para guardar' }

  const rows = validPicks.map(p => ({
    user_id: user.id,
    prode_id: prodeId,
    match_id: p.matchId,
    home_pick: p.home,
    away_pick: p.away,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase
    .from('picks')
    .upsert(rows, { onConflict: 'user_id,prode_id,match_id' })

  if (error) return { error: error.message }
  revalidatePath('/')
  return { success: true, saved: validPicks.length }
}

export async function clearPicksBulk(matchIds: string[], prodeId: string) {
  if (matchIds.length === 0) return { success: true }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: matches } = await supabase
    .from('matches')
    .select('id, match_date, status')
    .in('id', matchIds)

  if (!matches) return { error: 'Error al verificar partidos' }

  const now = Date.now()
  const validMatchIds = matches
    .filter(m => m.status === 'scheduled' && (new Date(m.match_date).getTime() - now) / 60000 >= 15)
    .map(m => m.id)

  if (validMatchIds.length === 0) return { error: 'Ya no podés modificar estos picks' }

  // adminClient: RLS no tiene policy de DELETE en `picks`. count: 'exact' → borrados reales.
  const { error, count } = await adminClient
    .from('picks')
    .delete({ count: 'exact' })
    .eq('user_id', user.id)
    .eq('prode_id', prodeId)
    .in('match_id', validMatchIds)

  if (error) return { error: error.message }
  revalidatePath('/')
  return { success: true, deleted: count ?? validMatchIds.length }
}

// Carga el MISMO pick de un partido en TODOS los prodes activos del usuario de una sola vez.
// Es explícito (botón "Guardar en todos mis prodes") y PISA cualquier override previo de ese
// partido en cada prode. También actualiza Mis Pronósticos (default_picks): es el único contexto
// donde tocar la baseline es limpio, porque la intención del usuario es explícita y global.
export async function savePickAllProdes(matchId: string, home: number, away: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: match } = await supabase
    .from('matches')
    .select('match_date, status')
    .eq('id', matchId)
    .single()

  if (!match) return { error: 'Partido no encontrado' }
  if (match.status !== 'scheduled') return { error: 'El partido ya comenzó' }
  if (!Number.isInteger(home) || !Number.isInteger(away) || home < 0 || away < 0) return { error: 'Marcador inválido' }
  const minutesUntilStart = (new Date(match.match_date).getTime() - Date.now()) / 60000
  if (minutesUntilStart < 15) return { error: 'Ya no podés modificar este pick (cierra 15 min antes)' }

  // Prodes activos donde el usuario juega (no espectador: ahí no puntúa).
  const { data: members } = await supabase
    .from('prode_members')
    .select('prode_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .eq('spectator', false)
  const prodeIds = (members ?? []).map((m) => m.prode_id)

  const now = new Date().toISOString()

  // Override en cada prode (pisa lo que hubiera) + baseline global en Mis Pronósticos.
  if (prodeIds.length > 0) {
    const rows = prodeIds.map((prode_id) => ({
      user_id: user.id, prode_id, match_id: matchId, home_pick: home, away_pick: away, updated_at: now,
    }))
    const { error } = await supabase.from('picks').upsert(rows, { onConflict: 'user_id,prode_id,match_id' })
    if (error) return { error: error.message }
  }

  const { error: defErr } = await supabase
    .from('default_picks')
    .upsert(
      { user_id: user.id, match_id: matchId, home_pick: home, away_pick: away, updated_at: now },
      { onConflict: 'user_id,match_id' }
    )
  if (defErr) return { error: defErr.message }

  revalidatePath('/')
  return { success: true, count: prodeIds.length }
}

export interface RevealedPick {
  userId: string
  name: string
  avatarUrl: string | null
  home: number
  away: number
  points: number | null
  isYou: boolean
}

// Devuelve los pronósticos de TODOS los miembros del prode para un partido.
// Solo se permite cuando la edición ya cerró (partido empezado/finalizado o <15 min),
// para no revelar picks ajenos antes de tiempo (anti-trampa). El pick efectivo de cada
// usuario es su override del prode (tabla picks) o, si no tiene, su Mis Pronósticos.
export async function getMatchPicks(matchId: string, prodeId: string) {
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

  // El partido tiene que estar cerrado a edición antes de revelar
  const { data: match } = await adminClient
    .from('matches')
    .select('match_date, status, home_score, away_score')
    .eq('id', matchId)
    .single()
  if (!match) return { error: 'Partido no encontrado' }
  const minutesUntilStart = (new Date(match.match_date).getTime() - Date.now()) / 60000
  const isLocked = match.status !== 'scheduled' || minutesUntilStart < 15
  if (!isLocked) return { error: 'Los pronósticos se revelan cuando cierra la edición' }

  // Puntos calculados al vuelo contra el marcador (en vivo o final), igual para todos.
  // No dependemos del `points` guardado en `picks` porque los que heredan "Mis Pronósticos"
  // recién se materializan con el cron y quedarían sin badge.
  const hasScore =
    (match.status === 'live' || match.status === 'finished') &&
    match.home_score != null &&
    match.away_score != null

  // Miembros activos no espectadores
  const { data: members } = await adminClient
    .from('prode_members')
    .select('user_id')
    .eq('prode_id', prodeId)
    .eq('status', 'active')
    .eq('spectator', false)
  const memberIds = (members ?? []).map((m: { user_id: string }) => m.user_id)
  if (memberIds.length === 0) return { picks: [] as RevealedPick[] }

  const [prodePicksRes, defaultPicksRes, profilesRes] = await Promise.all([
    adminClient
      .from('picks')
      .select('user_id, home_pick, away_pick, points')
      .eq('prode_id', prodeId)
      .eq('match_id', matchId)
      .in('user_id', memberIds),
    adminClient
      .from('default_picks')
      .select('user_id, home_pick, away_pick')
      .eq('match_id', matchId)
      .in('user_id', memberIds),
    adminClient
      .from('profiles')
      .select('id, username, first_name, last_name, avatar_url')
      .in('id', memberIds),
  ])

  type ProdePick = NonNullable<typeof prodePicksRes.data>[number]
  type DefaultPick = NonNullable<typeof defaultPicksRes.data>[number]
  type Profile = NonNullable<typeof profilesRes.data>[number]

  const prodeMap = new Map<string, ProdePick>((prodePicksRes.data ?? []).map((p) => [p.user_id, p]))
  const defaultMap = new Map<string, DefaultPick>((defaultPicksRes.data ?? []).map((p) => [p.user_id, p]))
  const profileMap = new Map<string, Profile>((profilesRes.data ?? []).map((p) => [p.id, p]))

  const picks: RevealedPick[] = memberIds
    .map((id: string): RevealedPick | null => {
      const override = prodeMap.get(id)
      const effective = override ?? defaultMap.get(id)
      if (!effective) return null
      const profile = profileMap.get(id)
      // Nombre y apellido; si están vacíos cae al username
      const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim()
      return {
        userId: id,
        name: fullName || profile?.username || 'usuario',
        avatarUrl: profile?.avatar_url ?? null,
        home: effective.home_pick,
        away: effective.away_pick,
        points: hasScore
          ? computePoints(effective.home_pick, effective.away_pick, match.home_score as number, match.away_score as number)
          : null,
        isYou: id === user.id,
      }
    })
    .filter((p): p is RevealedPick => p !== null)
    // Más puntos primero (nulls al final), luego alfabético; vos primero a igualdad
    .sort((a, b) => {
      if (a.isYou !== b.isYou) return a.isYou ? -1 : 1
      const pa = a.points ?? -1
      const pb = b.points ?? -1
      if (pa !== pb) return pb - pa
      return a.name.localeCompare(b.name)
    })

  return { picks }
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
