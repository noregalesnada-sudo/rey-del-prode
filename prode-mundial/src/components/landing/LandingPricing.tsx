import Link from 'next/link'

const PLANS_ES = [
  {
    name: 'Free',
    price: 'Gratis',
    priceNote: 'para siempre',
    cta: 'Crear prode gratis',
    ctaHref: '/register',
    featured: false,
    features: [
      'Hasta 25 jugadores por prode',
      'Leaderboard con podio',
      'Premios editables',
      'Código y link de invitación',
      'Aprobación manual de miembros',
      'Picks con auto-guardado',
    ],
  },
  {
    name: 'Pro',
    price: '$19.999',
    priceNote: 'pago único · todo el Mundial',
    cta: 'Crear prode Pro',
    ctaHref: '/register',
    featured: true,
    badge: 'Más popular',
    features: [
      'Hasta 50 jugadores por prode',
      'Todo lo del plan Free',
      'Foto o banner del prode',
      'Insignia "Pro" en el prode',
    ],
  },
  {
    name: 'Business',
    price: '$199.999',
    priceNote: 'pago único · todo el Mundial',
    cta: 'Crear prode Business',
    ctaHref: '/register',
    featured: false,
    features: [
      'Hasta 150 jugadores por prode',
      'Todo lo del plan Pro',
      'Logo de empresa personalizado',
      'Insignia "Business" en el prode',
      'Soporte prioritario',
    ],
  },
  {
    name: 'Enterprise',
    price: 'A medida',
    priceNote: 'pago único · precio según empresa',
    cta: 'Solicitar información',
    ctaHref: '#empresas',
    featured: false,
    enterprise: true,
    features: [
      'Jugadores ilimitados',
      'Panel de administración',
      'Branding 100% personalizado',
      'Ranking por gerencia o área',
      'Control total de acceso (whitelist)',
      'Soporte técnico prioritario',
    ],
  },
]

const PLANS_EN = [
  {
    name: 'Free',
    price: 'Free',
    priceNote: 'forever',
    cta: 'Create free pool',
    ctaHref: '/register',
    featured: false,
    features: [
      'Up to 25 players per pool',
      'Leaderboard with podium',
      'Editable prizes',
      'Invitation code & link',
      'Manual member approval',
      'Picks with auto-save',
    ],
  },
  {
    name: 'Pro',
    price: '$19,999',
    priceNote: 'one-time · full World Cup',
    cta: 'Create Pro pool',
    ctaHref: '/register',
    featured: true,
    badge: 'Most popular',
    features: [
      'Up to 50 players per pool',
      'Everything in Free',
      'Pool photo or banner',
      '"Pro" badge on the pool',
      'WhatsApp support',
    ],
  },
  {
    name: 'Business',
    price: '$199,999',
    priceNote: 'one-time · full World Cup',
    cta: 'Create Business pool',
    ctaHref: '/register',
    featured: false,
    features: [
      'Up to 150 players per pool',
      'Everything in Pro',
      'Custom company logo',
      '"Business" badge on the pool',
      'Priority support',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    priceNote: 'one-time · price by company',
    cta: 'Request information',
    ctaHref: '#empresas',
    featured: false,
    enterprise: true,
    features: [
      'Unlimited players',
      'Admin panel',
      '100% custom branding',
      'Ranking by department or division',
      'Full access control (whitelist)',
      'Priority technical support',
    ],
  },
]

const TR = {
  es: {
    label: 'PRECIOS',
    h2a: 'UN PAGO.', h2em: 'todo', h2b: 'EL MUNDIAL.',
    subtitle: 'Sin suscripciones. Pagás una vez y jugás todo el torneo.',
    disclaimer: 'Los pagos se procesan de forma segura a través de MercadoPago. Pago único por torneo, sin renovación automática.',
  },
  en: {
    label: 'PRICING',
    h2a: 'ONE PAYMENT.', h2em: 'all', h2b: 'THE WORLD CUP.',
    subtitle: 'No subscriptions. Pay once and play the entire tournament.',
    disclaimer: 'Payments processed securely through MercadoPago. One-time payment per tournament, no automatic renewal.',
  },
}

const CHECK = '✓'

export default function LandingPricing({ lang }: { lang: string }) {
  const lp = (p: string) => `/${lang}${p}`
  const PLANS = lang === 'en' ? PLANS_EN : PLANS_ES
  const tr = lang === 'en' ? TR.en : TR.es

  return (
    <>
    <style>{`
      .ld-pricing-card {
        transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s ease, border-color 0.25s ease;
      }
      .ld-pricing-card:hover {
        transform: translateY(-6px);
        box-shadow: 0 12px 40px rgba(0,0,0,0.35);
      }
      .ld-pricing-card-featured {
        transform: translateY(-8px);
        box-shadow: 0 0 60px rgba(245,197,24,0.12);
      }
      .ld-pricing-card-featured:hover {
        transform: translateY(-14px);
        box-shadow: 0 20px 70px rgba(245,197,24,0.28) !important;
      }
      .ld-pricing-btn {
        transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
      }
      .ld-pricing-btn:hover {
        transform: translateY(-2px);
        background: rgba(255,255,255,0.16) !important;
        box-shadow: 0 6px 20px rgba(0,0,0,0.25);
      }
      .ld-pricing-btn:active { transform: scale(0.97); }
      .ld-pricing-btn-featured {
        transition: transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease;
      }
      .ld-pricing-btn-featured:hover {
        transform: translateY(-3px) scale(1.02);
        box-shadow: 0 8px 32px rgba(245,197,24,0.6) !important;
      }
      .ld-pricing-btn-featured:active { transform: scale(0.97); }
      .ld-pricing-btn-enterprise {
        transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
      }
      .ld-pricing-btn-enterprise:hover {
        transform: translateY(-2px);
        background: rgba(245,197,24,0.15) !important;
        border-color: rgba(245,197,24,0.7) !important;
      }
      .ld-pricing-btn-enterprise:active { transform: scale(0.97); }
    `}</style>
    <section id="precios" style={{ padding: '100px clamp(20px, 4vw, 48px)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ height: 1, width: 32, background: '#f5c518' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#f5c518', letterSpacing: '3px', textTransform: 'uppercase' }}>{tr.label}</span>
            <div style={{ height: 1, width: 32, background: '#f5c518' }} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-bebas, var(--font-barlow))',
            fontSize: 'clamp(40px, 5vw, 64px)',
            lineHeight: 0.95, color: '#fff', letterSpacing: '1px',
          }}>
            {tr.h2a}{' '}
            <em style={{ fontFamily: 'var(--font-instrument, Georgia, serif)', fontStyle: 'italic', color: '#f5c518' }}>{tr.h2em}</em>
            {' '}{tr.h2b}
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', marginTop: 16 }}>
            {tr.subtitle}
          </p>
        </div>

        {/* Cards */}
        <div className="ld-pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {PLANS.map(plan => (
            <div key={plan.name}
              className={plan.featured ? 'ld-pricing-card ld-pricing-card-featured' : 'ld-pricing-card'}
              style={{
              borderRadius: 20, padding: '36px 28px',
              position: 'relative',
              border: plan.featured
                ? '2px solid #f5c518'
                : plan.enterprise
                  ? '1px solid rgba(245,197,24,0.3)'
                  : '1px solid rgba(255,255,255,0.08)',
              background: plan.featured
                ? 'rgba(245,197,24,0.06)'
                : plan.enterprise
                  ? 'linear-gradient(135deg, rgba(245,197,24,0.04) 0%, rgba(13,43,85,0.8) 100%)'
                  : 'rgba(13,43,85,0.5)',
            }}>
              {plan.badge && (
                <div style={{
                  position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
                  background: '#f5c518', color: '#071428',
                  fontSize: 10, fontWeight: 800, letterSpacing: '2px',
                  padding: '5px 18px', borderRadius: '0 0 10px 10px', textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}>
                  {plan.badge}
                </div>
              )}

              <div style={{
                fontFamily: 'var(--font-bebas, var(--font-barlow))',
                fontSize: 20, letterSpacing: '2px', color: plan.featured ? '#f5c518' : 'rgba(255,255,255,0.6)',
                marginBottom: 16,
              }}>
                {plan.name}
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{
                  fontFamily: 'var(--font-bebas, var(--font-barlow))',
                  fontSize: plan.enterprise ? 28 : 'clamp(28px, 3vw, 40px)',
                  color: '#fff', lineHeight: 1,
                }}>
                  {plan.price}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                  {plan.priceNote}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: '#f5c518', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{CHECK}</span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>

              {plan.enterprise ? (
                <a href={plan.ctaHref} className="ld-pricing-btn-enterprise" style={{
                  display: 'block', textAlign: 'center',
                  padding: '12px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                  color: '#f5c518', textDecoration: 'none',
                  border: '2px solid rgba(245,197,24,0.4)',
                  background: 'rgba(245,197,24,0.08)',
                  letterSpacing: '0.5px',
                }}>
                  {plan.cta}
                </a>
              ) : (
                <Link href={lp(plan.ctaHref)}
                  className={plan.featured ? 'ld-pricing-btn-featured' : 'ld-pricing-btn'}
                  style={{
                  display: 'block', textAlign: 'center',
                  padding: '12px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                  color: plan.featured ? '#071428' : '#fff', textDecoration: 'none',
                  background: plan.featured ? '#f5c518' : 'rgba(255,255,255,0.08)',
                  border: plan.featured ? 'none' : '1px solid rgba(255,255,255,0.15)',
                  letterSpacing: '0.3px',
                }}>
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 32 }}>
          {tr.disclaimer}
        </p>
      </div>
    </section>
    </>
  )
}
