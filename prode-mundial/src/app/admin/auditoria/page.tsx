import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

export default async function AuditoriaPage() {
  const { data: logs } = await adminClient
    .from('audit_logs')
    .select('id, created_at, company_slug, admin_email, action, target_email, metadata')
    .order('created_at', { ascending: false })
    .limit(200)

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Auditoría</h1>
        <span style={{ color: '#64748b', fontSize: '13px' }}>Últimas {logs?.length ?? 0} acciones</span>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Admin</th>
              <th>Acción</th>
              <th>Empresa</th>
              <th>Usuario afectado</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {(logs ?? []).map(log => (
              <tr key={log.id}>
                <td style={{ color: '#64748b', whiteSpace: 'nowrap' }}>
                  {log.created_at
                    ? new Date(log.created_at).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
                    : '—'}
                </td>
                <td style={{ color: '#94a3b8', fontSize: '12px' }}>{log.admin_email ?? '—'}</td>
                <td>
                  <span className={`admin-badge ${ACTION_BADGE[log.action] ?? 'admin-badge-scheduled'}`}>
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
            {(logs ?? []).length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: '#475569' }}>Sin registros</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
