'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

type Prode = {
  id: string
  name: string
  slug: string
  plan: string | null
  invite_code: string | null
  requires_approval: boolean
  created_at: string | null
  member_count: number
}

type SortField = 'members' | 'created_at'
type SortDir = 'asc' | 'desc'

const PLAN_BADGE: Record<string, string> = {
  free:       'admin-badge-finished',
  pro:        'admin-badge-scheduled',
  business:   'admin-badge-postponed',
  enterprise: 'admin-badge-enterprise',
}

export default function ProdesTable({ prodes }: { prodes: Prode[] }) {
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [approvalFilter, setApprovalFilter] = useState('')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function handleSort(field: SortField) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  function sortIcon(field: SortField) {
    if (sortField !== field) return ' ↕'
    return sortDir === 'asc' ? ' ↑' : ' ↓'
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    let rows = prodes.filter(p => {
      if (q && !p.name.toLowerCase().includes(q) && !p.slug.toLowerCase().includes(q)) return false
      if (planFilter && (p.plan ?? 'free') !== planFilter) return false
      if (approvalFilter !== '' && String(p.requires_approval) !== approvalFilter) return false
      return true
    })
    return [...rows].sort((a, b) => {
      let diff = 0
      if (sortField === 'members') {
        diff = a.member_count - b.member_count
      } else {
        const ta = a.created_at ? new Date(a.created_at).getTime() : 0
        const tb = b.created_at ? new Date(b.created_at).getTime() : 0
        diff = ta - tb
      }
      return sortDir === 'asc' ? diff : -diff
    })
  }, [prodes, search, planFilter, approvalFilter, sortField, sortDir])

  return (
    <>
      <div className="admin-filters">
        <input
          className="admin-input"
          style={{ width: 220 }}
          placeholder="Buscar por nombre o slug…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="admin-select" style={{ width: 140 }} value={planFilter} onChange={e => setPlanFilter(e.target.value)}>
          <option value="">Todos los planes</option>
          <option value="free">free</option>
          <option value="pro">pro</option>
          <option value="business">business</option>
          <option value="enterprise">enterprise</option>
        </select>
        <select className="admin-select" style={{ width: 160 }} value={approvalFilter} onChange={e => setApprovalFilter(e.target.value)}>
          <option value="">Aprobación: todas</option>
          <option value="true">Aprobación: Sí</option>
          <option value="false">Aprobación: No</option>
        </select>
        <span style={{ color: '#475569', fontSize: '12px', alignSelf: 'center' }}>
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Slug</th>
              <th>Plan</th>
              <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('members')}>
                Miembros{sortIcon('members')}
              </th>
              <th>Aprobación</th>
              <th>Código</th>
              <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('created_at')}>
                Creado{sortIcon('created_at')}
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
                <td style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '12px' }}>{p.slug}</td>
                <td>
                  <span className={`admin-badge ${PLAN_BADGE[p.plan ?? 'free'] ?? 'admin-badge-finished'}`}>
                    {p.plan ?? 'free'}
                  </span>
                </td>
                <td>{p.member_count}</td>
                <td style={{ color: '#94a3b8' }}>{p.requires_approval ? 'Sí' : 'No'}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '11px', color: '#64748b' }}>{p.invite_code ?? '—'}</td>
                <td style={{ color: '#64748b' }}>
                  {p.created_at ? new Date(p.created_at).toLocaleDateString('es-AR') : '—'}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#475569' }}>Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
