'use client'

import { useState } from 'react'
import type React from 'react'
import MatchSection from './MatchSection'
import { type Match } from './MatchCard'

interface GroupStageFilterProps {
  matches: Match[]
  prodeId?: string
  canEdit: boolean
  onPickSave?: (matchId: string, home: number, away: number) => Promise<void>
  onPickClear?: (matchId: string) => Promise<void>
  onPickChange?: (matchId: string, home: string, away: string) => void
  groupStageTitle: string
  groupLabel: string
  fechaLabel: string
  allLabel: string
  rightSlot?: React.ReactNode
  hideMatches?: boolean
  selectedFecha?: 'all' | 1 | 2 | 3
  onFechaChange?: (f: 'all' | 1 | 2 | 3) => void
  groupByDate?: boolean
}

// Groups of 4 → 2 matches per round, ordered by date within each group
function getMatchRound(match: Match, allGroupMatches: Match[]): number {
  const siblings = allGroupMatches
    .filter(m => m.group === match.group)
    .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime())
  const idx = siblings.findIndex(m => m.id === match.id)
  if (idx === -1) return 1
  return Math.floor(idx / 2) + 1
}

export default function GroupStageFilter({
  matches,
  prodeId,
  canEdit,
  onPickSave,
  onPickClear,
  onPickChange,
  groupStageTitle,
  groupLabel,
  fechaLabel,
  allLabel,
  rightSlot,
  hideMatches = false,
  selectedFecha: controlledFecha,
  onFechaChange,
  groupByDate = false,
}: GroupStageFilterProps) {
  const [internalFecha, setInternalFecha] = useState<'all' | 1 | 2 | 3>('all')
  const selectedFecha = controlledFecha ?? internalFecha
  const setSelectedFecha = (f: 'all' | 1 | 2 | 3) => {
    if (onFechaChange) onFechaChange(f)
    else setInternalFecha(f)
  }

  const filteredMatches = selectedFecha === 'all'
    ? matches
    : matches.filter(m => m.group && getMatchRound(m, matches) === selectedFecha)

  // Sub-group by group name when a specific fecha is selected
  const groups = selectedFecha !== 'all'
    ? ([...new Set(filteredMatches.map(m => m.group).filter(Boolean))].sort() as string[])
    : []

  return (
    <div>
      {/* Barra de filtros: chips de fecha deslizables + slot derecho opcional */}
      <div className="chips-row" style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', gap: '8px', overflowX: 'auto', paddingBottom: 2 }}>
        {(['all', 1, 2, 3] as const).map(f => {
          const on = selectedFecha === f
          return (
            <button
              key={f}
              onClick={() => setSelectedFecha(f)}
              style={{
                flexShrink: 0, padding: '7px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: 800, cursor: 'pointer',
                border: on ? '1px solid var(--accent)' : '1px solid var(--section-border)',
                background: on ? 'var(--accent)' : 'transparent',
                color: on ? '#fff' : 'var(--text-muted)', whiteSpace: 'nowrap',
              }}
            >
              {f === 'all' ? allLabel : `${fechaLabel} ${f}`}
            </button>
          )
        })}
        {rightSlot}
      </div>

      {!hideMatches && (
        <>
          {selectedFecha === 'all' ? (
            <MatchSection
              title={groupStageTitle}
              icon="🏆"
              matches={filteredMatches}
              canEdit={canEdit}
              prodeId={prodeId}
              onPickSave={onPickSave}
              onPickClear={onPickClear}
              onPickChange={onPickChange}
              hideDisclaimer
              groupByDate={groupByDate}
            />
          ) : (
            groups.map(g => (
              <MatchSection
                key={g}
                title={`${groupLabel} ${g}`}
                matches={filteredMatches.filter(m => m.group === g)}
                canEdit={canEdit}
                prodeId={prodeId}
                onPickSave={onPickSave}
                onPickClear={onPickClear}
                onPickChange={onPickChange}
                hideDisclaimer
              />
            ))
          )}
        </>
      )}
    </div>
  )
}
