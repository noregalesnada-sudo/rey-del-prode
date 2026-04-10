import type { Metadata } from 'next'
import Link from 'next/link'
import { Check } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Prode del Mundial 2026 — Gratis para tu empresa o grupo de amigos',
  description: 'Creá el prode del Mundial 2026 para tu empresa, trabajo o amigos. Gratis hasta 25 jugadores. Pronósticos, ranking en tiempo real y premios personalizados.',
  robots: { index: false, follow: false },
}

const benefits = [
  { icon: '⚽', title: 'Todos los partidos', desc: '104 partidos de la Copa del Mundo 2026. Pronosticá cada uno antes de que empiece.' },
  { icon: '🏆', title: 'Ranking en tiempo real', desc: 'Leaderboard con podio actualizado automáticamente con cada resultado.' },
  { icon: '👥', title: 'Grupos privados', desc: 'Creá tu prode para amigos, familia o tu empresa. Cada grupo tiene su ranking propio.' },
  { icon: '🎁', title: 'Premios personalizados', desc: 'El admin define los premios para los primeros puestos del grupo.' },
]

const plans = [
  {
    name: 'Free',
    price: 'Gratis',
    priceNote: 'para siempre',
    highlight: false,
    features: ['Hasta 25 jugadores', 'Todos los partidos', 'Ranking y leaderboard', 'Premios personalizados', 'Link de invitación'],
    cta: 'Empezar gratis',
    href: '/register',
  },
  {
    name: 'Pro',
    price: '$19.999',
    priceNote: 'ARS · pago único',
    highlight: true,
    features: ['Hasta 50 jugadores', 'Todo lo del plan Free', 'Banner personalizado', 'Aprobación de miembros'],
    cta: 'Elegir Pro',
    href: '/register',
  },
  {
    name: 'Business',
    price: '$199.999',
    priceNote: 'ARS · pago único',
    highlight: false,
    features: ['Hasta 300 jugadores', 'Todo lo del plan Pro', 'Ideal para empresas', 'Soporte prioritario'],
    cta: 'Elegir Business',
    href: '/register',
  },
]

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'Roboto, Arial, sans-serif' }}>

      {/* Estadio fondo */}
      <img src="/estadio.jpg" alt="" aria-hidden="true" style={{
        position: 'fixed', inset: 0, width: '100%', height: '100%',
        objectFit: 'cover', objectPosition: 'center 40%',
        opacity: 0.07, filter: 'blur(3px) saturate(0.6)', zIndex: 0, pointerEvents: 'none',
      }} />

      {/* NAV mínima */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(7, 20, 40, 0.95)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px', height: '52px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/escudo.png" alt="Rey del Prode" style={{ height: '36px' }} />
          <span style={{ fontWeight: 900, fontSize: '15px', letterSpacing: '1px', textTransform: 'uppercase' }}>Rey del Prode</span>
        </div>
        <Link href="/register" style={{
          background: 'var(--accent)', color: '#fff',
          padding: '7px 18px', borderRadius: '4px',
          fontWeight: 700, fontSize: '13px', textDecoration: 'none',
          textTransform: 'uppercase', letterSpacing: '0.5px',
        }}>
          Empezar gratis
        </Link>
      </nav>

      {/* HERO */}
      <section style={{
        position: 'relative', zIndex: 1,
        padding: '80px 24px 64px',
        textAlign: 'center',
        maxWidth: '780px', margin: '0 auto',
      }}>
        <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>
          Copa del Mundo 2026 · 48 equipos · 104 partidos
        </p>
        <h1 style={{ fontWeight: 900, fontSize: 'clamp(36px, 6vw, 64px)', lineHeight: 1.05, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '24px' }}>
          El prode del{' '}
          <span style={{ color: 'var(--accent)' }}>Mundial 2026</span>
          {' '}para tu grupo
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '40px', maxWidth: '560px', margin: '0 auto 40px' }}>
          Pronosticá los partidos, competí con amigos, familia o tu empresa y seguí el ranking en tiempo real. <strong style={{ color: 'var(--text-primary)' }}>Gratis hasta 25 jugadores.</strong>
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register" style={{
            background: 'var(--accent)', color: '#fff',
            padding: '16px 36px', borderRadius: '6px',
            fontWeight: 900, fontSize: '16px', textDecoration: 'none',
            textTransform: 'uppercase', letterSpacing: '1px',
            boxShadow: '0 4px 24px rgba(116,172,223,0.3)',
          }}>
            Crear mi prode gratis
          </Link>
          <Link href="/login" style={{
            background: 'transparent', color: 'var(--accent)',
            padding: '16px 36px', borderRadius: '6px',
            fontWeight: 700, fontSize: '16px', textDecoration: 'none',
            textTransform: 'uppercase', letterSpacing: '1px',
            border: '2px solid var(--accent)',
          }}>
            Ya tengo cuenta
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '48px', justifyContent: 'center', marginTop: '56px', flexWrap: 'wrap' }}>
          {[
            { n: '48', label: 'Equipos' },
            { n: '104', label: 'Partidos' },
            { n: '∞', label: 'Jugadores' },
            { n: '100%', label: 'Gratis para empezar' },
          ].map(({ n, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#FFD700' }}>{n}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* BENEFICIOS */}
      <section style={{ position: 'relative', zIndex: 1, padding: '64px 24px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '22px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '40px' }}>
          Todo lo que necesitás para el Mundial
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {benefits.map((b) => (
            <div key={b.title} style={{
              background: 'rgba(13, 43, 85, 0.8)', border: '1px solid rgba(116,172,223,0.15)',
              borderRadius: '10px', padding: '28px 24px',
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{b.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{b.title}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{b.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PLANES */}
      <section style={{ position: 'relative', zIndex: 1, padding: '64px 24px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '22px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
          Elegí tu plan
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '40px' }}>
          Pago único por el torneo. Sin suscripción.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {plans.map((p) => (
            <div key={p.name} style={{
              background: p.highlight ? 'rgba(116,172,223,0.12)' : 'rgba(13, 43, 85, 0.8)',
              border: `2px solid ${p.highlight ? 'var(--accent)' : 'rgba(116,172,223,0.15)'}`,
              borderRadius: '12px', padding: '32px 28px',
              position: 'relative',
            }}>
              {p.highlight && (
                <div style={{
                  position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--accent)', color: '#fff',
                  padding: '3px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap',
                }}>
                  Más popular
                </div>
              )}
              <div style={{ fontWeight: 900, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{p.name}</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: p.highlight ? 'var(--accent)' : '#FFD700', marginBottom: '4px' }}>{p.price}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px' }}>{p.priceNote}</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                {p.features.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    <Check size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={p.href} style={{
                display: 'block', textAlign: 'center',
                background: p.highlight ? 'var(--accent)' : 'transparent',
                color: p.highlight ? '#fff' : 'var(--accent)',
                border: `2px solid var(--accent)`,
                padding: '11px', borderRadius: '6px',
                fontWeight: 700, fontSize: '14px', textDecoration: 'none',
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{
        position: 'relative', zIndex: 1,
        padding: '64px 24px 80px', textAlign: 'center',
        borderTop: '1px solid rgba(116,172,223,0.1)',
      }}>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
          El Mundial arranca el <span style={{ color: 'var(--accent)' }}>11 de junio</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginBottom: '36px' }}>
          Creá tu prode ahora y tenés tiempo de cargar todos tus pronósticos antes del primer partido.
        </p>
        <Link href="/register" style={{
          background: 'var(--accent)', color: '#fff',
          padding: '18px 48px', borderRadius: '6px',
          fontWeight: 900, fontSize: '17px', textDecoration: 'none',
          textTransform: 'uppercase', letterSpacing: '1px',
          boxShadow: '0 4px 32px rgba(116,172,223,0.35)',
          display: 'inline-block',
        }}>
          Crear mi prode gratis
        </Link>
      </section>

      {/* FOOTER mínimo */}
      <footer style={{
        position: 'relative', zIndex: 1,
        borderTop: '1px solid rgba(116,172,223,0.08)',
        padding: '20px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
      }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>© 2026 Rey del Prode</span>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link href="/privacidad" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>Privacidad</Link>
          <Link href="/terminos" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>Términos</Link>
          <Link href="/contacto" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>Contacto</Link>
        </div>
      </footer>

    </div>
  )
}
