'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

type PaidProde = {
  id: string
  name: string
  slug: string
  plan: string
  created_at: string | null
  owner_username: string | null
  owner_email: string | null
}

type SortDir = 'asc' | 'desc'

const PLAN_BADGE: Record<string, string> = {
  pro:      'admin-badge-scheduled',
  business: 'admin-badge-postponed',
}

export default function PagosTable({ pagos }: { pagos: PaidProde[] }) {
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    let rows = pagos.filter(p => {
      if (q &&
        !p.name.toLowerCase().includes(q) &&
        !(p.owner_username ?? '').toLowerCase().includes(q) &&
        !(p.owner_email ?? '').toLowerCase().includes(q)
      ) return false
      if (planFilter && p.plan !== planFilter) return false
      return true
    })
    return [...rows].sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0
      return sortDir === 'asc' ? ta - tb : tb - ta
    })
  }, [pagos, search, planFilter, sortDir])

  return (
    <>
      <div className="admin-filters">
        <input
          className="admin-input"
          style={{ width: 260 }}
          placeholder="Buscar por prode, dueño o email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="admin-select" style={{ width: 145 }} value={planFilter} onChange={e => setPlanFilter(e.target.value)}>
          <option value="">Todos los planes</option>
          <option value="pro">pro</option>
          <option value="business">business</option>
        </select>
        <span style={{ color: '#475569', fontSize: '12px', alignSelf: 'center' }}>
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Prode</th>
              <th>Plan</th>
              <th>Dueño</th>
              <th>Email</th>
              <th
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
              >
                Activado {sortDir === 'asc' ? '↑' : '↓'}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td>
                  <Link href={`/es/prode/${p.slug}`} target="_blank" style={{ color: '#38bdf8', textDecoration: 'none' }}>
                    {p.name}
                  </Link>
                </td>
                <td>
                  <span className={`admin-badge ${PLAN_BADGE[p.plan] ?? 'admin-badge-scheduled'}`}>
                    {p.plan}
                  </span>
                </td>
                <td style={{ color: '#94a3b8' }}>{p.owner_username ?? '—'}</td>
                <td style={{ color: '#64748b' }}>{p.owner_email ?? '—'}</td>
                <td style={{ color: '#64748b' }}>
                  {p.created_at ? new Date(p.created_at).toLocaleDateString('es-AR') : '—'}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: '#475569' }}>Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
