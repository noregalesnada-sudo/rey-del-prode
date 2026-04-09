import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function WelcomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let username: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()
    username = profile?.username ?? null
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 44px)',
      display: 'flex',
      alignItems: 'center',
      padding: '40px 32px',
      gap: '48px',
      flexWrap: 'wrap',
    }}>
      {/* Columna izquierda — texto */}
      <div style={{ flex: '1 1 320px', maxWidth: '520px' }}>
        {username && (
          <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
            Bienvenido, {username}
          </p>
        )}

        <h1 style={{ fontWeight: 900, fontSize: '42px', lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
          <span style={{ color: 'var(--accent)' }}>REY</span>
          {' '}
          <span style={{ color: 'var(--text-primary)' }}>
            D<span style={{ color: '#FFD700' }}>E</span>L
          </span>
          {' '}
          <span style={{ color: 'var(--accent)' }}>PRODE</span>
        </h1>

        <p style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '28px' }}>
          Copa del Mundo 2026
        </p>

        <p style={{ color: 'var(--text-primary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '32px', maxWidth: '440px' }}>
          Demostrá que sos el verdadero Rey del Prode. Cargá tus pronósticos, armá tu grupo con amigos o compañeros de trabajo, y seguí cada partido de la Copa del Mundo.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/mis-pronos" style={{
            background: 'var(--accent)', color: '#fff', fontWeight: 900,
            fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px',
            padding: '12px 24px', borderRadius: '6px', textDecoration: 'none',
            display: 'inline-block',
          }}>
            Mis Pronósticos
          </Link>
          <Link href="/crear-prode" style={{
            background: 'transparent', color: 'var(--accent)', fontWeight: 700,
            fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px',
            padding: '12px 24px', borderRadius: '6px', textDecoration: 'none',
            border: '2px solid var(--accent)', display: 'inline-block',
          }}>
            Crear Prode
          </Link>
        </div>

        <div style={{ marginTop: '48px', display: 'flex', gap: '32px' }}>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--accent)' }}>48</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Equipos</div>
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--accent)' }}>104</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Partidos</div>
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#FFD700' }}>2026</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Edición</div>
          </div>
        </div>
      </div>

      {/* Columna derecha — copa */}
      <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img
          src="/copa.png"
          alt="Copa del Mundo FIFA"
          style={{
            width: '420px',
            maxWidth: '45vw',
            opacity: 0.82,
            filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.15))',
          }}
        />
      </div>
    </div>
  )
}
