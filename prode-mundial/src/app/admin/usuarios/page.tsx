import { createClient } from '@supabase/supabase-js'
import UsuariosTable from './_components/UsuariosTable'

type User = {
  id: string
  username: string | null
  first_name: string | null
  last_name: string | null
  email: string | null
  created_at: string | null
}

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function fetchAllUsers(): Promise<{ users: User[]; count: number }> {
  const PAGE_SIZE = 1000
  let page = 0
  const allUsers: User[] = []
  let total = 0

  while (true) {
    const { data, count, error } = await adminClient
      .from('profiles')
      .select('id, username, first_name, last_name, email, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (error || !data) break
    if (page === 0) total = count ?? 0
    allUsers.push(...(data as User[]))
    if (allUsers.length >= total || data.length < PAGE_SIZE) break
    page++
  }

  return { users: allUsers, count: total }
}

export default async function UsuariosPage() {
  const { users, count } = await fetchAllUsers()

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Usuarios</h1>
        <span style={{ color: '#64748b', fontSize: '13px' }}>{count} registrados</span>
      </div>
      <UsuariosTable users={users} />
    </>
  )
}
