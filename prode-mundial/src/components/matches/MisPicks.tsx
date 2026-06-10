'use client'

import { useState, useTransition, useRef } from 'react'
import { Save, Lock } from 'lucide-react'
import { saveAllDefaultPicks, deleteDefaultPicks } from '@/lib/actions/default-picks'
import { useDictionary } from '@/hooks/useDictionary'

interface PickMatch {
  id: string
  homeTeam: string
  awayTeam: string
  homeFlag?: string
  awayFlag?: string
  matchDate: string
  status: 'scheduled' | 'live' | 'finished'
  group?: string
  phase: string
  isThirdPlace?: boolean
  defaultPickHome?: number
  defaultPickAway?: number
  homeScore?: number
  awayScore?: number
  userPoints?: number
}

function PointsBadge({ points }: { points: number }) {
  const color = points === 3 ? '#27ae60' : points === 1 ? 'var(--accent)' : 'var(--text-muted)'
  return (
    <span style={{ background: color, color: '#fff', borderRadius: '3px', padding: '1px 6px', fontSize: '11px', fontWeight: 700 }}>
      {points} pts
    </span>
  )
}

interface GroupedMatches {
  [group: string]: PickMatch[]
}

interface MisPicksProps {
  matches: PickMatch[]
}

type FechaFilter = 'all' | 1 | 2 | 3

function isLocked(matchDate: string, status: string): boolean {
  if (status !== 'scheduled') return true
  const minutes = (new Date(matchDate).getTime() - Date.now()) / 60000
  return minutes < 15
}

function formatDate(dateStr: string): { day: string; time: string } {
  const d = new Date(dateStr)
  return {
    day:  `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`,
    time: `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`,
  }
}

export default function MisPicks({ matches }: MisPicksProps) {
  const t = useDictionary()
  const [selectedFecha, setSelectedFecha] = useState<FechaFilter>('all')
  const [knockoutFilter, setKnockoutFilter] = useState<'' | 'r32' | 'r16' | 'qf' | 'sf' | 'final'>('')

  const [picks, setPicks] = useState<Record<string, { home: string; away: string }>>(() => {
    const init: Record<string, { home: string; away: string }> = {}
    matches.forEach((m) => {
      init[m.id] = {
        home: m.defaultPickHome !== undefined ? String(m.defaultPickHome) : '',
        away: m.defaultPickAway !== undefined ? String(m.defaultPickAway) : '',
      }
    })
    return init
  })

  const [savedPicks, setSavedPicks] = useState<Set<string>>(() => {
    const s = new Set<string>()
    matches.forEach((m) => {
      if (m.defaultPickHome !== undefined && m.defaultPickAway !== undefined) s.add(m.id)
    })
    return s
  })

  const persistedPickIds = useRef<Set<string>>(new Set(
    matches.filter(m => m.defaultPickHome !== undefined && m.defaultPickAway !== undefined).map(m => m.id)
  ))

  const [savingIds, setSavingIds] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const hasGroupStage = matches.some(m => m.phase === 'groups' && m.group)
  const hasKnockout = matches.some(m => m.phase !== 'groups')
  const availableKnockoutPhases = (['r32', 'r16', 'qf', 'sf', 'final'] as const).filter(p => matches.some(m => m.phase === p))

  // Groups of 4 teams → 2 matches per round (Fecha), 3 rounds total
  function getMatchRound(matchId: string, groupName: string): number {
    const groupMatches = matches
      .filter(m => m.group === groupName && m.phase === 'groups')
      .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime())
    const idx = groupMatches.findIndex(m => m.id === matchId)
    if (idx === -1) return 1
    return Math.floor(idx / 2) + 1
  }

  // IDs for the selected fecha (null = all)
  const fechaMatchIds: Set<string> | null = selectedFecha === 'all' ? null : new Set(
    matches
      .filter(m => m.phase === 'groups' && m.group && getMatchRound(m.id, m.group) === selectedFecha)
      .map(m => m.id)
  )

  // Knockout filter overrides fecha filter; group matches filtered by fecha otherwise
  const visibleMatches = knockoutFilter !== ''
    ? matches.filter(m => m.phase === knockoutFilter)
    : matches.filter(m => !fechaMatchIds || m.phase !== 'groups' || !m.group || fechaMatchIds.has(m.id))

  // If there are 2 final-phase matches, the earlier one is the 3rd/4th place match
  const finalPhaseMatches = visibleMatches
    .filter(m => m.phase === 'final')
    .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime())
  const thirdPlaceId = finalPhaseMatches.length === 2 ? finalPhaseMatches[0].id : null

  const grouped: GroupedMatches = {}
  visibleMatches.forEach((m) => {
    const key = m.phase === 'groups' && m.group ? `${t.fase.group} ${m.group}` :
                m.phase === 'r32' || (m.phase === 'groups' && !m.group) ? t.nav.phases.r32 :
                m.phase === 'r16' ? t.nav.phases.r16 :
                m.phase === 'qf' ? t.nav.phases.qf :
                m.phase === 'sf' ? t.nav.phases.sf :
                (m.phase === 'final' && (m.isThirdPlace || m.id === thirdPlaceId)) ? t.fase.third :
                t.nav.phases.final
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(m)
  })

  const editableInView = visibleMatches.filter(m => !isLocked(m.matchDate, m.status))
  const totalFilled = editableInView.filter(m => {
    const p = picks[m.id]
    return p && p.home !== '' && p.away !== ''
  }).length
  const totalEditable = editableInView.length

  function handleChange(matchId: string, side: 'home' | 'away', value: string) {
    const digits = value.replace(/[^0-9]/g, '')
    const num = digits === '' ? '' : String(parseInt(digits, 10))
    setPicks((prev) => ({ ...prev, [matchId]: { ...prev[matchId], [side]: num } }))
    setSavedPicks((prev) => { const n = new Set(prev); n.delete(matchId); return n })
  }

  async function handleAutoSave(matchId: string) {
    const pick = picks[matchId]
    const isEmpty = !pick || pick.home === '' || pick.away === ''
    if (isEmpty) {
      if (persistedPickIds.current.has(matchId)) {
        setSavingIds((prev) => new Set(prev).add(matchId))
        await deleteDefaultPicks([matchId])
        setSavingIds((prev) => { const n = new Set(prev); n.delete(matchId); return n })
        persistedPickIds.current.delete(matchId)
        setSavedPicks((prev) => { const n = new Set(prev); n.delete(matchId); return n })
      }
      return
    }
    setSavingIds((prev) => new Set(prev).add(matchId))
    const res = await saveAllDefaultPicks([{ matchId, home: Number(pick.home), away: Number(pick.away) }])
    setSavingIds((prev) => { const n = new Set(prev); n.delete(matchId); return n })
    if (!res?.error) {
      persistedPickIds.current.add(matchId)
      setSavedPicks((prev) => new Set(prev).add(matchId))
    }
  }

  function handleSave() {
    const visibleMatchIds = new Set(visibleMatches.map(m => m.id))
    const toSave = Object.entries(picks)
      .filter(([matchId, v]) => visibleMatchIds.has(matchId) && v.home !== '' && v.away !== '')
      .map(([matchId, v]) => ({ matchId, home: Number(v.home), away: Number(v.away) }))

    const toDelete = [...visibleMatchIds].filter(matchId =>
      persistedPickIds.current.has(matchId) && (!picks[matchId] || picks[matchId].home === '' || picks[matchId].away === '')
    )

    if (toSave.length === 0 && toDelete.length === 0) {
      setResult({ type: 'error', msg: t.misPicks.noPicksError })
      return
    }

    startTransition(async () => {
      type R = { error?: string; success?: boolean; saved?: number }
      const [saveRes, deleteRes] = await Promise.all([
        toSave.length > 0 ? saveAllDefaultPicks(toSave) : Promise.resolve<R>({ success: true, saved: 0 }),
        toDelete.length > 0 ? deleteDefaultPicks(toDelete) : Promise.resolve<R>({ success: true }),
      ])
      if (saveRes?.error || deleteRes?.error) {
        setResult({ type: 'error', msg: saveRes?.error ?? deleteRes?.error ?? 'Error' })
      } else {
        toSave.forEach(p => persistedPickIds.current.add(p.matchId))
        toDelete.forEach(id => persistedPickIds.current.delete(id))
        setSavedPicks(prev => {
          const n = new Set(prev)
          toSave.forEach(p => n.add(p.matchId))
          toDelete.forEach(id => n.delete(id))
          return n
        })
        const saved = (saveRes as { saved?: number }).saved ?? 0
        setResult({ type: 'success', msg: t.misPicks.savedMessage.replace('{n}', String(saved)) })
        setTimeout(() => setResult(null), 4000)
      }
    })
  }

  const saveLabel = selectedFecha === 'all'
    ? t.misPicks.saveAll
    : t.misPicks.guardarFecha.replace('{n}', String(selectedFecha))

  const saveButtonJSX = (
    <button
      onClick={handleSave}
      disabled={isPending || totalFilled === 0}
      style={{
        background: totalFilled > 0 ? 'var(--accent)' : 'var(--border)',
        color: totalFilled > 0 ? '#fff' : 'var(--text-muted)',
        border: 'none', borderRadius: '6px', padding: '10px 18px',
        fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center',
        gap: '6px', cursor: totalFilled > 0 ? 'pointer' : 'not-allowed',
        opacity: isPending ? 0.7 : 1, flexDirection: 'column', lineHeight: 1.2,
      }}
    >
      {isPending
        ? <span style={{ fontSize: 12 }}>Guardando...</span>
        : <><Save size={20} strokeWidth={1.8} /><span>{saveLabel}</span></>
      }
    </button>
  )

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '0 4px' }}>
        <div>
          <h2 style={{ fontWeight: 900, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
            {t.misPicks.title}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
            {t.misPicks.progress.replace('{filled}', String(totalFilled)).replace('{total}', String(totalEditable))}
          </p>
        </div>
        {saveButtonJSX}
      </div>

      {/* Fecha + Eliminatorias filters */}
      {(hasGroupStage || hasKnockout) && (
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          {hasGroupStage && (['all', 1, 2, 3] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setSelectedFecha(f); setKnockoutFilter('') }}
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
              {f === 'all' ? t.misPicks.allFechas : `${t.misPicks.fecha} ${f}`}
            </button>
          ))}
          {hasKnockout && availableKnockoutPhases.length > 0 && (
            <select
              value={knockoutFilter}
              onChange={e => { setKnockoutFilter(e.target.value as '' | 'r32' | 'r16' | 'qf' | 'sf' | 'final'); setSelectedFecha('all') }}
              style={{
                background: knockoutFilter ? 'var(--accent)' : 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: knockoutFilter ? '#fff' : 'var(--text-muted)',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{t.prode.knockout}</option>
              {availableKnockoutPhases.map(p => (
                <option key={p} value={p} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                  {(t.nav.phases as Record<string, string>)[p]}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {result && (
        <div style={{
          padding: '10px 16px', borderRadius: '4px', marginBottom: '16px', fontSize: '13px', fontWeight: 700,
          background: result.type === 'success' ? 'rgba(39, 174, 96, 0.15)' : 'rgba(231, 76, 60, 0.15)',
          color: result.type === 'success' ? '#27ae60' : 'var(--live)',
          border: `1px solid ${result.type === 'success' ? '#27ae60' : 'var(--live)'}`,
        }}>
          {result.msg}
        </div>
      )}

      {/* Partidos agrupados */}
      {Object.entries(grouped).map(([groupName, groupMatches]) => (
        <div key={groupName} style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', marginBottom: '4px' }}>
          <div style={{
            background: 'var(--bg-section-header)', borderRadius: '8px 8px 0 0',
            padding: '8px 12px', height: '32px', display: 'flex', alignItems: 'center',
          }}>
            <span style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
              {groupName}
            </span>
          </div>

          {groupMatches.map((match) => {
            const locked = isLocked(match.matchDate, match.status)
            const pick = picks[match.id] ?? { home: '', away: '' }
            const hasPick = pick.home !== '' && pick.away !== ''
            const isFinished = match.status === 'finished'
            const isLive = match.status === 'live'
            const isResult = match.status !== 'scheduled' // live o finished → modo lectura
            const hasDefaultPick = match.defaultPickHome !== undefined && match.defaultPickAway !== undefined

            return (
              <div
                key={match.id}
                className="mis-picks-row"
                style={{
                  borderTop: '1px solid var(--border)',
                  padding: '8px 16px',
                  display: 'grid',
                  gridTemplateColumns: '70px 1fr auto 1fr 80px',
                  alignItems: 'center',
                  gap: '8px',
                  background: hasPick ? 'rgba(116, 172, 223, 0.04)' : 'transparent',
                }}
              >
                {/* Fecha */}
                <div style={{ color: 'var(--text-muted)', fontSize: '11px', textAlign: 'center', lineHeight: 1.4 }}>
                  {isLive
                    ? <span style={{ color: 'var(--live)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--live)', display: 'inline-block' }} /> {t.dashboard.live.label}</span>
                    : isFinished
                    ? <span style={{ color: 'var(--text-muted)' }}>{t.matches.final}</span>
                    : locked
                    ? <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}><Lock size={10} /> {t.matches.locked}</span>
                    : (() => { const { day, time } = formatDate(match.matchDate); return <><div>{day}</div><div>{time}</div></> })()
                  }
                </div>

                {/* Local */}
                <div className="match-team match-team-home" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', fontWeight: 700, fontSize: '13px', minWidth: 0 }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{match.homeTeam}</span>
                  {match.homeFlag && <img src={`https://flagcdn.com/20x15/${match.homeFlag}.png`} width={20} height={15} alt={match.homeTeam} style={{ display: 'inline-block', flexShrink: 0 }} />}
                </div>

                {/* Marcador real (en vivo / finalizado) o inputs de pick */}
                {isResult ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', fontWeight: 900, fontSize: '17px', color: 'var(--text-primary)' }}>
                    <span>{match.homeScore ?? '-'}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>-</span>
                    <span>{match.awayScore ?? '-'}</span>
                  </div>
                ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    type="text" inputMode="numeric"
                    value={pick.home}
                    onChange={(e) => handleChange(match.id, 'home', e.target.value)}
                    onBlur={() => handleAutoSave(match.id)}
                    disabled={locked}
                    style={{
                      width: '34px', textAlign: 'center', fontWeight: 700, fontSize: '15px', padding: '3px 0',
                      background: locked ? 'rgba(255,255,255,0.05)' : 'rgba(116, 172, 223, 0.15)',
                      border: `1px solid ${savedPicks.has(match.id) ? 'var(--accent)' : locked ? 'var(--border)' : 'var(--border-light)'}`,
                      borderRadius: '4px', color: 'var(--text-primary)', outline: 'none',
                    }}
                  />
                  <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>-</span>
                  <input
                    type="text" inputMode="numeric"
                    value={pick.away}
                    onChange={(e) => handleChange(match.id, 'away', e.target.value)}
                    onBlur={() => handleAutoSave(match.id)}
                    disabled={locked}
                    style={{
                      width: '34px', textAlign: 'center', fontWeight: 700, fontSize: '15px', padding: '3px 0',
                      background: locked ? 'rgba(255,255,255,0.05)' : 'rgba(116, 172, 223, 0.15)',
                      border: `1px solid ${savedPicks.has(match.id) ? 'var(--accent)' : locked ? 'var(--border)' : 'var(--border-light)'}`,
                      borderRadius: '4px', color: 'var(--text-primary)', outline: 'none',
                    }}
                  />
                </div>
                )}

                {/* Visitante */}
                <div className="match-team match-team-away" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '13px', minWidth: 0 }}>
                  {match.awayFlag && <img src={`https://flagcdn.com/20x15/${match.awayFlag}.png`} width={20} height={15} alt={match.awayTeam} style={{ display: 'inline-block', flexShrink: 0 }} />}
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{match.awayTeam}</span>
                </div>

                {/* Estado pick — en vivo/finalizado: puntos (solo final) + tu pick; si no: indicador de guardado */}
                {isResult ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                    {match.userPoints !== undefined && <PointsBadge points={match.userPoints} />}
                    {hasDefaultPick && (
                      <span style={{ color: 'var(--text-muted)', fontSize: '10px', whiteSpace: 'nowrap' }}>
                        {t.matches.yourPick}: {match.defaultPickHome}-{match.defaultPickAway}
                      </span>
                    )}
                  </div>
                ) : (
                <div style={{ textAlign: 'right' }}>
                  {savingIds.has(match.id) ? (
                    <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>...</span>
                  ) : savedPicks.has(match.id) && !locked ? (
                    <span style={{ color: 'var(--accent)', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
                      {t.matches.saved}
                    </span>
                  ) : null}
                </div>
                )}
              </div>
            )
          })}
        </div>
      ))}

    </div>
  )
}
