import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function UsuariosPage() {
  const { data: users, count } = await adminClient
    .from('profiles')
    .select('id, username, first_name, last_name, email, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Usuarios</h1>
        <span style={{ color: '#64748b', fontSize: '13px' }}>{count ?? 0} registrados</span>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Username</th>
              <th>Nombre</th>
              <th>Registrado</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map(u => (
              <tr key={u.id}>
                <td>{u.email ?? '—'}</td>
                <td style={{ color: '#94a3b8' }}>{u.username ?? '—'}</td>
                <td>{[u.first_name, u.last_name].filter(Boolean).join(' ') || '—'}</td>
                <td style={{ color: '#64748b' }}>
                  {u.created_at ? new Date(u.created_at).toLocaleDateString('es-AR') : '—'}
                </td>
              </tr>
            ))}
            {(users ?? []).length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: '#475569' }}>Sin usuarios</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
