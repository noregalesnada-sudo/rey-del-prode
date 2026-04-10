import DashboardShell from '@/components/layout/DashboardShell'
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
        .eq('status', 'active')
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
    <DashboardShell userName={username} userProdes={userProdes} isLoggedIn={!!user}>
      {children}
    </DashboardShell>
  )
}
