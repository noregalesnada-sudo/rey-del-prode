import { createClient } from '@/lib/supabase/server'
import { connection } from 'next/server'
import { notFound } from 'next/navigation'
import { hasLocale } from '@/app/[lang]/dictionaries'
import { translateTeam } from '@/lib/team-names'
import { fetchStandings, getFlag } from '@/lib/football-data'
import { fetchWorldCupOdds, oddsForMatch } from '@/lib/odds-api'
import { type Match } from '@/components/matches/MatchCard'
import FixtureView, { type GroupStanding } from '@/components/matches/FixtureView'
import { effectivePick } from '@/lib/effective-pick'

export default async function FixturePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ phase?: string }>
}) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const { phase } = await searchParams

  await connection()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: rows } = await supabase
    .from('matches')
    .select('*')
    .eq('competition_code', 'WC')
    .order('match_date', { ascending: true })

  // "Tu pick" en el fixture (vista global, no atada a un prode): mostramos el pick efectivo.
  // Por cada partido tomamos, en cada prode activo, el override (tabla picks) ?? el heredado de
  // Mis Pronósticos (default_picks) — la misma regla que adentro del prode y en /inicio. Si TODOS
  // tus prodes coinciden en un valor mostramos ese; si divergen (o no jugás ningún prode) caemos
  // al default. Así el fixture refleja lo que realmente pronosticaste y no un default viejo que ya
  // no usa ningún prode (antes leía crudo default_picks e ignoraba los overrides).
  const pickMap = new Map<string, { home: number; away: number }>()
  if (user) {
    const [membersRes, defaultsRes] = await Promise.all([
      supabase.from('prode_members').select('prode_id').eq('user_id', user.id).eq('status', 'active').eq('spectator', false),
      supabase.from('default_picks').select('match_id, home_pick, away_pick').eq('user_id', user.id),
    ])
    const prodeIds = (membersRes.data ?? []).map((m) => m.prode_id)
    const defaultMap = new Map<string, { home: number; away: number }>(
      (defaultsRes.data ?? []).map((p) => [p.match_id, { home: p.home_pick, away: p.away_pick }])
    )

    // Overrides del usuario en sus prodes activos. Paginado: un usuario en muchos prodes puede
    // superar el límite de 1000 filas de PostgREST y truncar el cálculo de coincidencia.
    const overridesByMatch = new Map<string, Map<string, { home: number; away: number }>>()
    if (prodeIds.length > 0) {
      const SIZE = 1000
      for (let from = 0; ; from += SIZE) {
        const { data } = await supabase
          .from('picks')
          .select('prode_id, match_id, home_pick, away_pick')
          .eq('user_id', user.id)
          .in('prode_id', prodeIds)
          .range(from, from + SIZE - 1)
        if (!data || data.length === 0) break
        for (const o of data) {
          if (!overridesByMatch.has(o.match_id)) overridesByMatch.set(o.match_id, new Map())
          overridesByMatch.get(o.match_id)!.set(o.prode_id, { home: o.home_pick, away: o.away_pick })
        }
        if (data.length < SIZE) break
      }
    }

    for (const matchId of new Set([...defaultMap.keys(), ...overridesByMatch.keys()])) {
      const pick = effectivePick(prodeIds, overridesByMatch.get(matchId), defaultMap.get(matchId))
      if (pick) pickMap.set(matchId, pick)
    }
  }

  const tbdLabel = lang === 'en' ? 'TBD' : 'A definir'

  // Cuotas (consenso de casas). Aislado y tolerante a fallos: si The Odds API
  // falla, el fixture sigue andando y simplemente no se muestran las cuotas.
  let oddsMap: Awaited<ReturnType<typeof fetchWorldCupOdds>> = new Map()
  try {
    oddsMap = await fetchWorldCupOdds()
  } catch {
    oddsMap = new Map()
  }

  const matches: Match[] = (rows ?? []).map((m: Record<string, unknown>) => {
    const pick = pickMap.get(m.id as string)
    const homeTeam = m.home_team ? translateTeam(m.home_team as string, lang) : tbdLabel
    const awayTeam = m.away_team ? translateTeam(m.away_team as string, lang) : tbdLabel
    const tbd = !m.home_team || !m.away_team
    return {
      id: m.id as string,
      homeTeam,
      awayTeam,
      homeFlag: tbd ? '' : ((m.home_flag as string | null) ?? ''),
      awayFlag: tbd ? '' : ((m.away_flag as string | null) ?? ''),
      matchDate: m.match_date as string,
      status: m.status as 'scheduled' | 'live' | 'finished',
      homeScore: (m.home_score as number | null) ?? undefined,
      awayScore: (m.away_score as number | null) ?? undefined,
      minute: (m.minute as number | null) ?? undefined,
      group: (m.group_name as string | null) ?? undefined,
      phase: m.phase as string,
      userPickHome: pick?.home,
      userPickAway: pick?.away,
      minutesUntilStart: (new Date(m.match_date as string).getTime() - Date.now()) / 60000,
      odds: (m.home_team && m.away_team)
        ? oddsForMatch(oddsMap, m.home_team as string, m.away_team as string) ?? undefined
        : undefined,
    }
  })

  // Tabla de grupos (standings). Aislado y tolerante a fallos: si football-data
  // no responde, el fixture sigue andando y simplemente no se muestra la pestaña.
  let standings: GroupStanding[] = []
  try {
    const raw = await fetchStandings('WC')
    standings = raw
      .filter((s) => s.type === 'TOTAL' && s.group)
      .map((s) => ({
        group: (s.group as string).replace(/^Group\s*/i, ''),
        rows: s.table.map((r) => ({
          position: r.position,
          team: translateTeam(r.team.shortName || r.team.name, lang),
          flag: getFlag(r.team.tla),
          played: r.playedGames,
          won: r.won,
          draw: r.draw,
          lost: r.lost,
          gf: r.goalsFor,
          ga: r.goalsAgainst,
          gd: r.goalDifference,
          points: r.points,
        })),
      }))
  } catch {
    standings = []
  }

  return <FixtureView matches={matches} initialPhase={phase} standings={standings} />
}
