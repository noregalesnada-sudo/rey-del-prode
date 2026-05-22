'use client'

import { useState, Fragment } from 'react'
import MatchSection from './MatchSection'
import { type Match } from './MatchCard'

const PHASE_ORDER = ['r32', 'r16', 'qf', 'sf', 'final'] as const
type KnockoutPhase = (typeof PHASE_ORDER)[number]

interface KnockoutFilterProps {
  matches: Match[]
  prodeId?: string
  canEdit: boolean
  onPickSave?: (matchId: string, home: number, away: number) => Promise<void>
  onPickClear?: (matchId: string) => Promise<void>
  phaseLabels: { r32: string; r16: string; qf: string; sf: string; final: string }
  thirdLabel: string
  allLabel: string
}

export default function KnockoutFilter({
  matches,
  prodeId,
  canEdit,
  onPickSave,
  onPickClear,
  phaseLabels,
  thirdLabel,
  allLabel,
}: KnockoutFilterProps) {
  const [selectedPhase, setSelectedPhase] = useState<'' | KnockoutPhase>('')

  const availablePhases = PHASE_ORDER.filter(p => matches.some(m => m.phase === p))
  const phasesToRender = selectedPhase === '' ? availablePhases : [selectedPhase]
  const filteredMatches = selectedPhase === '' ? matches : matches.filter(m => m.phase === selectedPhase)

  return (
    <div>
      <div style={{ marginBottom: '12px' }}>
        <select
          value={selectedPhase}
          onChange={e => setSelectedPhase(e.target.value as '' | KnockoutPhase)}
          style={{
            background: selectedPhase ? 'var(--accent)' : 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: selectedPhase ? '#fff' : 'var(--text-muted)',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{allLabel}</option>
          {availablePhases.map(p => (
            <option key={p} value={p} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
              {phaseLabels[p]}
            </option>
          ))}
        </select>
      </div>

      {phasesToRender.map(phase => {
        const phaseMatches = filteredMatches.filter(m => m.phase === phase)
        if (phaseMatches.length === 0) return null

        if (phase === 'final' && phaseMatches.length === 2) {
          const sorted = [...phaseMatches].sort(
            (a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime()
          )
          return (
            <Fragment key="final-split">
              <MatchSection title={thirdLabel} icon="🥉" matches={[sorted[0]]} canEdit={canEdit} prodeId={prodeId} onPickSave={onPickSave} onPickClear={onPickClear} />
              <MatchSection title={phaseLabels.final} icon="🏆" matches={[sorted[1]]} canEdit={canEdit} prodeId={prodeId} onPickSave={onPickSave} onPickClear={onPickClear} />
            </Fragment>
          )
        }

        const icon = phase === 'final' ? '🏆' : '⚽'
        return (
          <MatchSection
            key={phase}
            title={phaseLabels[phase]}
            icon={icon}
            matches={phaseMatches}
            canEdit={canEdit}
            prodeId={prodeId}
            onPickSave={onPickSave}
            onPickClear={onPickClear}
          />
        )
      })}
    </div>
  )
}
