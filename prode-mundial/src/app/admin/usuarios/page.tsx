import { createClient } from '@supabase/supabase-js'
import UsuariosTable from './_components/UsuariosTable'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function UsuariosPage() {
  const { data: users, count } = await adminClient
    .from('profiles')
    .select('id, username, first_name, last_name, email, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(10000)

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Usuarios</h1>
        <span style={{ color: '#64748b', fontSize: '13px' }}>{count ?? 0} registrados</span>
      </div>
      <UsuariosTable users={users ?? []} />
    </>
  )
}
