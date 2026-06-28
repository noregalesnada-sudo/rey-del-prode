import { redirect, notFound } from 'next/navigation'
import { hasLocale } from '@/app/[lang]/dictionaries'

// ⛔ DESACTIVADO — "Mis Pronósticos general" se retiró del flujo (modelo per-prode).
// Esta ruta ya no se puede usar: redirige al inicio. El código ORIGINAL queda preservado,
// comentado más abajo (a propósito, no borrar) por si hay que reactivarlo.
export default async function DashboardPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  redirect(`/${lang}/inicio`)
}

/* ===== CÓDIGO ORIGINAL PRESERVADO (NO BORRAR) — "Mis Pronósticos" =====

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { connection } from 'next/server'
import DashboardTabs from '@/components/dashboard/DashboardTabs'
import { type Match } from '@/components/matches/MatchCard'
import { translateTeam } from '@/lib/team-names'

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function DashboardPage({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { lang } = await params
  const { tab } = await searchParams
  const initialTab = tab === 'todos' || tab === 'vivo' ? tab : 'picks'
  await connection()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: scheduledMatches } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'scheduled')
    .eq('competition_code', 'WC')
    .order('match_date', { ascending: true })

  const { data: liveMatches } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'live')
    .eq('competition_code', 'WC')
    .order('match_date', { ascending: true })

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const { data: todayMatches } = await supabase
    .from('matches')
    .select('*')
    .gte('match_date', todayStart.toISOString())
    .lte('match_date', todayEnd.toISOString())
    .eq('competition_code', 'WC')
    .order('match_date', { ascending: true })

  let defaultPicksMap = new Map<string, { home: number; away: number }>()
  let defaultChampionPick: string | null = null
  let officialChampion: string | null = null
  let userTotalPoints = 0
  let userExactHits = 0
  let userPartialHits = 0
  let finishedRows: Record<string, unknown>[] = []

  if (user) {
    const [defaultPicksRes, champPickRes, tournamentRes, finishedMatchesRes] = await Promise.all([
      supabase.from('default_picks').select('match_id, home_pick, away_pick').eq('user_id', user.id),
      adminClient.from('champion_picks').select('team, points').eq('user_id', user.id).is('prode_id', null).maybeSingle(),
      adminClient.from('tournament_settings').select('champion_team').eq('id', 1).maybeSingle(),
      adminClient.from('matches').select('*').eq('status', 'finished').eq('competition_code', 'WC').order('match_date', { ascending: true }),
    ])

    defaultPicksMap = new Map(
      defaultPicksRes.data?.map((p) => [p.match_id, { home: p.home_pick, away: p.away_pick }]) ?? []
    )
    defaultChampionPick = champPickRes.data?.team ?? null
    officialChampion = tournamentRes.data?.champion_team ?? null

    finishedRows = finishedMatchesRes.data ?? []
    const finishedMap = new Map(
      finishedRows.map((m) => [m.id as string, { home: m.home_score as number, away: m.away_score as number }])
    )

    for (const pick of defaultPicksRes.data ?? []) {
      const match = finishedMap.get(pick.match_id)
      if (!match) continue
      const pts = computePickPoints(pick.home_pick, pick.away_pick, match.home, match.away)
      userTotalPoints += pts
      if (pts === 3) userExactHits++
      else if (pts > 0) userPartialHits++
    }

    userTotalPoints += champPickRes.data?.points ?? 0
  }

  function computePickPoints(homePick: number, awayPick: number, actualHome: number, actualAway: number): number {
    if (homePick === actualHome && awayPick === actualAway) return 3
    const actualWinner = actualHome > actualAway ? 'home' : actualAway > actualHome ? 'away' : 'draw'
    const pickWinner = homePick > awayPick ? 'home' : awayPick > homePick ? 'away' : 'draw'
    const actualDiff = actualHome - actualAway
    const pickDiff = homePick - awayPick
    if (pickWinner === actualWinner && pickDiff === actualDiff) return 2
    if (pickWinner === actualWinner) return 1
    return 0
  }

  function toMatchFormat(rows: Record<string, unknown>[]): Match[] {
    return (rows ?? []).map((m) => {
      const pick = defaultPicksMap.get(m.id as string)
      return {
        id: m.id as string,
        homeTeam: translateTeam(m.home_team as string, lang),
        awayTeam: translateTeam(m.away_team as string, lang),
        homeFlag: m.home_flag as string,
        awayFlag: m.away_flag as string,
        matchDate: m.match_date as string,
        status: m.status as 'scheduled' | 'live' | 'finished',
        homeScore: m.home_score as number | undefined,
        awayScore: m.away_score as number | undefined,
        minute: m.minute as number | undefined,
        matchDuration: m.match_duration as string | undefined,
        group: m.group_name as string | undefined,
        phase: m.phase as string,
        minutesUntilStart: (new Date(m.match_date as string).getTime() - Date.now()) / 60000,
        userPickHome: pick?.home,
        userPickAway: pick?.away,
      }
    })
  }

  function toPickMatch(m: Record<string, unknown>) {
    const pick = defaultPicksMap.get(m.id as string)
    const isFinished = m.status === 'finished'
    const isResult = m.status !== 'scheduled'
    const home = m.home_score as number | null
    const away = m.away_score as number | null
    // Se puntúa el resultado de los 90' (reg_*); el marcador que se MUESTRA es el real/en vivo.
    const regHome = (m.reg_home_score as number | null) ?? home
    const regAway = (m.reg_away_score as number | null) ?? away
    const userPoints = isFinished && pick && regHome != null && regAway != null
      ? computePickPoints(pick.home, pick.away, regHome, regAway)
      : undefined
    return {
      id: m.id as string,
      homeTeam: translateTeam(m.home_team as string, lang),
      awayTeam: translateTeam(m.away_team as string, lang),
      homeFlag: m.home_flag as string,
      awayFlag: m.away_flag as string,
      matchDate: m.match_date as string,
      status: m.status as 'scheduled' | 'live' | 'finished',
      group: m.group_name as string | undefined,
      phase: m.phase as string,
      isThirdPlace: (m.is_third_place as boolean | undefined) ?? false,
      matchDuration: m.match_duration as string | undefined,
      defaultPickHome: pick?.home,
      defaultPickAway: pick?.away,
      homeScore: isResult ? (home ?? undefined) : undefined,
      awayScore: isResult ? (away ?? undefined) : undefined,
      userPoints,
    }
  }

  const allPickMatches = [...(scheduledMatches ?? []), ...(liveMatches ?? []), ...finishedRows]
    .map(toPickMatch)
    .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime())

  return (
    <DashboardTabs
      initialTab={initialTab}
      allMatches={toMatchFormat(scheduledMatches ?? [])}
      liveMatches={toMatchFormat(liveMatches ?? [])}
      todayMatches={toMatchFormat(todayMatches ?? [])}
      allPickMatches={allPickMatches}
      isLoggedIn={!!user}
      defaultChampionPick={defaultChampionPick}
      officialChampion={officialChampion}
      userTotalPoints={userTotalPoints}
      userExactHits={userExactHits}
      userPartialHits={userPartialHits}
    />
  )
}

===== FIN CÓDIGO ORIGINAL ===== */
