import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PLAN_BADGE: Record<string, string> = {
  free:     'admin-badge-finished',
  pro:      'admin-badge-scheduled',
  business: 'admin-badge-postponed',
}

export default async function ProdesPage() {
  const [{ data: prodes }, { data: memberRows }] = await Promise.all([
    adminClient
      .from('prodes')
      .select('id, name, slug, plan, invite_code, requires_approval, created_at')
      .order('created_at', { ascending: false }),
    adminClient
      .from('prode_members')
      .select('prode_id')
      .eq('status', 'active'),
  ])

  const countMap = new Map<string, number>()
  for (const m of (memberRows ?? [])) {
    countMap.set(m.prode_id, (countMap.get(m.prode_id) ?? 0) + 1)
  }

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Prodes</h1>
        <span style={{ color: '#64748b', fontSize: '13px' }}>{prodes?.length ?? 0} grupos</span>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Slug</th>
              <th>Plan</th>
              <th>Miembros</th>
              <th>Aprobación</th>
              <th>Código</th>
              <th>Creado</th>
            </tr>
          </thead>
          <tbody>
            {(prodes ?? []).map(p => (
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
                <td>{countMap.get(p.id) ?? 0}</td>
                <td style={{ color: '#94a3b8' }}>{p.requires_approval ? 'Sí' : 'No'}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '11px', color: '#64748b' }}>{p.invite_code ?? '—'}</td>
                <td style={{ color: '#64748b' }}>
                  {p.created_at ? new Date(p.created_at).toLocaleDateString('es-AR') : '—'}
                </td>
              </tr>
            ))}
            {(prodes ?? []).length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#475569' }}>Sin prodes</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
