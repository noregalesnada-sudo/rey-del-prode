import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import GuiaContent from '@/components/admin/GuiaContent'
const SUPERADMIN_EMAIL = 'santiagodambrosio2@gmail.com'

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function GuiaPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/empresa-admin/${slug}/guia`)

  const isSuperAdmin = user.email === SUPERADMIN_EMAIL
  if (!isSuperAdmin) {
    const { data: adminEntry } = await adminClient
      .from('company_admins')
      .select('id')
      .eq('company_slug', slug)
      .eq('email', user.email!)
      .single()
    if (!adminEntry) redirect('/')
  }

  const { data: company } = await adminClient
    .from('companies')
    .select('name, logo_url')
    .eq('slug', slug)
    .single()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      fontFamily: 'Roboto, Arial, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link href={`/empresa-admin/${slug}`} style={{
              color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              ← Volver al panel
            </Link>
            <span style={{ color: 'var(--border)', fontSize: '13px' }}>|</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Guía de uso para administradores
            </span>
          </div>
          <GuiaDownloadButton slug={slug} companyName={company?.name ?? slug} />
        </div>
      </div>

      {/* Contenido */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '40px 24px 80px' }}>
        <GuiaContent companyName={company?.name ?? slug} />
      </div>
    </div>
  )
}

function GuiaDownloadButton({ slug, companyName }: { slug: string; companyName: string }) {
  return (
    <a
      href={`/api/empresa/guia/${slug}`}
      download={`guia-admin-rey-del-prode.md`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        background: 'rgba(116,172,223,0.1)', border: '1px solid rgba(116,172,223,0.3)',
        color: 'var(--accent)', borderRadius: '6px', padding: '7px 14px',
        fontSize: '12px', fontWeight: 700, textDecoration: 'none',
        textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap',
      }}
    >
      Descargar para IA (.md)
    </a>
  )
}
