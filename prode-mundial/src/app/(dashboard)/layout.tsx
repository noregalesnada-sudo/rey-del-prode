import DashboardShell from '@/components/layout/DashboardShell'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
        .select('prodes(id, slug, name)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('joined_at', { ascending: true }),
    ])

    username = profileRes.data?.username ?? user.email?.split('@')[0] ?? ''

    const rawProdes = (prodesRes.data ?? [])
      .map((m: { prodes: { id: string; slug: string; name: string } | { id: string; slug: string; name: string }[] | null }) => {
        const p = Array.isArray(m.prodes) ? m.prodes[0] : m.prodes
        return p ? { id: p.id, slug: p.slug, name: p.name } : null
      })
      .filter(Boolean) as { id: string; slug: string; name: string }[]

    // Obtener nombres customizados de empresas enterprise
    const prodeIds = rawProdes.map((p) => p.id)
    const { data: companies } = prodeIds.length > 0
      ? await adminClient.from('companies').select('prode_id, prode_name').in('prode_id', prodeIds)
      : { data: [] }
    const companyNameMap = new Map((companies ?? []).map((c: { prode_id: string; prode_name: string | null }) => [c.prode_id, c.prode_name]))

    userProdes = rawProdes.map((p) => ({
      slug: p.slug,
      name: companyNameMap.get(p.id) || p.name,
    }))
  }

  return (
    <DashboardShell userName={username} userProdes={userProdes} isLoggedIn={!!user}>
      {children}
    </DashboardShell>
  )
}
