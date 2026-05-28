import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function AdminHeader() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="admin-header">
      <span className="admin-header-email">{user?.email}</span>
      <form action="/auth/signout" method="POST">
        <button type="submit" className="admin-header-signout">
          <LogOut size={14} />
          Salir
        </button>
      </form>
    </header>
  )
}
