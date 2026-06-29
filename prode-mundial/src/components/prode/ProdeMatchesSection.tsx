'use client'

import { useState, useEffect, useMemo, Fragment, useTransition } from 'react'
import GroupStageFilter from '@/components/matches/GroupStageFilter'
import MatchSection from '@/components/matches/MatchSection'
import { type Match } from '@/components/matches/MatchCard'
import { useDictionary } from '@/hooks/useDictionary'
import { saveAllPicksBulk, clearPicksBulk } from '@/lib/actions/picks'
import { Save } from 'lucide-react'

const PHASE_ORDER = ['r32', 'r16', 'qf', 'sf', 'final'] as const
type KnockoutPhase = (typeof PHASE_ORDER)[number]

// "Jornada de HOY": un partido antes de las 6am cuenta para el día anterior, así uno a las
// 00/01hs (trasnoche) entra en el HOY de la noche previa en vez de aparecer recién mañana.
const MATCHDAY_CUTOFF_HOUR = 6
function matchdayKey(d: Date): string {
  const s = new Date(d.getTime() - MATCHDAY_CUTOFF_HOUR * 3_600_000)
  return `${s.getFullYear()}-${s.getMonth()}-${s.getDate()}`
}
const ddmm = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`

// Fecha de grupos (1/2/3) de un partido: grupos de 4 → 2 partidos por jornada, ordenados por fecha.
function getMatchRound(match: Match, allGroupMatches: Match[]): number {
  const siblings = allGroupMatches
    .filter(m => m.group === match.group)
    .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime())
  const idx = siblings.findIndex(m => m.id === match.id)
  return idx === -1 ? 1 : Math.floor(idx / 2) + 1
}

// Jornada/fase "actual" para abrir parado en lo vigente y no en el partido inaugural ya jugado:
// la primera (en orden cronológico grupos → eliminatorias) que aún tenga algún partido sin terminar.
// Si el torneo no empezó → Fecha 1; si ya terminó todo → la última fase con partidos.
function computeInitialView(
  groupMatches: Match[],
  knockoutMatches: Match[],
): { type: 'group'; fecha: 1 | 2 | 3 } | { type: 'knockout'; phase: KnockoutPhase } | null {
  type Bucket =
    | { type: 'group'; fecha: 1 | 2 | 3; matches: Match[] }
    | { type: 'knockout'; phase: KnockoutPhase; matches: Match[] }
  const buckets: Bucket[] = []

  for (const fecha of [1, 2, 3] as const) {
    const matches = groupMatches.filter(m => m.group && getMatchRound(m, groupMatches) === fecha)
    if (matches.length) buckets.push({ type: 'group', fecha, matches })
  }
  for (const phase of PHASE_ORDER) {
    const matches = knockoutMatches.filter(m => m.phase === phase)
    if (matches.length) buckets.push({ type: 'knockout', phase, matches })
  }
  if (buckets.length === 0) return null

  const active = buckets.find(b => b.matches.some(m => m.status !== 'finished')) ?? buckets[buckets.length - 1]
  return active.type === 'group'
    ? { type: 'group', fecha: active.fecha }
    : { type: 'knockout', phase: active.phase }
}

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
  // Abrir parado en la jornada/fase vigente (no en el partido inaugural ya jugado).
  const initialView = useMemo(() => computeInitialView(groupMatches, knockoutMatches), [groupMatches, knockoutMatches])
  const [selectedFecha, setSelectedFecha] = useState<'all' | 'today' | 1 | 2 | 3>(
    initialView?.type === 'group' ? initialView.fecha : 'all',
  )
  const [knockoutFilter, setKnockoutFilter] = useState<'' | KnockoutPhase>(
    initialView?.type === 'knockout' ? initialView.phase : '',
  )
  const showToday = selectedFecha === 'today'

  // now solo en cliente (evita mismatch de hidratación). HOY se activa con un click ya montado.
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => { setNow(new Date()) }, [])

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

  const [persistedIds, setPersistedIds] = useState<Set<string>>(() => new Set(
    allMatches.filter(m => m.hasProdeOverride).map(m => m.id)
  ))

  // Valor efectivo de cada partido al cargar (override o heredado de Mis Pronósticos).
  // "Guardar todo" solo persiste lo que difiere de esto: lo heredado sin tocar no se guarda
  // (ya está cubierto), así no re-creamos overrides redundantes.
  const [originalPicks, setOriginalPicks] = useState<Record<string, { home: string; away: string }>>(() =>
    Object.fromEntries(allMatches.map(m => [m.id, {
      home: m.userPickHome !== undefined ? String(m.userPickHome) : '',
      away: m.userPickAway !== undefined ? String(m.userPickAway) : '',
    }]))
  )

  // Valor de Mis Pronósticos por partido. Si el pick quedó igual a esto (o vacío), no es un
  // override propio: se borra (revertir) en vez de guardarse, así no re-ensuciamos con copias.
  const defaultsMap: Record<string, { home: string; away: string }> = {}
  allMatches.forEach(m => {
    if (m.defaultPickHome !== undefined && m.defaultPickAway !== undefined) {
      defaultsMap[m.id] = { home: String(m.defaultPickHome), away: String(m.defaultPickAway) }
    }
  })
  const equalsDefault = (id: string, v: { home: string; away: string }) => {
    const d = defaultsMap[id]
    return !!d && v.home === d.home && v.away === d.away
  }

  const [isPending, startTransition] = useTransition()
  const [saveResult, setSaveResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  function handlePickChange(matchId: string, home: string, away: string) {
    setPicks(prev => ({ ...prev, [matchId]: { home, away } }))
  }

  function handleSaveAll() {
    const orig = originalPicks
    const changed = (id: string, v: { home: string; away: string }) => v.home !== orig[id]?.home || v.away !== orig[id]?.away
    // Guardar: solo overrides propios (distintos a Mis Pronósticos) que cambiaron
    const toSave = Object.entries(picks)
      .filter(([matchId, v]) => v.home !== '' && v.away !== '' && !equalsDefault(matchId, v) && changed(matchId, v))
      .map(([matchId, v]) => ({ matchId, home: Number(v.home), away: Number(v.away) }))

    // Borrar (revertir): overrides existentes que quedaron vacíos o iguales a Mis Pronósticos
    const toDelete = Object.entries(picks)
      .filter(([matchId, v]) => persistedIds.has(matchId) && (v.home === '' || v.away === '' || equalsDefault(matchId, v)) && changed(matchId, v))
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
        setPersistedIds(prev => {
          const n = new Set(prev)
          toSave.forEach(p => n.add(p.matchId))
          toDelete.forEach(id => n.delete(id))
          return n
        })
        setOriginalPicks(prev => {
          const n = { ...prev }
          toSave.forEach(p => { n[p.matchId] = { home: String(p.home), away: String(p.away) } })
          toDelete.forEach(id => { n[id] = { home: picks[id]?.home ?? '', away: picks[id]?.away ?? '' } })
          return n
        })
        const saved = (saveRes as { saved?: number }).saved ?? 0
        const parts = []
        if (saved > 0) parts.push(`${saved} pick${saved !== 1 ? 's' : ''} guardado${saved !== 1 ? 's' : ''}`)
        if (toDelete.length > 0) parts.push(`${toDelete.length} revertido${toDelete.length !== 1 ? 's' : ''}`)
        setSaveResult({ type: 'success', msg: `✓ ${parts.join(', ')}` })
        setTimeout(() => setSaveResult(null), 4000)
      }
    })
  }

  const totalFilled = allMatches.filter(m => {
    const p = picks[m.id]
    return p && p.home !== '' && p.away !== '' && m.status === 'scheduled'
  }).length

  // Cambios sin guardar: overrides nuevos/editados + reverts (vacío o == Mis Pronósticos) de overrides
  const pendingChanges = allMatches.filter(m => {
    if (m.status !== 'scheduled') return false
    const p = picks[m.id]
    if (!p) return false
    const o = originalPicks[m.id] ?? { home: '', away: '' }
    if (p.home === o.home && p.away === o.away) return false // sin cambios
    const filled = p.home !== '' && p.away !== ''
    if (filled && !equalsDefault(m.id, p)) return true // override propio a guardar
    return persistedIds.has(m.id) // revert/clear de un override existente
  }).length

  const availablePhases = PHASE_ORDER.filter(p => knockoutMatches.some(m => m.phase === p))

  // Partidos de la jornada de HOY (grupos + eliminatorias), separando la trasnoche (madrugada).
  const todayAll = now
    ? allMatches
        .filter(m => matchdayKey(new Date(m.matchDate)) === matchdayKey(now))
        .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime())
    : []
  const todayDay = todayAll.filter(m => new Date(m.matchDate).getHours() >= MATCHDAY_CUTOFF_HOUR)
  const todayLate = todayAll.filter(m => new Date(m.matchDate).getHours() < MATCHDAY_CUTOFF_HOUR)

  function handleFechaChange(f: 'all' | 'today' | 1 | 2 | 3) {
    setSelectedFecha(f)
    setKnockoutFilter('')
    if (f === 'today') setNow(new Date()) // refrescar la jornada al entrar a HOY
  }

  function handleKnockoutChange(phase: '' | KnockoutPhase) {
    setKnockoutFilter(phase)
    setSelectedFecha('all')
  }
  const phasesToRender = showToday ? [] : (knockoutFilter === '' ? availablePhases : [knockoutFilter])

  const todayChip = (
    <button
      onClick={() => handleFechaChange('today')}
      style={{
        flexShrink: 0, padding: '7px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: 800, cursor: 'pointer',
        whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5,
        border: showToday ? '1px solid var(--gold, #f5c518)' : '1px solid color-mix(in srgb, var(--gold, #f5c518) 50%, transparent)',
        background: showToday ? 'var(--gold, #f5c518)' : 'transparent',
        color: showToday ? '#0b1f3a' : 'var(--gold, #f5c518)',
      }}
    >
      <span style={{ fontSize: 11 }}>📅</span> HOY
    </button>
  )

  const knockoutSelect = knockoutMatches.length > 0 ? (
    <select
      value={knockoutFilter}
      onChange={e => handleKnockoutChange(e.target.value as '' | KnockoutPhase)}
      style={{
        background: knockoutFilter ? 'var(--accent)' : 'transparent',
        border: `1px solid ${knockoutFilter ? 'none' : 'var(--section-border)'}`,
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '12px', padding: '10px 12px', borderRadius: 12, background: 'rgba(243,156,18,0.10)', border: '1px solid rgba(243,156,18,0.35)' }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>⏱️</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#f39c12', lineHeight: 1.35 }}>{t.prode.scored90}</span>
        </div>
      )}

      {canEdit && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', padding: '0 2px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
            {totalFilled} {totalFilled === 1 ? 'pick cargado' : 'picks cargados'}
            {pendingChanges > 0 && <span style={{ color: '#74ACDF', fontWeight: 700 }}> · {pendingChanges} sin guardar</span>}
          </span>
          <button
            onClick={handleSaveAll}
            disabled={isPending || pendingChanges === 0}
            style={{
              // Celeste fijo del sitio (#74ACDF): no usar var(--accent) para que el botón
              // "guardar todo" no cambie de color en prodes enterprise con color custom.
              // Solo activo cuando hay cambios sin guardar (no re-guarda lo heredado intacto).
              background: pendingChanges > 0 ? '#74ACDF' : 'var(--border)',
              color: pendingChanges > 0 ? '#fff' : 'var(--text-muted)',
              border: 'none', borderRadius: '6px', padding: '8px 16px',
              fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center',
              gap: '6px', cursor: pendingChanges > 0 ? 'pointer' : 'not-allowed',
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
          hideMatches={knockoutFilter !== '' || showToday}
          selectedFecha={selectedFecha}
          onFechaChange={handleFechaChange}
          onPickSave={onPickSave}
          onPickClear={onPickClear}
          onPickChange={handlePickChange}
          leftSlot={todayChip}
          rightSlot={knockoutSelect}
          groupByDate
        />
      )}

      {showToday && (
        todayAll.length === 0 ? (
          <div style={{ border: '1px solid var(--section-border)', borderRadius: 8, padding: '22px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13.5 }}>
            No hay partidos hoy. 🌙
          </div>
        ) : (
          <>
            {todayDay.length > 0 && (
              <MatchSection
                title={`Hoy · ${ddmm(new Date(todayDay[0].matchDate))}`}
                icon="📅"
                matches={todayDay}
                canEdit={canEdit}
                prodeId={prodeId}
                onPickSave={onPickSave}
                onPickClear={onPickClear}
                onPickChange={handlePickChange}
                showOdds
              />
            )}
            {todayLate.length > 0 && (
              <MatchSection
                title={`Trasnoche · ${ddmm(new Date(todayLate[0].matchDate))}`}
                icon="🌙"
                matches={todayLate}
                canEdit={canEdit}
                prodeId={prodeId}
                showOdds
                onPickSave={onPickSave}
                onPickClear={onPickClear}
                onPickChange={handlePickChange}
              />
            )}
          </>
        )
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
