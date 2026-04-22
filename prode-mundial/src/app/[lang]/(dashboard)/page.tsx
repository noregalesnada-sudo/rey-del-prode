// v2026.04.15
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { connection } from 'next/server'
import Link from 'next/link'
import WorldCupCountdown from '@/components/home/WorldCupCountdown'
import { getDictionary, hasLocale } from '@/app/[lang]/dictionaries'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Rey del Prode | Prode del Mundial 2026 — Pronósticos Copa del Mundo',
  description: 'El mejor prode online para el Mundial 2026. Pronosticá los partidos de la Copa del Mundo, armá tu prode privado con amigos, familia o tu empresa y competí en el ranking. Gratis.',
  alternates: { canonical: 'https://www.reydelprode.com' },
}

export default async function WelcomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const t = await getDictionary(lang)
  const lp = (path: string) => `/${lang}${path}`

  await connection()
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

  const steps = t.home.steps.map((s, i) => ({ num: String(i + 1).padStart(2, '0'), ...s }))
  const faqs = t.home.faqs

  const jsonLdApp = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Rey del Prode',
    url: 'https://www.reydelprode.com',
    description: 'El mejor prode online para el Mundial 2026.',
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web',
    inLanguage: lang === 'es' ? 'es-AR' : 'en',
    offers: [
      { '@type': 'Offer', name: 'Plan Free',     price: '0',      priceCurrency: 'ARS', description: 'Hasta 25 jugadores' },
      { '@type': 'Offer', name: 'Plan Pro',      price: '19999',  priceCurrency: 'ARS', description: 'Hasta 50 jugadores' },
      { '@type': 'Offer', name: 'Plan Business', price: '199999', priceCurrency: 'ARS', description: 'Hasta 150 jugadores' },
    ],
  }

  const jsonLdFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }

  const jsonLdHowTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: lang === 'es' ? 'Cómo hacer el prode del Mundial 2026' : 'How to join the World Cup 2026 prediction pool',
    step: steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.title,
      text: s.desc,
    })),
  }

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdApp) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdHowTo) }} />

      {/* ── HERO ── */}
      <div style={{
        position: 'relative',
        minHeight: 'calc(100vh - 44px)',
        display: 'flex',
        alignItems: 'center',
        padding: '36px 24px',
        overflow: 'hidden',
        margin: '-24px -24px 0 -24px',
      }}>
        <div style={{ flex: '1 1 320px', maxWidth: '560px', position: 'relative', zIndex: 1, paddingLeft: '4%' }}>
          {username && (
            <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '15px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
              {t.home.welcome.replace('{name}', username)}
            </p>
          )}

          <h1 style={{ fontFamily: 'var(--font-barlow), "Barlow Condensed", Arial, sans-serif', fontWeight: 900, fontSize: '72px', lineHeight: 1.0, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '10px' }}>
            <span style={{ color: 'var(--accent)' }}>REY</span>
            {' '}
            <span style={{ color: 'var(--text-primary)' }}>
              D<span style={{ color: '#FFD700' }}>E</span>L
            </span>
            {' '}
            <span style={{ color: 'var(--accent)' }}>PRODE</span>
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '32px' }}>
            {t.home.subtitle}
          </p>

          <p style={{ color: 'var(--text-primary)', fontSize: '17px', lineHeight: 1.7, marginBottom: '36px', maxWidth: '480px' }}>
            {t.home.description}
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link href={lp('/mis-pronos')} style={{
              background: 'var(--accent)', color: '#fff', fontWeight: 900,
              fontSize: '15px', textTransform: 'uppercase', letterSpacing: '1px',
              padding: '14px 28px', borderRadius: '6px', textDecoration: 'none',
              display: 'inline-block',
            }}>
              {t.home.myPredictions}
            </Link>
            <Link href={lp('/crear-prode')} style={{
              background: 'transparent', color: 'var(--accent)', fontWeight: 700,
              fontSize: '15px', textTransform: 'uppercase', letterSpacing: '1px',
              padding: '14px 28px', borderRadius: '6px', textDecoration: 'none',
              border: '2px solid var(--accent)', display: 'inline-block',
            }}>
              {t.home.createGroup}
            </Link>
          </div>

          <div style={{ marginTop: '52px', display: 'flex', gap: '40px' }}>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 900, color: 'var(--accent)' }}>48</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.home.teams}</div>
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 900, color: '#FFD700' }}>104</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.home.matches}</div>
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 900, color: 'var(--accent)' }}>2026</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.home.edition}</div>
            </div>
          </div>
        </div>

        <div className="countdown-wrapper" style={{
          flex: '1 1 300px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}>
          <WorldCupCountdown />
        </div>

        <img
          src="/estadio.jpg"
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center 40%',
            opacity: 0.09, filter: 'blur(3px) saturate(0.6)',
            zIndex: 0, transform: 'scale(1.003)',
          }}
        />
        <img
          src="/copa.png"
          alt="Copa del Mundo FIFA"
          className="welcome-trophy"
          style={{
            position: 'absolute', right: '-5%', bottom: '-4%',
            height: '115%', width: 'auto',
            opacity: 0.28, zIndex: 0,
          }}
        />
      </div>

      {/* ── CÓMO FUNCIONA ── */}
      <section style={{ padding: '64px 0 48px' }}>
        <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
          {t.home.howItWorks.label}
        </p>
        <h2 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '40px' }}>
          {t.home.howItWorks.title}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px' }}>
          {steps.map((step) => (
            <div key={step.num} style={{
              background: 'var(--card-bg, #0d2545)',
              border: '1px solid rgba(116,172,223,0.12)',
              borderRadius: '8px', padding: '24px',
            }}>
              <div style={{ fontSize: '32px', fontWeight: 900, color: 'rgba(116,172,223,0.18)', lineHeight: 1, marginBottom: '16px' }}>
                {step.num}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                {step.title}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {step.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '48px 0 64px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '780px' }}>
          <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
            {t.home.faq.label}
          </p>
          <h2 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '28px' }}>
            {t.home.faq.title}
          </h2>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '8px 32px' }}>
            {faqs.map((item, i) => (
              <div key={i} style={{
                borderBottom: i < faqs.length - 1 ? '1px solid rgba(116,172,223,0.1)' : 'none',
                padding: '22px 0',
              }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{item.q}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid rgba(116,172,223,0.12)',
        padding: '24px 0 8px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
      }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>© 2026 Rey del Prode — Copa del Mundo</span>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link href={lp('/privacidad')} style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>{t.home.footer.privacy}</Link>
          <Link href={lp('/terminos')} style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>{t.home.footer.terms}</Link>
          <Link href={lp('/contacto')} style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>{t.home.footer.contact}</Link>
        </div>
      </footer>
    </div>
  )
}
