'use client'

import { useState, useTransition, useMemo } from 'react'
import { Plus, Pencil, Trash2, RefreshCw, Calculator, ChevronDown, ChevronRight } from 'lucide-react'
import MatchDialog from './MatchDialog'
import { deleteMatch, syncMatchesFromAPI, recalculatePointsAction } from '@/lib/actions/matches-admin'
import { formatMatchDateTime } from '@/lib/format-date'

type Match = {
  id: string
  home_team: string
  away_team: string
  home_flag?: string | null
  away_flag?: string | null
  match_date: string
  phase: string
  grupo?: string | null
  sede?: string | null
  estadio?: string | null
  home_score?: number | null
  away_score?: number | null
  status: 'scheduled' | 'live' | 'finished' | 'postponed'
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Programado',
  live:      'En vivo',
  finished:  'Finalizado',
  postponed: 'Postergado',
}

const STATUS_BADGE: Record<string, string> = {
  scheduled: 'admin-badge-scheduled',
  live:      'admin-badge-live',
  finished:  'admin-badge-finished',
  postponed: 'admin-badge-postponed',
}

function formatTime(match_date: string) {
  const d = new Date(match_date)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function getDayKey(match_date: string) {
  const d = new Date(match_date)
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

function formatDayLabel(dayKey: string) {
  const [y, m, d] = dayKey.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  })
}

function isPastDay(dayKey: string) {
  const today = new Date()
  const todayKey = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')
  return dayKey < todayKey
}

interface Props {
  initialMatches: Match[]
}

export default function MatchesTable({ initialMatches }: Props) {
  const [matches, setMatches] = useState<Match[]>(initialMatches)
  const [dialog, setDialog] = useState<{ open: boolean; match?: Match }>({ open: false })
  const [phaseFilter, setPhaseFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [syncMsg, setSyncMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [calcMsg, setCalcMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isSyncing, startSync] = useTransition()
  const [isCalc, startCalc] = useTransition()

  const filtered = useMemo(() => matches.filter(m => {
    if (phaseFilter  && m.phase  !== phaseFilter)  return false
    if (statusFilter && m.status !== statusFilter) return false
    return true
  }), [matches, phaseFilter, statusFilter])

  // Group by day, preserving order
  const dayGroups = useMemo(() => {
    const map = new Map<string, Match[]>()
    for (const m of filtered) {
      const key = getDayKey(m.match_date)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(m)
    }
    return map
  }, [filtered])

  // Auto-collapse past days
  const [collapsedDays, setCollapsedDays] = useState<Set<string>>(() => {
    const past = new Set<string>()
    for (const m of initialMatches) {
      const key = getDayKey(m.match_date)
      if (isPastDay(key)) past.add(key)
    }
    return past
  })

  function toggleDay(day: string) {
    setCollapsedDays(prev => {
      const next = new Set(prev)
      next.has(day) ? next.delete(day) : next.add(day)
      return next
    })
  }

  const PHASE_ORDER = ['groups', 'r32', 'r16', 'qf', 'sf', 'final']
  const PHASE_LABELS: Record<string, string> = {
    groups: 'Grupos',
    r32:    'Dieciseisavos',
    r16:    'Octavos',
    qf:     'Cuartos',
    sf:     'Semis',
    final:  'Final',
  }
  const existingPhases = new Set(matches.map(m => m.phase))
  const phases = PHASE_ORDER.filter(p => existingPhases.has(p))

  function handleSync() {
    startSync(async () => {
      const res = await syncMatchesFromAPI()
      if ('error' in res && res.error) {
        setSyncMsg({ type: 'error', text: `Error: ${res.error}` })
      } else {
        setSyncMsg({ type: 'success', text: `Sincronizado: ${(res as { total?: number }).total ?? 0} partidos` })
      }
      setTimeout(() => setSyncMsg(null), 5000)
    })
  }

  function handleRecalc() {
    startCalc(async () => {
      const res = await recalculatePointsAction()
      if ('error' in res && res.error) {
        setCalcMsg({ type: 'error', text: `Error: ${res.error}` })
      } else {
        setCalcMsg({ type: 'success', text: `Puntos recalculados: ${(res as { processed?: number }).processed ?? 0} partidos` })
      }
      setTimeout(() => setCalcMsg(null), 5000)
    })
  }

  function handleSaved(saved: Match) {
    setMatches(prev => {
      const exists = prev.some(m => m.id === saved.id)
      return exists
        ? prev.map(m => m.id === saved.id ? saved : m)
        : [saved, ...prev]
    })
    setDialog({ open: false })
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este partido?')) return
    const snapshot = matches
    setMatches(prev => prev.filter(m => m.id !== id))
    const result = await deleteMatch(id)
    if (result && 'error' in result) setMatches(snapshot)
  }

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Partidos</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            className="admin-btn admin-btn-ghost"
            onClick={handleSync}
            disabled={isSyncing}
            title="Sincronizar resultados desde la API externa"
          >
            <RefreshCw size={14} style={{ animation: isSyncing ? 'spin 1s linear infinite' : undefined }} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar API'}
          </button>
          <button
            className="admin-btn admin-btn-ghost"
            onClick={handleRecalc}
            disabled={isCalc}
            title="Recalcular puntos de todos los partidos finalizados"
          >
            <Calculator size={14} />
            {isCalc ? 'Calculando...' : 'Recalcular puntos'}
          </button>
          <button className="admin-btn admin-btn-primary" onClick={() => setDialog({ open: true })}>
            <Plus size={14} /> Nuevo partido
          </button>
        </div>
      </div>

      {(syncMsg || calcMsg) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
          {syncMsg && (
            <div style={{
              padding: '8px 14px', borderRadius: 4, fontSize: 13, fontWeight: 700,
              background: syncMsg.type === 'success' ? 'rgba(39,174,96,0.15)' : 'rgba(231,76,60,0.15)',
              color: syncMsg.type === 'success' ? '#27ae60' : '#e74c3c',
              border: `1px solid ${syncMsg.type === 'success' ? '#27ae60' : '#e74c3c'}`,
            }}>
              {syncMsg.text}
            </div>
          )}
          {calcMsg && (
            <div style={{
              padding: '8px 14px', borderRadius: 4, fontSize: 13, fontWeight: 700,
              background: calcMsg.type === 'success' ? 'rgba(39,174,96,0.15)' : 'rgba(231,76,60,0.15)',
              color: calcMsg.type === 'success' ? '#27ae60' : '#e74c3c',
              border: `1px solid ${calcMsg.type === 'success' ? '#27ae60' : '#e74c3c'}`,
            }}>
              {calcMsg.text}
            </div>
          )}
        </div>
      )}

      <div className="admin-filters">
        <select
          className="admin-select"
          style={{ width: 160 }}
          value={phaseFilter}
          onChange={e => setPhaseFilter(e.target.value)}
        >
          <option value="">Todas las fases</option>
          {phases.map(p => <option key={p} value={p}>{PHASE_LABELS[p] ?? p}</option>)}
        </select>

        <select
          className="admin-select"
          style={{ width: 160 }}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="scheduled">Programado</option>
          <option value="live">En vivo</option>
          <option value="finished">Finalizado</option>
          <option value="postponed">Postergado</option>
        </select>
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', color: '#475569', padding: 32 }}>Sin partidos</div>
      )}

      {Array.from(dayGroups.entries()).map(([dayKey, dayMatches]) => {
        const collapsed = collapsedDays.has(dayKey)
        const finishedCount = dayMatches.filter(m => m.status === 'finished').length
        const liveCount    = dayMatches.filter(m => m.status === 'live').length

        return (
          <div key={dayKey} style={{ marginBottom: 12 }}>
            {/* Day header */}
            <button
              onClick={() => toggleDay(dayKey)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: collapsed ? 8 : '8px 8px 0 0',
                padding: '10px 16px',
                cursor: 'pointer',
                color: '#e2e8f0',
                fontSize: 13,
                fontWeight: 600,
                textAlign: 'left',
                minWidth: 0,
              }}
            >
              <span style={{ flexShrink: 0 }}>
                {collapsed ? <ChevronRight size={14} color="#64748b" /> : <ChevronDown size={14} color="#64748b" />}
              </span>
              <span style={{
                textTransform: 'capitalize',
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {formatDayLabel(dayKey)}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <span style={{ color: '#475569', fontWeight: 400 }}>
                  {dayMatches.length}p
                </span>
                {liveCount > 0 && (
                  <span className="admin-badge admin-badge-live">{liveCount} en vivo</span>
                )}
                {finishedCount > 0 && finishedCount === dayMatches.length && (
                  <span className="admin-badge admin-badge-finished">✓</span>
                )}
              </span>
            </button>

            {/* Day matches table */}
            {!collapsed && (
              <div className="admin-table-wrap" style={{ borderRadius: '0 0 8px 8px', borderTop: 'none' }}>
                <table className="admin-table" style={{ minWidth: 560 }}>
                  <colgroup>
                    <col style={{ width: 'auto' }} />
                    <col style={{ width: 55 }} />
                    <col style={{ width: 90 }} />
                    <col style={{ width: 80 }} />
                    <col style={{ width: 105 }} />
                    <col style={{ width: 70 }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Partido</th>
                      <th>Hora</th>
                      <th>Fase</th>
                      <th>Resultado</th>
                      <th>Estado</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayMatches.map(match => (
                      <tr key={match.id}>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'nowrap' }}>
                            {match.home_flag && <img src={`https://flagcdn.com/20x15/${match.home_flag}.png`} alt="" width={20} height={14} style={{ borderRadius: 2, flexShrink: 0 }} />}
                            <strong style={{ color: '#e2e8f0', whiteSpace: 'nowrap' }}>{match.home_team}</strong>
                            <span style={{ color: '#475569', flexShrink: 0 }}>vs</span>
                            {match.away_flag && <img src={`https://flagcdn.com/20x15/${match.away_flag}.png`} alt="" width={20} height={14} style={{ borderRadius: 2, flexShrink: 0 }} />}
                            <strong style={{ color: '#e2e8f0', whiteSpace: 'nowrap' }}>{match.away_team}</strong>
                          </span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap', color: '#94a3b8' }}>
                          {formatTime(match.match_date)}
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {PHASE_LABELS[match.phase] ?? match.phase}
                          {match.grupo && <span style={{ color: '#475569', marginLeft: 4 }}>({match.grupo})</span>}
                        </td>
                        <td>
                          {match.home_score != null && match.away_score != null
                            ? `${match.home_score} - ${match.away_score}`
                            : <span style={{ color: '#334155' }}>—</span>}
                        </td>
                        <td>
                          <span className={`admin-badge ${STATUS_BADGE[match.status]}`}>
                            {STATUS_LABELS[match.status]}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="admin-btn admin-btn-ghost admin-btn-sm"
                              onClick={() => setDialog({ open: true, match })}
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              className="admin-btn admin-btn-danger admin-btn-sm"
                              onClick={() => handleDelete(match.id)}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      })}

      {dialog.open && (
        <MatchDialog
          match={dialog.match}
          onSaved={handleSaved}
          onClose={() => setDialog({ open: false })}
        />
      )}
    </>
  )
}
