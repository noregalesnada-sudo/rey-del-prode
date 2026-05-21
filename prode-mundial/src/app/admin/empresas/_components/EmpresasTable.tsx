'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

type Company = {
  slug: string
  name: string
  plan: string | null
  access_mode: string | null
  logo_url: string | null
  prode_name: string | null
  areas_enabled: boolean
}

const PLAN_BADGE: Record<string, string> = {
  free:       'admin-badge-finished',
  pro:        'admin-badge-scheduled',
  business:   'admin-badge-postponed',
  enterprise: 'admin-badge-enterprise',
}

const ACCESS_LABELS: Record<string, string> = {
  whitelist:   'Whitelist',
  invite_link: 'Link libre',
  open:        'Abierto',
}

export default function EmpresasTable({ companies }: { companies: Company[] }) {
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [accessFilter, setAccessFilter] = useState('')
  const [areasFilter, setAreasFilter] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return companies.filter(c => {
      if (q && !c.name.toLowerCase().includes(q) && !c.slug.toLowerCase().includes(q)) return false
      if (planFilter && (c.plan ?? 'free') !== planFilter) return false
      if (accessFilter && (c.access_mode ?? '') !== accessFilter) return false
      if (areasFilter !== '' && String(c.areas_enabled) !== areasFilter) return false
      return true
    })
  }, [companies, search, planFilter, accessFilter, areasFilter])

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
        <select className="admin-select" style={{ width: 145 }} value={accessFilter} onChange={e => setAccessFilter(e.target.value)}>
          <option value="">Todos los accesos</option>
          <option value="whitelist">Whitelist</option>
          <option value="invite_link">Link libre</option>
          <option value="open">Abierto</option>
        </select>
        <select className="admin-select" style={{ width: 120 }} value={areasFilter} onChange={e => setAreasFilter(e.target.value)}>
          <option value="">Áreas: todas</option>
          <option value="true">Áreas: Sí</option>
          <option value="false">Áreas: No</option>
        </select>
        <span style={{ color: '#475569', fontSize: '12px', alignSelf: 'center' }}>
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Slug</th>
              <th>Plan</th>
              <th>Acceso</th>
              <th>Prode</th>
              <th>Áreas</th>
              <th>Panel</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.slug}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {c.logo_url && (
                      <img src={c.logo_url} alt={c.name} style={{ height: '20px', objectFit: 'contain', borderRadius: '2px' }} />
                    )}
                    <span>{c.name}</span>
                  </div>
                </td>
                <td style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '12px' }}>{c.slug}</td>
                <td>
                  <span className={`admin-badge ${PLAN_BADGE[c.plan ?? 'free'] ?? 'admin-badge-finished'}`}>
                    {c.plan ?? 'free'}
                  </span>
                </td>
                <td style={{ color: '#94a3b8' }}>{ACCESS_LABELS[c.access_mode ?? ''] ?? c.access_mode ?? '—'}</td>
                <td style={{ color: '#94a3b8' }}>{c.prode_name ?? '—'}</td>
                <td style={{ color: '#94a3b8' }}>{c.areas_enabled ? 'Sí' : 'No'}</td>
                <td>
                  <Link href={`/es/empresa-admin/${c.slug}`} target="_blank" style={{ color: '#38bdf8', fontSize: '12px', textDecoration: 'none' }}>
                    Abrir →
                  </Link>
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
