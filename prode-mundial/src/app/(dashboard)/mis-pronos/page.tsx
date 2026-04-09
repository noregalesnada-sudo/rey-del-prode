import { createClient } from '@/lib/supabase/server'
import DashboardTabs from '@/components/dashboard/DashboardTabs'
import { type Match } from '@/components/matches/MatchCard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Todos los partidos scheduled (próximos)
  const { data: scheduledMatches } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'scheduled')
    .order('match_date', { ascending: true })

  // Partidos en vivo
  const { data: liveMatches } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'live')
    .order('match_date', { ascending: true })

  // Partidos de hoy (para tab VIVO cuando no hay en vivo)
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const { data: todayMatches } = await supabase
    .from('matches')
    .select('*')
    .gte('match_date', todayStart.toISOString())
    .lte('match_date', todayEnd.toISOString())
    .order('match_date', { ascending: true })

  // Default picks del usuario
  let defaultPicksMap = new Map<string, { home: number; away: number }>()
  if (user) {
    const { data: defaultPicks } = await supabase
      .from('default_picks')
      .select('match_id, home_pick, away_pick')
      .eq('user_id', user.id)

    defaultPicksMap = new Map(
      defaultPicks?.map((p) => [p.match_id, { home: p.home_pick, away: p.away_pick }]) ?? []
    )
  }

  function toMatchFormat(rows: Record<string, unknown>[]): Match[] {
    return (rows ?? []).map((m) => {
      const pick = defaultPicksMap.get(m.id as string)
      return {
        id: m.id as string,
        homeTeam: m.home_team as string,
        awayTeam: m.away_team as string,
        homeFlag: m.home_flag as string,
        awayFlag: m.away_flag as string,
        matchDate: m.match_date as string,
        status: m.status as 'scheduled' | 'live' | 'finished',
        homeScore: m.home_score as number | undefined,
        awayScore: m.away_score as number | undefined,
        minute: m.minute as number | undefined,
        group: m.group_name as string | undefined,
        phase: m.phase as string,
        minutesUntilStart: (new Date(m.match_date as string).getTime() - Date.now()) / 60000,
        userPickHome: pick?.home,
        userPickAway: pick?.away,
      }
    })
  }

  // Para Mis Picks — todos los partidos con default picks cargados
  const allPickMatches = (scheduledMatches ?? []).map((m) => {
    const pick = defaultPicksMap.get(m.id)
    return {
      id: m.id as string,
      homeTeam: m.home_team as string,
      awayTeam: m.away_team as string,
      homeFlag: m.home_flag as string,
      awayFlag: m.away_flag as string,
      matchDate: m.match_date as string,
      status: m.status as 'scheduled' | 'live' | 'finished',
      group: m.group_name as string | undefined,
      phase: m.phase as string,
      defaultPickHome: pick?.home,
      defaultPickAway: pick?.away,
    }
  })

  return (
    <DashboardTabs
      allMatches={toMatchFormat(scheduledMatches ?? [])}
      liveMatches={toMatchFormat(liveMatches ?? [])}
      todayMatches={toMatchFormat(todayMatches ?? [])}
      allPickMatches={allPickMatches}
      isLoggedIn={!!user}
    />
  )
}
