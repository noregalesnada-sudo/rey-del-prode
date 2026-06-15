import { createClient } from '@/lib/supabase/server'
import { connection } from 'next/server'
import { notFound } from 'next/navigation'
import { hasLocale } from '@/app/[lang]/dictionaries'
import { translateTeam } from '@/lib/team-names'
import { fetchStandings, getFlag } from '@/lib/football-data'
import { type Match } from '@/components/matches/MatchCard'
import FixtureView, { type GroupStanding } from '@/components/matches/FixtureView'

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

  let pickMap = new Map<string, { home: number; away: number }>()
  if (user) {
    const { data: picks } = await supabase
      .from('default_picks')
      .select('match_id, home_pick, away_pick')
      .eq('user_id', user.id)
    pickMap = new Map((picks ?? []).map((p) => [p.match_id, { home: p.home_pick, away: p.away_pick }]))
  }

  const tbdLabel = lang === 'en' ? 'TBD' : 'A definir'

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
