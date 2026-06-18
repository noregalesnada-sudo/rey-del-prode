'use client'

import { useState, useEffect, useTransition, useRef } from 'react'
import { Save, Lock, Minus, Plus } from 'lucide-react'
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
  const color = points === 3 ? '#27ae60' : points === 2 ? '#f39c12' : points === 1 ? 'var(--accent)' : 'var(--text-muted)'
  return (
    <span style={{ background: color, color: '#fff', borderRadius: '5px', padding: '2px 8px', fontSize: '11px', fontWeight: 800 }}>
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

const PHASE_RANK: Record<string, number> = { groups: 0, r32: 1, r16: 2, qf: 3, sf: 4, final: 5 }

function isLocked(matchDate: string, status: string): boolean {
  if (status !== 'scheduled') return true
  const minutes = (new Date(matchDate).getTime() - Date.now()) / 60000
  return minutes < 15
}

function formatDate(dateStr: string): { day: string; time: string } {
  const d = new Date(dateStr)
  return {
    day: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
    time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
  }
}

const flagUrl = (code?: string) => (code ? `https://flagcdn.com/w40/${code}.png` : undefined)

const roundBtn: React.CSSProperties = {
  width: 34, height: 34, borderRadius: '50%', border: '1.5px solid var(--border-light)',
  background: 'rgba(116,172,223,0.12)', color: '#a8d4f5',
  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
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
  const [highlightId, setHighlightId] = useState<string | null>(null)

  // Deep-link: si la URL apunta a un partido (#m-id), scrollea y lo resalta un momento.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const m = window.location.hash.match(/^#m-(.+)$/)
    if (!m) return
    const id = m[1]
    const tid = setTimeout(() => {
      const el = document.getElementById(`m-${id}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setHighlightId(id)
        setTimeout(() => setHighlightId(null), 2200)
      }
    }, 250)
    return () => clearTimeout(tid)
  }, [])

  const hasGroupStage = matches.some(m => m.phase === 'groups' && m.group)
  const hasKnockout = matches.some(m => m.phase !== 'groups')
  const availableKnockoutPhases = (['r32', 'r16', 'qf', 'sf', 'final'] as const).filter(p => matches.some(m => m.phase === p))

  function getMatchRound(matchId: string, groupName: string): number {
    const groupMatches = matches
      .filter(m => m.group === groupName && m.phase === 'groups')
      .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime())
    const idx = groupMatches.findIndex(m => m.id === matchId)
    if (idx === -1) return 1
    return Math.floor(idx / 2) + 1
  }

  const fechaMatchIds: Set<string> | null = selectedFecha === 'all' ? null : new Set(
    matches
      .filter(m => m.phase === 'groups' && m.group && getMatchRound(m.id, m.group) === selectedFecha)
      .map(m => m.id)
  )

  const visibleMatches = knockoutFilter !== ''
    ? matches.filter(m => m.phase === knockoutFilter)
    : matches.filter(m => !fechaMatchIds || m.phase !== 'groups' || !m.group || fechaMatchIds.has(m.id))

  const finalPhaseMatches = visibleMatches
    .filter(m => m.phase === 'final')
    .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime())
  const thirdPlaceId = finalPhaseMatches.length === 2 ? finalPhaseMatches[0].id : null

  // Orden estable: grupos A→Z, después eliminatorias por fase, y por fecha dentro de cada uno.
  const orderedVisible = [...visibleMatches].sort((a, b) => {
    const pr = (PHASE_RANK[a.phase] ?? 9) - (PHASE_RANK[b.phase] ?? 9)
    if (pr !== 0) return pr
    if (a.phase === 'groups' && a.group && b.group && a.group !== b.group) return a.group.localeCompare(b.group)
    return new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime()
  })

  const grouped: GroupedMatches = {}
  orderedVisible.forEach((m) => {
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

  async function autoSaveValue(matchId: string, p: { home: string; away: string }) {
    const isEmpty = p.home === '' || p.away === ''
    if (isEmpty) {
      if (persistedPickIds.current.has(matchId)) {
        setSavingIds(prev => new Set(prev).add(matchId))
        await deleteDefaultPicks([matchId])
        setSavingIds(prev => { const n = new Set(prev); n.delete(matchId); return n })
        persistedPickIds.current.delete(matchId)
        setSavedPicks(prev => { const n = new Set(prev); n.delete(matchId); return n })
      }
      return
    }
    setSavingIds(prev => new Set(prev).add(matchId))
    const res = await saveAllDefaultPicks([{ matchId, home: Number(p.home), away: Number(p.away) }])
    setSavingIds(prev => { const n = new Set(prev); n.delete(matchId); return n })
    if (!res?.error) {
      persistedPickIds.current.add(matchId)
      setSavedPicks(prev => new Set(prev).add(matchId))
    }
  }

  function bump(matchId: string, side: 'home' | 'away', dir: number) {
    const cur = picks[matchId] ?? { home: '', away: '' }
    // Sin valor cargado: el primer toque (− o +) arranca en 0.
    const nv = cur[side] === '' ? '0' : String(Math.max(0, parseInt(cur[side], 10) + dir))
    const next = { ...cur, [side]: nv }
    setPicks(prev => ({ ...prev, [matchId]: next }))
    setSavedPicks(prev => { const n = new Set(prev); n.delete(matchId); return n })
    autoSaveValue(matchId, next)
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

  const chip = (active: boolean): React.CSSProperties => ({
    flexShrink: 0, padding: '7px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: 800, cursor: 'pointer',
    border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
    background: active ? 'var(--accent)' : 'transparent',
    color: active ? '#fff' : 'var(--text-muted)', whiteSpace: 'nowrap',
  })

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16, padding: '0 2px' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 700 }}>
          {t.misPicks.progress.replace('{filled}', String(totalFilled)).replace('{total}', String(totalEditable)).split(' · ')[0]}
        </span>
        <button
          onClick={handleSave}
          disabled={isPending || totalFilled === 0}
          style={{
            flexShrink: 0,
            background: totalFilled > 0 ? 'linear-gradient(135deg,#fad54a,#c9a010)' : 'var(--border)',
            color: totalFilled > 0 ? '#3a2c00' : 'var(--text-muted)',
            border: 0, borderRadius: 12, padding: '9px 16px', fontWeight: 900, fontSize: 13,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, lineHeight: 1.2,
            cursor: totalFilled > 0 ? 'pointer' : 'not-allowed', opacity: isPending ? 0.7 : 1,
            boxShadow: totalFilled > 0 ? '0 6px 16px rgba(245,197,24,0.28)' : 'none',
          }}
        >
          {isPending ? <span style={{ fontSize: 12 }}>…</span> : <><Save size={18} strokeWidth={2} /><span>{saveLabel}</span></>}
        </button>
      </div>

      {/* Filtros: una sola fila deslizable de chips (fechas + eliminatorias) */}
      {(hasGroupStage || hasKnockout) && (
        <div className="chips-row" style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 2 }}>
          <button onClick={() => { setSelectedFecha('all'); setKnockoutFilter('') }} style={chip(selectedFecha === 'all' && knockoutFilter === '')}>
            {t.misPicks.allFechas}
          </button>
          {hasGroupStage && ([1, 2, 3] as const).map((f) => (
            <button key={f} onClick={() => { setSelectedFecha(f); setKnockoutFilter('') }} style={chip(selectedFecha === f && knockoutFilter === '')}>
              {t.misPicks.fecha} {f}
            </button>
          ))}
          {availableKnockoutPhases.map((p) => (
            <button key={p} onClick={() => { setKnockoutFilter(p); setSelectedFecha('all') }} style={chip(knockoutFilter === p)}>
              {(t.nav.phases as Record<string, string>)[p]}
            </button>
          ))}
        </div>
      )}

      {result && (
        <div style={{
          padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 700,
          background: result.type === 'success' ? 'rgba(39, 174, 96, 0.15)' : 'rgba(231, 76, 60, 0.15)',
          color: result.type === 'success' ? '#27ae60' : 'var(--live)',
          border: `1px solid ${result.type === 'success' ? '#27ae60' : 'var(--live)'}`,
        }}>
          {result.msg}
        </div>
      )}

      {/* Secciones por grupo/fase */}
      {Object.entries(grouped).map(([groupName, groupMatches]) => (
        <div key={groupName} style={{ border: '1px solid var(--section-border)', borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ background: 'var(--bg-section-header)', padding: '9px 14px', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{groupName}</span>
          </div>

          {groupMatches.map((match) => {
            const locked = isLocked(match.matchDate, match.status)
            const pick = picks[match.id] ?? { home: '', away: '' }
            const hasPick = pick.home !== '' && pick.away !== ''
            const isFinished = match.status === 'finished'
            const isLive = match.status === 'live'
            const isResult = match.status !== 'scheduled'
            const editing = !locked && !isResult

            return (
              <div
                key={match.id}
                id={`m-${match.id}`}
                style={{
                  borderTop: '1px solid var(--border)', padding: '12px 14px', scrollMarginTop: 64,
                  background: highlightId === match.id ? 'rgba(116,172,223,0.14)' : editing && hasPick ? 'rgba(116, 172, 223, 0.04)' : 'transparent',
                  boxShadow: highlightId === match.id ? 'inset 0 0 0 2px var(--accent)' : 'none',
                  transition: 'background 0.3s, box-shadow 0.3s',
                }}
              >
                <div style={{ maxWidth: 540, margin: '0 auto' }}>
                {/* Header: estado + guardado */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, minHeight: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
                    {isLive ? (
                      <span style={{ color: 'var(--live)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--live)', display: 'inline-block' }} />
                        {t.dashboard.live.label}
                      </span>
                    ) : isFinished ? (
                      <span>{t.matches.final}</span>
                    ) : locked ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Lock size={11} /> {t.matches.locked}</span>
                    ) : (() => { const { day, time } = formatDate(match.matchDate); return <span>{day} · {time}</span> })()}
                  </span>
                  {editing && (
                    savingIds.has(match.id)
                      ? <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>…</span>
                      : savedPicks.has(match.id)
                        ? <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>{t.matches.saved}</span>
                        : null
                  )}
                </div>

                {/* Equipos + marcador */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, minWidth: 0 }}>
                    <span style={{ fontWeight: 800, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{match.homeTeam}</span>
                    {match.homeFlag && <img src={flagUrl(match.homeFlag)} alt={match.homeTeam} style={{ width: 28, height: 21, objectFit: 'cover', borderRadius: 3, flexShrink: 0 }} />}
                  </div>

                  <div style={{ minWidth: 60, display: 'flex', justifyContent: 'center' }}>
                    {isResult ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900, fontSize: 22 }}>
                        <span>{match.homeScore ?? '-'}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: 15 }}>-</span>
                        <span>{match.awayScore ?? '-'}</span>
                      </div>
                    ) : locked && hasPick ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 18, color: 'var(--text-muted)' }}>
                        <span>{pick.home}</span><span style={{ fontSize: 13 }}>-</span><span>{pick.away}</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 700 }}>vs</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    {match.awayFlag && <img src={flagUrl(match.awayFlag)} alt={match.awayTeam} style={{ width: 28, height: 21, objectFit: 'cover', borderRadius: 3, flexShrink: 0 }} />}
                    <span style={{ fontWeight: 800, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{match.awayTeam}</span>
                  </div>
                </div>

                {/* Steppers (editable) */}
                {editing && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
                    {(['home', 'away'] as const).map((side) => (
                      <div key={side} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        <button onClick={() => bump(match.id, side, -1)} style={roundBtn} aria-label="-"><Minus size={16} /></button>
                        <span style={{ minWidth: 24, textAlign: 'center', fontSize: 24, fontWeight: 900, fontVariantNumeric: 'tabular-nums', color: pick[side] === '' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                          {pick[side] === '' ? '–' : pick[side]}
                        </span>
                        <button onClick={() => bump(match.id, side, 1)} style={roundBtn} aria-label="+"><Plus size={16} /></button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer finalizado/en vivo: tu pick + puntos */}
                {isResult && (match.defaultPickHome !== undefined || match.userPoints !== undefined) && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                    {match.defaultPickHome !== undefined && match.defaultPickAway !== undefined && (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.matches.yourPick}: {match.defaultPickHome}-{match.defaultPickAway}</span>
                    )}
                    {isFinished && match.userPoints !== undefined && <PointsBadge points={match.userPoints} />}
                  </div>
                )}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
