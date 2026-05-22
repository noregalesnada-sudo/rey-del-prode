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
  groupStageTitle: string
  groupLabel: string
  fechaLabel: string
  allLabel: string
  rightSlot?: React.ReactNode
  hideMatches?: boolean
  selectedFecha?: 'all' | 1 | 2 | 3
  onFechaChange?: (f: 'all' | 1 | 2 | 3) => void
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
  groupStageTitle,
  groupLabel,
  fechaLabel,
  allLabel,
  rightSlot,
  hideMatches = false,
  selectedFecha: controlledFecha,
  onFechaChange,
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
      {/* Barra de filtros: tabs de fecha + slot derecho opcional */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', gap: '6px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {(['all', 1, 2, 3] as const).map(f => (
            <button
              key={f}
              onClick={() => setSelectedFecha(f)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: selectedFecha === f ? 'none' : '1px solid var(--border)',
                background: selectedFecha === f ? 'var(--accent)' : 'transparent',
                color: selectedFecha === f ? '#fff' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              {f === 'all' ? allLabel : `${fechaLabel} ${f}`}
            </button>
          ))}
        </div>
        {rightSlot}
      </div>

      {!hideMatches && (
        <>
          {/* Disclaimer global — aplica a toda la fase de grupos, no a un grupo puntual */}
          {onPickClear && matches.some(m => m.hasProdeOverride) && (
            <div style={{ padding: '6px 16px', marginBottom: '8px', background: 'rgba(116,172,223,0.07)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
              Algunos picks están personalizados para este prode. Presioná <strong>×</strong> en un partido para volver al pronóstico de <em>Mis Pronósticos</em>.
            </div>
          )}

          {selectedFecha === 'all' ? (
            <MatchSection
              title={groupStageTitle}
              icon="🏆"
              matches={filteredMatches}
              canEdit={canEdit}
              prodeId={prodeId}
              onPickSave={onPickSave}
              onPickClear={onPickClear}
              hideDisclaimer
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
                hideDisclaimer
              />
            ))
          )}
        </>
      )}
    </div>
  )
}
