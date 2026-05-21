import { createClient } from '@supabase/supabase-js'
import ProdesTable from './_components/ProdesTable'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function ProdesPage() {
  const [{ data: prodes }, { data: memberRows }] = await Promise.all([
    adminClient
      .from('prodes')
      .select('id, name, slug, plan, invite_code, requires_approval, created_at')
      .order('created_at', { ascending: false }),
    adminClient
      .from('prode_members')
      .select('prode_id')
      .eq('status', 'active'),
  ])

  const countMap = new Map<string, number>()
  for (const m of (memberRows ?? [])) {
    countMap.set(m.prode_id, (countMap.get(m.prode_id) ?? 0) + 1)
  }

  const prodesWithCount = (prodes ?? []).map(p => ({
    ...p,
    member_count: countMap.get(p.id) ?? 0,
  }))

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Prodes</h1>
        <span style={{ color: '#64748b', fontSize: '13px' }}>{prodes?.length ?? 0} grupos</span>
      </div>
      <ProdesTable prodes={prodesWithCount} />
    </>
  )
}
