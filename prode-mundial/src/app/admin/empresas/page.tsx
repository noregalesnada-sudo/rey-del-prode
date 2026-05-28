import { createClient } from '@supabase/supabase-js'
import EmpresasTable from './_components/EmpresasTable'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
      <EmpresasTable companies={companies ?? []} />
    </>
  )
}
