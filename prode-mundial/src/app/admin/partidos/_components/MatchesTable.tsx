'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import MatchDialog from './MatchDialog'
import { deleteMatch } from '@/lib/actions/matches-admin'
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
        <button className="admin-btn admin-btn-primary" onClick={() => setDialog({ open: true })}>
          <Plus size={14} /> Nuevo partido
        </button>
      </div>

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
