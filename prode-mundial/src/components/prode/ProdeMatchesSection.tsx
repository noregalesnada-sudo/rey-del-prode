'use client'

import { useState, Fragment, useRef, useTransition } from 'react'
import GroupStageFilter from '@/components/matches/GroupStageFilter'
import MatchSection from '@/components/matches/MatchSection'
import { type Match } from '@/components/matches/MatchCard'
import { useDictionary } from '@/hooks/useDictionary'
import { saveAllPicksBulk, clearPicksBulk } from '@/lib/actions/picks'
import { Save } from 'lucide-react'

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

  const allMatches = [...groupMatches, ...knockoutMatches]

  const [picks, setPicks] = useState<Record<string, { home: string; away: string }>>(() => {
    const init: Record<string, { home: string; away: string }> = {}
    allMatches.forEach(m => {
      init[m.id] = {
        home: m.userPickHome !== undefined ? String(m.userPickHome) : '',
        away: m.userPickAway !== undefined ? String(m.userPickAway) : '',
      }
    })
    return init
  })

  const persistedPickIds = useRef(new Set(
    allMatches.filter(m => m.hasProdeOverride).map(m => m.id)
  ))

  const [isPending, startTransition] = useTransition()
  const [saveResult, setSaveResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  function handlePickChange(matchId: string, home: string, away: string) {
    setPicks(prev => ({ ...prev, [matchId]: { home, away } }))
  }

  function handleSaveAll() {
    const toSave = Object.entries(picks)
      .filter(([, v]) => v.home !== '' && v.away !== '')
      .map(([matchId, v]) => ({ matchId, home: Number(v.home), away: Number(v.away) }))

    const toDelete = Object.entries(picks)
      .filter(([matchId, v]) => persistedPickIds.current.has(matchId) && (v.home === '' || v.away === ''))
      .map(([matchId]) => matchId)

    if (toSave.length === 0 && toDelete.length === 0) {
      setSaveResult({ type: 'error', msg: t.misPicks.noPicksError })
      return
    }

    startTransition(async () => {
      type R = { error?: string; success?: boolean; saved?: number }
      const [saveRes, deleteRes] = await Promise.all([
        toSave.length > 0 ? saveAllPicksBulk(toSave, prodeId) : Promise.resolve<R>({ success: true, saved: 0 }),
        toDelete.length > 0 ? clearPicksBulk(toDelete, prodeId) : Promise.resolve<R>({ success: true }),
      ])
      if (saveRes?.error || deleteRes?.error) {
        setSaveResult({ type: 'error', msg: saveRes?.error ?? deleteRes?.error ?? 'Error' })
      } else {
        toSave.forEach(p => persistedPickIds.current.add(p.matchId))
        toDelete.forEach(id => persistedPickIds.current.delete(id))
        const saved = (saveRes as { saved?: number }).saved ?? 0
        const parts = []
        if (saved > 0) parts.push(`${saved} pick${saved !== 1 ? 's' : ''} guardado${saved !== 1 ? 's' : ''}`)
        if (toDelete.length > 0) parts.push(`${toDelete.length} eliminado${toDelete.length !== 1 ? 's' : ''}`)
        setSaveResult({ type: 'success', msg: `✓ ${parts.join(', ')}` })
        setTimeout(() => setSaveResult(null), 4000)
      }
    })
  }

  const totalFilled = allMatches.filter(m => {
    const p = picks[m.id]
    return p && p.home !== '' && p.away !== '' && m.status === 'scheduled'
  }).length

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
      {canEdit && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', padding: '0 2px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
            {totalFilled} {totalFilled === 1 ? 'pick cargado' : 'picks cargados'}
          </span>
          <button
            onClick={handleSaveAll}
            disabled={isPending || totalFilled === 0}
            style={{
              background: totalFilled > 0 ? 'var(--accent)' : 'var(--border)',
              color: totalFilled > 0 ? '#fff' : 'var(--text-muted)',
              border: 'none', borderRadius: '6px', padding: '8px 16px',
              fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center',
              gap: '6px', cursor: totalFilled > 0 ? 'pointer' : 'not-allowed',
              opacity: isPending ? 0.7 : 1,
            }}
          >
            {isPending ? <span style={{ fontSize: 12 }}>Guardando...</span> : <><Save size={14} strokeWidth={2} />{t.misPicks.saveAll}</>}
          </button>
        </div>
      )}

      {saveResult && (
        <div style={{
          padding: '10px 16px', borderRadius: '4px', marginBottom: '12px', fontSize: '13px', fontWeight: 700,
          background: saveResult.type === 'success' ? 'rgba(39, 174, 96, 0.15)' : 'rgba(231, 76, 60, 0.15)',
          color: saveResult.type === 'success' ? '#27ae60' : 'var(--live)',
          border: `1px solid ${saveResult.type === 'success' ? '#27ae60' : 'var(--live)'}`,
        }}>
          {saveResult.msg}
        </div>
      )}

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
          onPickChange={handlePickChange}
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
              <MatchSection title={t.fase.third} icon="🥉" matches={[sorted[0]]} canEdit={canEdit} prodeId={prodeId} onPickSave={onPickSave} onPickClear={onPickClear} onPickChange={handlePickChange} />
              <MatchSection title={t.nav.phases.final} icon="🏆" matches={[sorted[1]]} canEdit={canEdit} prodeId={prodeId} onPickSave={onPickSave} onPickClear={onPickClear} onPickChange={handlePickChange} />
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
            onPickChange={handlePickChange}
          />
        )
      })}
    </>
  )
}
