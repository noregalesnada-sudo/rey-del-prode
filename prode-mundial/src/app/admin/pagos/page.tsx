import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PLAN_BADGE: Record<string, string> = {
  pro:      'admin-badge-scheduled',
  business: 'admin-badge-postponed',
}

export default async function PagosPage() {
  const { data: paidProdes } = await adminClient
    .from('prodes')
    .select('id, name, slug, plan, owner_id, created_at')
    .in('plan', ['pro', 'business'])
    .order('created_at', { ascending: false })

  const ownerIds = [...new Set((paidProdes ?? []).map(p => p.owner_id).filter(Boolean))]
  const { data: profiles } = ownerIds.length > 0
    ? await adminClient.from('profiles').select('id, email, username').in('id', ownerIds)
    : { data: [] as { id: string; email: string; username: string }[] }

  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]))

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Pagos</h1>
        <span style={{ color: '#64748b', fontSize: '13px' }}>{paidProdes?.length ?? 0} planes activos</span>
      </div>
      <p style={{ color: '#475569', fontSize: '12px', marginBottom: '16px' }}>
        Prodes con plan pago activo. Los pagos se procesan vía MercadoPago.
      </p>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Prode</th>
              <th>Plan</th>
              <th>Dueño</th>
              <th>Email</th>
              <th>Activado</th>
            </tr>
          </thead>
          <tbody>
            {(paidProdes ?? []).map(p => {
              const owner = profileMap.get(p.owner_id)
              return (
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
                  <td style={{ color: '#94a3b8' }}>{owner?.username ?? '—'}</td>
                  <td style={{ color: '#64748b' }}>{owner?.email ?? '—'}</td>
                  <td style={{ color: '#64748b' }}>
                    {p.created_at ? new Date(p.created_at).toLocaleDateString('es-AR') : '—'}
                  </td>
                </tr>
              )
            })}
            {(paidProdes ?? []).length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: '#475569' }}>Sin planes pagos activos</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
