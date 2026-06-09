'use client'

import { useState, useMemo } from 'react'

type RankingRow = {
  user_id: string
  username: string | null
  first_name: string | null
  last_name: string | null
  total_points: number
  exact_hits: number
  partial_hits: number
  prodes_count: number
}

type SortKey = 'total_points' | 'exact_hits' | 'partial_hits' | 'prodes_count'

export default function RankingTable({ rows }: { rows: RankingRow[] }) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('total_points')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    let data = rows
    if (q) {
      data = data.filter(r =>
        (r.username ?? '').toLowerCase().includes(q) ||
        [r.first_name, r.last_name].filter(Boolean).join(' ').toLowerCase().includes(q)
      )
    }
    return [...data].sort((a, b) => b[sortKey] - a[sortKey])
  }, [rows, search, sortKey])

  const col = (key: SortKey, label: string) => (
    <th
      style={{ cursor: 'pointer', userSelect: 'none' }}
      onClick={() => setSortKey(key)}
    >
      {label} {sortKey === key ? '↓' : ''}
    </th>
  )

  return (
    <>
      <div className="admin-filters">
        <input
          className="admin-input"
          style={{ width: 280 }}
          placeholder="Buscar por username o nombre…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span style={{ color: '#475569', fontSize: '12px', alignSelf: 'center' }}>
          {filtered.length} usuario{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Usuario</th>
              {col('total_points', 'Puntos totales')}
              {col('exact_hits', 'Exactos')}
              {col('partial_hits', 'Parciales')}
              {col('prodes_count', 'Prodes')}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={r.user_id}>
                <td style={{ color: '#64748b', fontWeight: 700, width: 40 }}>{i + 1}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>
                    {[r.first_name, r.last_name].filter(Boolean).join(' ') || r.username || '—'}
                  </div>
                  {r.username && (
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>{r.username}</div>
                  )}
                </td>
                <td style={{ fontWeight: 700, color: '#FFD700' }}>{r.total_points}</td>
                <td style={{ color: '#4ade80' }}>{r.exact_hits}</td>
                <td style={{ color: '#94a3b8' }}>{r.partial_hits}</td>
                <td style={{ color: '#64748b' }}>{r.prodes_count}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#475569' }}>Sin resultados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
