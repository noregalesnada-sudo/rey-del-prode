'use client'

import { useState } from 'react'
import MatchSection from '@/components/matches/MatchSection'
import { type Match } from '@/components/matches/MatchCard'
import { useDictionary } from '@/hooks/useDictionary'

const PHASES = ['groups', 'r32', 'r16', 'qf', 'sf', 'final'] as const
type Phase = (typeof PHASES)[number]
const ICON: Record<Phase, string> = { groups: '🏆', r32: '⚽', r16: '⚽', qf: '⚽', sf: '⚽', final: '🏅' }

interface FixtureViewProps {
  matches: Match[]
  initialPhase?: string
}

export default function FixtureView({ matches, initialPhase }: FixtureViewProps) {
  const t = useDictionary()
  const available = PHASES.filter((p) => matches.some((m) => m.phase === p))
  const valid = (p?: string): p is Phase => !!p && (PHASES as readonly string[]).includes(p)
  const [phase, setPhase] = useState<Phase>(valid(initialPhase) ? initialPhase : available[0] ?? 'groups')

  const phaseMatches = matches.filter((m) => m.phase === phase)
  const phaseLabel = (t.nav.phases as Record<string, string>)[phase]
  const groups = phase === 'groups'
    ? ([...new Set(phaseMatches.map((m) => m.group).filter(Boolean))].sort() as string[])
    : []

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ fontWeight: 900, fontSize: 16, textTransform: 'uppercase', letterSpacing: 1, margin: '0 4px 14px' }}>
        {t.nav.fasesMundial}
      </h1>

      {/* Filtro de fase */}
      <div className="chips-row" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '2px 4px 14px' }}>
        {available.map((p) => {
          const on = p === phase
          return (
            <button
              key={p}
              onClick={() => setPhase(p)}
              style={{
                flex: '0 0 auto', padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 800, cursor: 'pointer',
                border: on ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: on ? 'var(--accent)' : 'transparent',
                color: on ? '#fff' : 'var(--text-muted)', whiteSpace: 'nowrap',
              }}
            >
              {ICON[p]} {(t.nav.phases as Record<string, string>)[p]}
            </button>
          )
        })}
      </div>

      {phase === 'groups'
        ? groups.map((g) => (
            <MatchSection key={g} title={`${t.fase.group} ${g}`} matches={phaseMatches.filter((m) => m.group === g)} canEdit={false} />
          ))
        : phaseMatches.length > 0
          ? <MatchSection title={phaseLabel} icon={ICON[phase]} matches={phaseMatches} canEdit={false} />
          : <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontSize: 14 }}>{t.fase.pendingMatches}</div>}
    </div>
  )
}
