import Link from 'next/link'

const STEPS_ES = [
  { n: '01', time: '2 min',   title: 'Creá tu cuenta gratis',    desc: 'Registrate con tu email. Sin tarjeta, sin datos de pago. Tu prode ya espera.' },
  { n: '02', time: '1 min',   title: 'Creá o uní a un prode',    desc: 'Creá un grupo privado e invitá a quien quieras con un link. O uní a uno que ya existe.' },
  { n: '03', time: '5 min',   title: 'Cargá tus pronósticos',    desc: 'Pronosticá los 104 partidos antes de que empiecen y elegí a tu campeón del torneo.' },
  { n: '04', time: 'Siempre', title: 'Seguí el ranking en vivo', desc: 'Cada partido que termina actualiza el ranking automáticamente. Vive cada gol al máximo.' },
]

const STEPS_EN = [
  { n: '01', time: '2 min',  title: 'Create your free account',   desc: 'Sign up with your email. No card, no payment info. Your pool is ready.' },
  { n: '02', time: '1 min',  title: 'Create or join a pool',      desc: 'Create a private group and invite whoever you want with a link. Or join an existing one.' },
  { n: '03', time: '5 min',  title: 'Submit your predictions',    desc: 'Predict all 104 matches before they start and choose your tournament champion.' },
  { n: '04', time: 'Always', title: 'Follow the live ranking',    desc: 'Every finished match updates the ranking automatically. Live every goal to the fullest.' },
]

const TR = {
  es: { label: 'CÓMO FUNCIONA', h2: 'EMPEZÁ EN', h2em: 'minutos', cta: 'Crear mi prode gratis →' },
  en: { label: 'HOW IT WORKS',  h2: 'GET STARTED IN', h2em: 'minutes', cta: 'Create my free pool →' },
}

export default function LandingHowItWorks({ lang }: { lang: string }) {
  const lp = (p: string) => `/${lang}${p}`
  const STEPS = lang === 'en' ? STEPS_EN : STEPS_ES
  const tr = lang === 'en' ? TR.en : TR.es

  return (
    <section id="how" style={{
      padding: '100px clamp(20px, 4vw, 48px)',
      background: 'rgba(13, 43, 85, 0.6)',
      borderTop: '1px solid rgba(245,197,24,0.08)',
      borderBottom: '1px solid rgba(245,197,24,0.08)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ height: 1, width: 32, background: '#f5c518' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#f5c518', letterSpacing: '3px', textTransform: 'uppercase' }}>
              {tr.label}
            </span>
            <div style={{ height: 1, width: 32, background: '#f5c518' }} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-bebas, var(--font-barlow))',
            fontSize: 'clamp(40px, 5vw, 64px)',
            lineHeight: 0.95, color: '#fff', letterSpacing: '1px',
          }}>
            {tr.h2}{' '}
            <em style={{ fontFamily: 'var(--font-instrument, Georgia, serif)', fontStyle: 'italic', color: '#f5c518' }}>{tr.h2em}</em>
          </h2>
        </div>

        {/* Steps */}
        <div className="ld-how-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, position: 'relative' }}>
          {/* Línea conectora dorada */}
          <div style={{
            position: 'absolute', top: 28, left: '12.5%', right: '12.5%', height: 1,
            background: 'linear-gradient(90deg, rgba(245,197,24,0.1), rgba(245,197,24,0.4), rgba(245,197,24,0.1))',
            pointerEvents: 'none',
          }} />

          {STEPS.map(s => (
            <div key={s.n} style={{ textAlign: 'center', position: 'relative' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'linear-gradient(135deg, #f5c518, #c9a010)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
                fontFamily: 'var(--font-bebas, var(--font-barlow))',
                fontSize: 22, color: '#071428', letterSpacing: '1px',
                boxShadow: '0 0 24px rgba(245,197,24,0.35)',
                position: 'relative', zIndex: 1,
              }}>
                {s.n}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(245,197,24,0.6)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>
                {s.time}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 10, lineHeight: 1.3 }}>
                {s.title}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>
                {s.desc}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 56 }}>
          <Link href={lp('/register')} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 32px', borderRadius: 8, fontSize: 15, fontWeight: 700,
            color: '#071428', background: '#f5c518', textDecoration: 'none',
            boxShadow: '0 4px 24px rgba(245,197,24,0.35)',
          }}>
            {tr.cta}
          </Link>
        </div>
      </div>
    </section>
  )
}
