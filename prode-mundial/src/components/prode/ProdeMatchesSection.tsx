'use client'

import { useState, Fragment } from 'react'
import GroupStageFilter from '@/components/matches/GroupStageFilter'
import MatchSection from '@/components/matches/MatchSection'
import { type Match } from '@/components/matches/MatchCard'
import { useDictionary } from '@/hooks/useDictionary'

const PHASE_ORDER = ['r32', 'r16', 'qf', 'sf', 'final'] as const
type KnockoutPhase = (typeof PHASE_ORDER)[number]

interface ProdeMatchesSectionProps {
  groupMatches: Match[]
  knockoutMatches: Match[]
  prodeId: string
  canEdit: boolean
  onPickSave?: (matchId: string, home: number, away: number) => Promise<void>
  onPickClear?: (matchId: string) => Promise<void>
}

export default function ProdeMatchesSection({
  groupMatches,
  knockoutMatches,
  prodeId,
  canEdit,
  onPickSave,
  onPickClear,
}: ProdeMatchesSectionProps) {
  const t = useDictionary()
  const [selectedFecha, setSelectedFecha] = useState<'all' | 1 | 2 | 3>('all')
  const [knockoutFilter, setKnockoutFilter] = useState<'' | KnockoutPhase>('')

  const availablePhases = PHASE_ORDER.filter(p => knockoutMatches.some(m => m.phase === p))

  function handleFechaChange(f: 'all' | 1 | 2 | 3) {
    setSelectedFecha(f)
    setKnockoutFilter('')
  }

  function handleKnockoutChange(phase: '' | KnockoutPhase) {
    setKnockoutFilter(phase)
    setSelectedFecha('all')
  }
  const phasesToRender = knockoutFilter === '' ? availablePhases : [knockoutFilter]

  const knockoutSelect = knockoutMatches.length > 0 ? (
    <select
      value={knockoutFilter}
      onChange={e => handleKnockoutChange(e.target.value as '' | KnockoutPhase)}
      style={{
        background: knockoutFilter ? 'var(--accent)' : 'transparent',
        border: `1px solid ${knockoutFilter ? 'none' : 'var(--border)'}`,
        borderRadius: '6px',
        color: knockoutFilter ? '#fff' : 'var(--text-muted)',
        padding: '6px 12px',
        fontSize: '12px',
        fontWeight: 700,
        cursor: 'pointer',
        outline: 'none',
      }}
    >
      <option value="" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
        {t.prode.knockout}
      </option>
      {availablePhases.map(p => (
        <option key={p} value={p} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
          {(t.nav.phases as Record<string, string>)[p]}
        </option>
      ))}
    </select>
  ) : undefined

  return (
    <>
      {groupMatches.length > 0 && (
        <GroupStageFilter
          matches={groupMatches}
          prodeId={prodeId}
          canEdit={canEdit}
          groupStageTitle={t.prode.groupStage}
          groupLabel={t.fase.group}
          fechaLabel={t.misPicks.fecha}
          allLabel={t.misPicks.allFechas}
          hideMatches={knockoutFilter !== ''}
          selectedFecha={selectedFecha}
          onFechaChange={handleFechaChange}
          onPickSave={onPickSave}
          onPickClear={onPickClear}
          rightSlot={knockoutSelect}
        />
      )}

      {phasesToRender.map(phase => {
        const phaseMatches = knockoutMatches.filter(m => m.phase === phase)
        if (phaseMatches.length === 0) return null

        if (phase === 'final' && phaseMatches.length === 2) {
          const sorted = [...phaseMatches].sort(
            (a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime()
          )
          return (
            <Fragment key="final-split">
              <MatchSection title={t.fase.third} icon="🥉" matches={[sorted[0]]} canEdit={canEdit} prodeId={prodeId} onPickSave={onPickSave} onPickClear={onPickClear} />
              <MatchSection title={t.nav.phases.final} icon="🏆" matches={[sorted[1]]} canEdit={canEdit} prodeId={prodeId} onPickSave={onPickSave} onPickClear={onPickClear} />
            </Fragment>
          )
        }

        const icon = phase === 'final' ? '🏆' : '⚽'
        return (
          <MatchSection
            key={phase}
            title={(t.nav.phases as Record<string, string>)[phase]}
            icon={icon}
            matches={phaseMatches}
            canEdit={canEdit}
            prodeId={prodeId}
            onPickSave={onPickSave}
            onPickClear={onPickClear}
          />
        )
      })}
    </>
  )
}
