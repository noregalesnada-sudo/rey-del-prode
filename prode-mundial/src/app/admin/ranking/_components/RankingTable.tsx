'use client'

import { useState, useMemo } from 'react'
import type { ProdeOption, LeaderboardRow } from '../page'

type BestRow = {
  user_id: string
  username: string | null
  first_name: string | null
  last_name: string | null
  best_points: number
  exact_hits: number
  partial_hits: number
  prode_name: string
  prodes_count: number
}

export default function RankingTable({
  prodes,
  rows,
}: {
  prodes: ProdeOption[]
  rows: LeaderboardRow[]
}) {
  const [search, setSearch] = useState('')

  const prodeMap = useMemo(
    () => new Map(prodes.map(p => [p.id, p.name])),
    [prodes]
  )

  // Un row por usuario: su mejor puntaje en cualquier prode + total de prodes
  const bestByUser = useMemo(() => {
    const map = new Map<string, BestRow>()
    const prodeCountMap = new Map<string, number>()

    for (const r of rows) {
      prodeCountMap.set(r.user_id, (prodeCountMap.get(r.user_id) ?? 0) + 1)
    }

    for (const r of rows) {
      const pts = r.total_points ?? 0
      const existing = map.get(r.user_id)
      if (!existing || pts > existing.best_points) {
        map.set(r.user_id, {
          user_id: r.user_id,
          username: r.username,
          first_name: r.first_name,
          last_name: r.last_name,
          best_points: pts,
          exact_hits: r.exact_hits ?? 0,
          partial_hits: r.partial_hits ?? 0,
          prode_name: prodeMap.get(r.prode_id) ?? '—',
          prodes_count: prodeCountMap.get(r.user_id) ?? 1,
        })
      }
    }
    return [...map.values()].sort((a, b) => b.best_points - a.best_points)
  }, [rows, prodeMap])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return bestByUser
    return bestByUser.filter(r =>
      (r.username ?? '').toLowerCase().includes(q) ||
      [r.first_name, r.last_name].filter(Boolean).join(' ').toLowerCase().includes(q)
    )
  }, [bestByUser, search])

  return (
    <>
      <div className="admin-filters">
        <input
          className="admin-input"
          style={{ width: 260 }}
          placeholder="Buscar por username o nombre…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span style={{ color: '#475569', fontSize: '12px', alignSelf: 'center' }}>
          {filtered.length} usuario{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table" style={{ minWidth: 520 }}>
          <colgroup>
            <col style={{ width: 40 }} />
            <col />
            <col style={{ width: 100 }} />
            <col style={{ width: 75 }} />
            <col style={{ width: 75 }} />
            <col style={{ width: 160 }} />
            <col style={{ width: 70 }} />
          </colgroup>
          <thead>
            <tr>
              <th>#</th>
              <th>Usuario</th>
              <th>Mejor puntaje</th>
              <th>Exactos</th>
              <th>Parciales</th>
              <th>Prode</th>
              <th>Prodes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={r.user_id}>
                <td style={{ color: '#64748b', fontWeight: 700 }}>{i + 1}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>
                    {[r.first_name, r.last_name].filter(Boolean).join(' ') || r.username || '—'}
                  </div>
                  {r.username && (
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>{r.username}</div>
                  )}
                </td>
                <td style={{ fontWeight: 700, color: '#FFD700' }}>{r.best_points}</td>
                <td style={{ color: '#4ade80' }}>{r.exact_hits}</td>
                <td style={{ color: '#94a3b8' }}>{r.partial_hits}</td>
                <td style={{ color: '#64748b', fontSize: '12px' }}>{r.prode_name}</td>
                <td style={{ color: '#64748b', textAlign: 'center' }}>{r.prodes_count}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: '#475569' }}>Sin resultados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
