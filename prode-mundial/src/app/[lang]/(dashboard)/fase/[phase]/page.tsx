import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { connection } from 'next/server'
import MatchSection from '@/components/matches/MatchSection'
import { type Match } from '@/components/matches/MatchCard'
import { getDictionary, hasLocale } from '@/app/[lang]/dictionaries'
import { notFound } from 'next/navigation'

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PHASE_ICONS: Record<string, string> = {
  groups: '🏆',
  r32: '⚽',
  r16: '⚽',
  qf: '⚽',
  sf: '⚽',
  final: '🏅',
}

export default async function FasePage({ params }: { params: Promise<{ phase: string; lang: string }> }) {
  const { phase, lang } = await params
  if (!hasLocale(lang)) notFound()
  const t = await getDictionary(lang)

  const phaseLabel = (t.fase as Record<string, string>)[phase]
  const icon = PHASE_ICONS[phase]

  if (!phaseLabel || !icon) {
    return <div style={{ color: 'var(--text-muted)', padding: '40px' }}>{t.fase.notFound}</div>
  }

  await connection()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: matches } = await adminClient
    .from('matches')
    .select('*')
    .eq('phase', phase)
    .order('match_date', { ascending: true })

  let defaultPicksMap = new Map<string, { home: number; away: number }>()
  if (user) {
    const { data: picks } = await supabase
      .from('default_picks')
      .select('match_id, home_pick, away_pick')
      .eq('user_id', user.id)
    defaultPicksMap = new Map(picks?.map((p) => [p.match_id, { home: p.home_pick, away: p.away_pick }]) ?? [])
  }

  const formatted: Match[] = (matches ?? []).map((m) => {
    const pick = defaultPicksMap.get(m.id)
    const tbd = !m.home_team || !m.away_team
    return {
      id: m.id,
      homeTeam: m.home_team ?? t.fase.tbd,
      awayTeam: m.away_team ?? t.fase.tbd,
      homeFlag: tbd ? '' : m.home_flag,
      awayFlag: tbd ? '' : m.away_flag,
      matchDate: m.match_date,
      status: m.status,
      homeScore: m.home_score,
      awayScore: m.away_score,
      minute: m.minute,
      group: m.group_name,
      phase: m.phase,
      userPickHome: pick?.home,
      userPickAway: pick?.away,
      minutesUntilStart: (new Date(m.match_date).getTime() - Date.now()) / 60000,
    }
  })

  const thirdPlace = formatted.filter((m) => (matches ?? []).find((r) => r.id === m.id)?.is_third_place)
  const finalMatch = formatted.filter((m) => !(matches ?? []).find((r) => r.id === m.id)?.is_third_place)

  if (phase === 'groups') {
    const groups = [...new Set(formatted.map((m) => m.group).filter(Boolean))].sort()
    return (
      <div>
        <h1 style={{ fontWeight: 900, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', padding: '0 4px' }}>
          {icon} {phaseLabel}
        </h1>
        {groups.map((g) => (
          <MatchSection
            key={g}
            title={`${t.fase.group} ${g}`}
            matches={formatted.filter((m) => m.group === g)}
            canEdit={false}
          />
        ))}
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ fontWeight: 900, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', padding: '0 4px' }}>
        {icon} {phaseLabel}
      </h1>

      {phase === 'final' ? (
        <>
          {finalMatch.length > 0 && (
            <MatchSection title={t.fase.final} icon="🏆" matches={finalMatch} canEdit={false} />
          )}
          {thirdPlace.length > 0 && (
            <MatchSection title={t.fase.third} icon="🥉" matches={thirdPlace} canEdit={false} />
          )}
          {finalMatch.length === 0 && thirdPlace.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontSize: '14px' }}>
              {t.fase.pendingFinal}
            </div>
          )}
        </>
      ) : formatted.length > 0 ? (
        <MatchSection title={phaseLabel} icon={icon} matches={formatted} canEdit={false} />
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontSize: '14px' }}>
          {t.fase.pendingMatches}
        </div>
      )}
    </div>
  )
}
