import { createClient } from '@supabase/supabase-js'
import PagosTable from './_components/PagosTable'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function PagosPage() {
  const { data: paidProdes } = await adminClient
    .from('prodes')
    .select('id, name, slug, plan, owner_id, created_at')
    .in('plan', ['pro', 'business'])
    .order('created_at', { ascending: false })

  const ownerIds = [...new Set((paidProdes ?? []).map(p => p.owner_id).filter(Boolean))]
  const { data: profiles } = ownerIds.length > 0
    ? await adminClient.from('profiles').select('id, email, username').in('id', ownerIds)
    : { data: [] as { id: string; email: string; username: string }[] }

  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]))

  const pagos = (paidProdes ?? []).map(p => {
    const owner = profileMap.get(p.owner_id)
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      plan: p.plan,
      created_at: p.created_at,
      owner_username: owner?.username ?? null,
      owner_email: owner?.email ?? null,
    }
  })

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Pagos</h1>
        <span style={{ color: '#64748b', fontSize: '13px' }}>{pagos.length} planes activos</span>
      </div>
      <p style={{ color: '#475569', fontSize: '12px', marginBottom: '16px' }}>
        Prodes con plan pago activo. Los pagos se procesan vía MercadoPago.
      </p>
      <PagosTable pagos={pagos} />
    </>
  )
}
