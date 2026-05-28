'use client'

import { useState, useMemo } from 'react'

type AuditLog = {
  id: string
  created_at: string | null
  company_slug: string | null
  admin_email: string | null
  action: string | null
  target_email: string | null
  metadata: Record<string, unknown> | null
}

type SortDir = 'asc' | 'desc'

const ACTION_BADGE: Record<string, string> = {
  approve_member:   'admin-badge-finished',
  reject_member:    'admin-badge-live',
  remove_member:    'admin-badge-live',
  update_role:      'admin-badge-scheduled',
  update_area:      'admin-badge-scheduled',
  update_config:    'admin-badge-postponed',
  import_whitelist: 'admin-badge-postponed',
  upload_asset:     'admin-badge-postponed',
}

export default function AuditoriaTable({ logs }: { logs: AuditLog[] }) {
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const actions = useMemo(
    () => Array.from(new Set(logs.map(l => l.action).filter((a): a is string => a !== null))).sort(),
    [logs]
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    let rows = logs.filter(l => {
      if (q &&
        !(l.admin_email ?? '').toLowerCase().includes(q) &&
        !(l.company_slug ?? '').toLowerCase().includes(q) &&
        !(l.target_email ?? '').toLowerCase().includes(q)
      ) return false
      if (actionFilter && l.action !== actionFilter) return false
      return true
    })
    return [...rows].sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0
      return sortDir === 'asc' ? ta - tb : tb - ta
    })
  }, [logs, search, actionFilter, sortDir])

  return (
    <>
      <div className="admin-filters">
        <input
          className="admin-input"
          style={{ width: 260 }}
          placeholder="Buscar por admin, empresa o usuario…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="admin-select" style={{ width: 170 }} value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
          <option value="">Todas las acciones</option>
          {actions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <span style={{ color: '#475569', fontSize: '12px', alignSelf: 'center' }}>
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
              >
                Fecha {sortDir === 'asc' ? '↑' : '↓'}
              </th>
              <th>Admin</th>
              <th>Acción</th>
              <th>Empresa</th>
              <th>Usuario afectado</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(log => (
              <tr key={log.id}>
                <td style={{ color: '#64748b', whiteSpace: 'nowrap' }}>
                  {log.created_at
                    ? new Date(log.created_at).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
                    : '—'}
                </td>
                <td style={{ color: '#94a3b8', fontSize: '12px' }}>{log.admin_email ?? '—'}</td>
                <td>
                  <span className={`admin-badge ${ACTION_BADGE[log.action ?? ''] ?? 'admin-badge-scheduled'}`}>
                    {log.action ?? '—'}
                  </span>
                </td>
                <td style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '12px' }}>{log.company_slug ?? '—'}</td>
                <td style={{ color: '#94a3b8', fontSize: '12px' }}>{log.target_email ?? '—'}</td>
                <td style={{ color: '#475569', fontSize: '11px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {log.metadata ? JSON.stringify(log.metadata) : '—'}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: '#475569' }}>Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
