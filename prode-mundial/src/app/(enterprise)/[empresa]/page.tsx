import { createClient as createAdmin } from '@supabase/supabase-js'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function EmpresaPage({ params }: { params: Promise<{ empresa: string }> }) {
  const { empresa } = await params

  // Verificar que la empresa existe y está activa
  const { data: company } = await adminClient
    .from('companies')
    .select('slug, name, logo_url, banner_url, prode_id, primary_color, secondary_color')
    .eq('slug', empresa)
    .eq('active', true)
    .single()

  if (!company) notFound()

  // Obtener slug del prode (necesario para el link "Ya tengo cuenta")
  let prodeSlug: string | null = null
  if (company.prode_id) {
    const { data: prodeData } = await adminClient
      .from('prodes')
      .select('slug')
      .eq('id', company.prode_id)
      .single()
    prodeSlug = prodeData?.slug ?? null
  }

  // Si ya está logueado y es miembro activo, redirigir al prode
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user && company.prode_id && prodeSlug) {
    const { data: membership } = await adminClient
      .from('prode_members')
      .select('status')
      .eq('prode_id', company.prode_id)
      .eq('user_id', user.id)
      .single()
    if (membership?.status === 'active') {
      redirect(`/prode/${prodeSlug}`)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      fontFamily: 'Roboto, Arial, sans-serif',
      position: 'relative',
    }}>
      {(company.primary_color || company.secondary_color) && (
        <style>{`
          :root {
            ${company.primary_color   ? `--accent: ${company.primary_color};`            : ''}
            ${company.secondary_color ? `--accent-secondary: ${company.secondary_color};` : ''}
          }
        `}</style>
      )}
      {/* Estadio fondo */}
      <img src="/estadio.jpg" alt="" aria-hidden="true" style={{
        position: 'fixed', inset: 0, width: '100%', height: '100%',
        objectFit: 'cover', objectPosition: 'center 40%',
        opacity: 0.07, filter: 'blur(3px) saturate(0.6)', zIndex: 0, pointerEvents: 'none',
      }} />

      {/* Banner de empresa */}
      {company.banner_url && (
        <div style={{ position: 'relative', width: '100%', height: '220px', overflow: 'hidden' }}>
          <img src={company.banner_url} alt={company.name} style={{
            width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(10,31,61,0.2) 0%, rgba(10,31,61,0.85) 100%)',
          }} />
        </div>
      )}

      {/* Contenido centrado */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '48px 24px 80px',
      }}>
        {/* Logo empresa + escudo Rey del Prode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {company.logo_url && (
            <>
              <img src={company.logo_url} alt={company.name} style={{ height: '72px', objectFit: 'contain' }} />
              <div style={{ width: '1px', height: '48px', background: 'rgba(116,172,223,0.3)' }} />
            </>
          )}
          <img src="/escudo.png" alt="Rey del Prode" style={{ height: '72px', objectFit: 'contain' }} />
        </div>

        <h1 style={{ fontWeight: 900, fontSize: 'clamp(22px, 4vw, 36px)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
          Prode Mundial 2026
        </h1>
        <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '16px', marginBottom: '40px', textAlign: 'center' }}>
          {company.name}
        </p>

        {/* Card de acceso */}
        <div style={{
          width: '100%', maxWidth: '380px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '32px 28px',
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', marginBottom: '24px', lineHeight: 1.6 }}>
            Accedé con tu cuenta de Rey del Prode o registrate con el mail de tu empresa.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link href={`/${empresa}/register`} style={{
              display: 'block', textAlign: 'center',
              background: 'var(--accent)', color: '#fff',
              padding: '12px', borderRadius: '6px',
              fontWeight: 700, fontSize: '14px', textDecoration: 'none',
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              Registrarme
            </Link>
            <Link href={prodeSlug ? `/login?next=/prode/${prodeSlug}` : '/login'} style={{
              display: 'block', textAlign: 'center',
              background: 'transparent', color: 'var(--accent)',
              padding: '12px', borderRadius: '6px',
              fontWeight: 700, fontSize: '14px', textDecoration: 'none',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              border: '2px solid var(--accent)',
            }}>
              Ya tengo cuenta
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p style={{ marginTop: '40px', fontSize: '12px', color: 'rgba(116,172,223,0.4)' }}>
          Powered by <strong style={{ color: 'rgba(116,172,223,0.6)' }}>Rey del Prode</strong>
        </p>
      </div>
    </div>
  )
}
