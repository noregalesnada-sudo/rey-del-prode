import { createClient } from '@supabase/supabase-js'
import AuditoriaTable from './_components/AuditoriaTable'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
      <AuditoriaTable logs={logs ?? []} />
    </>
  )
}
