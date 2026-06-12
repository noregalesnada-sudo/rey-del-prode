import { createClient } from '@/lib/supabase/server'
import { connection } from 'next/server'
import { notFound } from 'next/navigation'
import { hasLocale } from '@/app/[lang]/dictionaries'
import { translateTeam } from '@/lib/team-names'
import { type Match } from '@/components/matches/MatchCard'
import FixtureView from '@/components/matches/FixtureView'

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

  return <FixtureView matches={matches} initialPhase={phase} />
}
