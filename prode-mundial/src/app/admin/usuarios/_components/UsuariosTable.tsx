'use client'

import { useState, useMemo } from 'react'

type User = {
  id: string
  username: string | null
  first_name: string | null
  last_name: string | null
  email: string | null
  created_at: string | null
}

type SortDir = 'asc' | 'desc'

export default function UsuariosTable({ users }: { users: User[] }) {
  const [search, setSearch] = useState('')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    let rows = users
    if (q) {
      rows = rows.filter(u =>
        (u.email ?? '').toLowerCase().includes(q) ||
        (u.username ?? '').toLowerCase().includes(q) ||
        [u.first_name, u.last_name].filter(Boolean).join(' ').toLowerCase().includes(q)
      )
    }
    return [...rows].sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0
      return sortDir === 'asc' ? ta - tb : tb - ta
    })
  }, [users, search, sortDir])

  return (
    <>
      <div className="admin-filters">
        <input
          className="admin-input"
          style={{ width: 280 }}
          placeholder="Buscar por email, username o nombre…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span style={{ color: '#475569', fontSize: '12px', alignSelf: 'center' }}>
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Username</th>
              <th>Nombre</th>
              <th
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
              >
                Registrado {sortDir === 'asc' ? '↑' : '↓'}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td>{u.email ?? '—'}</td>
                <td style={{ color: '#94a3b8' }}>{u.username ?? '—'}</td>
                <td>{[u.first_name, u.last_name].filter(Boolean).join(' ') || '—'}</td>
                <td style={{ color: '#64748b' }}>
                  {u.created_at ? new Date(u.created_at).toLocaleDateString('es-AR') : '—'}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: '#475569' }}>Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
