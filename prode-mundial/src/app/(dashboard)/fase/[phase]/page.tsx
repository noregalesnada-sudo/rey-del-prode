import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { connection } from 'next/server'
import MatchSection from '@/components/matches/MatchSection'
import { type Match } from '@/components/matches/MatchCard'
const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PHASE_CONFIG: Record<string, { label: string; icon: string }> = {
  groups: { label: 'FASE DE GRUPOS', icon: '🏆' },
  r32:    { label: '16VOS DE FINAL', icon: '⚽' },
  r16:    { label: 'OCTAVOS DE FINAL', icon: '⚽' },
  qf:     { label: 'CUARTOS DE FINAL', icon: '⚽' },
  sf:     { label: 'SEMIFINALES', icon: '⚽' },
  final:  { label: 'FINAL', icon: '🏅' },
}

export default async function FasePage({ params }: { params: Promise<{ phase: string }> }) {
  const { phase } = await params
  const config = PHASE_CONFIG[phase]

  if (!config) {
    return <div style={{ color: 'var(--text-muted)', padding: '40px' }}>Fase no encontrada.</div>
  }

  await connection()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // adminClient para bypasear RLS — matches son datos públicos
  const { data: matches } = await adminClient
    .from('matches')
    .select('*')
    .eq('phase', phase)
    .order('match_date', { ascending: true })

  // Default picks del usuario
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
      homeTeam: m.home_team ?? 'A definir',
      awayTeam: m.away_team ?? 'A definir',
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

  // Separar tercer puesto de la final
  const thirdPlace = formatted.filter((m) => (matches ?? []).find((r) => r.id === m.id)?.is_third_place)
  const finalMatch = formatted.filter((m) => !(matches ?? []).find((r) => r.id === m.id)?.is_third_place)

  // Para fase de grupos, agrupar por grupo
  if (phase === 'groups') {
    const groups = [...new Set(formatted.map((m) => m.group).filter(Boolean))].sort()
    return (
      <div>
        <h1 style={{ fontWeight: 900, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', padding: '0 4px' }}>
          {config.icon} {config.label}
        </h1>
        {groups.map((g) => (
          <MatchSection
            key={g}
            title={`GRUPO ${g}`}
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
        {config.icon} {config.label}
      </h1>

      {phase === 'final' ? (
        <>
          {finalMatch.length > 0 && (
            <MatchSection title="FINAL" icon="🏆" matches={finalMatch} canEdit={false} />
          )}
          {thirdPlace.length > 0 && (
            <MatchSection title="TERCER PUESTO" icon="🥉" matches={thirdPlace} canEdit={false} />
          )}
          {finalMatch.length === 0 && thirdPlace.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontSize: '14px' }}>
              Los partidos se confirman una vez terminada la fase anterior.
            </div>
          )}
        </>
      ) : formatted.length > 0 ? (
        <MatchSection title={config.label} icon={config.icon} matches={formatted} canEdit={false} />
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontSize: '14px' }}>
          Los partidos de esta fase se confirman una vez terminada la fase anterior.
        </div>
      )}
    </div>
  )
}
