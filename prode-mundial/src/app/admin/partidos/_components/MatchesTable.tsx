'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, RefreshCw, Calculator } from 'lucide-react'
import MatchDialog from './MatchDialog'
import { deleteMatch, syncMatchesFromAPI, recalculatePointsAction } from '@/lib/actions/matches-admin'
import { formatMatchDateTime } from '@/lib/format-date'

type Match = {
  id: string
  home_team: string
  away_team: string
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

  const phases = Array.from(new Set(matches.map(m => m.phase))).sort()

  const filtered = matches.filter(m => {
    if (phaseFilter  && m.phase  !== phaseFilter)  return false
    if (statusFilter && m.status !== statusFilter) return false
    return true
  })

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
          {phases.map(p => <option key={p} value={p}>{p}</option>)}
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

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Partido</th>
              <th>Fecha</th>
              <th>Fase</th>
              <th>Resultado</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#475569', padding: 32 }}>
                  Sin partidos
                </td>
              </tr>
            )}
            {filtered.map(match => (
              <tr key={match.id}>
                <td>
                  <strong style={{ color: '#e2e8f0' }}>{match.home_team}</strong>
                  <span style={{ color: '#475569', margin: '0 6px' }}>vs</span>
                  <strong style={{ color: '#e2e8f0' }}>{match.away_team}</strong>
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>{formatMatchDateTime(match.match_date)}</td>
                <td>
                  {match.phase}
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
