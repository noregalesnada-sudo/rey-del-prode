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

const ACCESS_LABELS: Record<string, string> = {
  whitelist:   'Whitelist',
  invite_link: 'Link libre',
  open:        'Abierto',
}

export default async function EmpresasPage() {
  const { data: companies } = await adminClient
    .from('companies')
    .select('slug, name, plan, access_mode, logo_url, prode_name, areas_enabled')
    .order('name', { ascending: true })

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Empresas</h1>
        <span style={{ color: '#64748b', fontSize: '13px' }}>{companies?.length ?? 0} empresas</span>
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
            {(companies ?? []).map(c => (
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
            {(companies ?? []).length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#475569' }}>Sin empresas</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
