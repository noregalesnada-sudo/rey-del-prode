import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let username = ''
  let userProdes: { slug: string; name: string }[] = []

  if (user) {
    const [profileRes, prodesRes] = await Promise.all([
      supabase.from('profiles').select('username').eq('id', user.id).single(),
      supabase
        .from('prode_members')
        .select('prodes(slug, name)')
        .eq('user_id', user.id)
        .order('joined_at', { ascending: true }),
    ])

    username = profileRes.data?.username ?? user.email?.split('@')[0] ?? ''
    userProdes = (prodesRes.data ?? [])
      .map((m: { prodes: { slug: string; name: string } | { slug: string; name: string }[] | null }) => {
        const p = Array.isArray(m.prodes) ? m.prodes[0] : m.prodes
        return p ? { slug: p.slug, name: p.name } : null
      })
      .filter(Boolean) as { slug: string; name: string }[]
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar userName={username} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar userProdes={userProdes} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px 16px 50px', maxWidth: '980px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
