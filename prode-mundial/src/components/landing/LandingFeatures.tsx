const FEATURES_ES = [
  { n: '01', icon: '🏢', title: 'Panel de administración completo', desc: 'Creá el prode, cargá empleados, gestioná accesos y seguí el ranking en tiempo real desde un panel dedicado — sin depender de IT.' },
  { n: '02', icon: '🎨', title: 'Tu marca, tu experiencia', desc: 'Logo, colores y dominio propios. Los empleados entran a algo que parece tuyo, no una herramienta genérica de terceros.' },
  { n: '03', icon: '🔒', title: 'Control de acceso por whitelist', desc: 'Solo entra quien vos decidís. Cargá los mails corporativos y el sistema bloquea cualquier acceso no autorizado automáticamente.' },
  { n: '04', icon: '📊', title: 'Rankings por área o gerencia', desc: 'Segmentá la competencia por equipo, área o nivel. Cada sector ve su propio ranking y el general, generando rivalidades sanas.' },
  { n: '05', icon: '⚡', title: 'Listo en minutos, sin IT', desc: 'Onboarding en menos de 10 minutos. Sin instalaciones, sin integraciones, sin tickets al equipo técnico.' },
  { n: '06', icon: '📈', title: 'Escala con tu empresa', desc: 'De 20 a 5.000 empleados sin cambios de plan ni configuración extra. La plataforma crece con vos.' },
]

const FEATURES_EN = [
  { n: '01', icon: '🏢', title: 'Full admin panel', desc: 'Create the pool, add employees, manage access and track rankings in real time from a dedicated panel — no IT required.' },
  { n: '02', icon: '🎨', title: 'Your brand, your experience', desc: 'Custom logo, colors and domain. Employees land on something that feels like yours, not a generic third-party tool.' },
  { n: '03', icon: '🔒', title: 'Whitelist access control', desc: 'Only who you decide gets in. Load corporate emails and the system automatically blocks any unauthorized access.' },
  { n: '04', icon: '📊', title: 'Rankings by team or department', desc: 'Segment the competition by team, area or level. Each group sees its own ranking and the overall one, building healthy rivalry.' },
  { n: '05', icon: '⚡', title: 'Live in minutes, no IT needed', desc: 'Onboarding in under 10 minutes. No installs, no integrations, no tickets to your tech team.' },
  { n: '06', icon: '📈', title: 'Scales with your company', desc: 'From 20 to 5,000 employees with no plan changes or extra setup. The platform grows with you.' },
]

const TR = {
  es: {
    label: 'PARA EMPRESAS',
    h2a: 'LA FORMA MÁS SIMPLE DE',
    h2em: 'conectar',
    h2b: 'A TU EQUIPO',
    subtitle: 'Una herramienta lista para usar que convierte el Mundial en una experiencia de team building real — sin fricción, sin IT, sin complicaciones.',
    cardLabel: 'FUNCIÓN',
  },
  en: {
    label: 'FOR COMPANIES',
    h2a: 'THE EASIEST WAY TO',
    h2em: 'connect',
    h2b: 'YOUR TEAM',
    subtitle: 'A ready-to-use tool that turns the World Cup into a real team building experience — no friction, no IT, no complications.',
    cardLabel: 'FEATURE',
  },
}

export default function LandingFeatures({ lang = 'es' }: { lang?: string }) {
  const FEATURES = lang === 'en' ? FEATURES_EN : FEATURES_ES
  const tr = lang === 'en' ? TR.en : TR.es
  return (
    <section id="features" style={{ padding: '100px clamp(20px, 4vw, 48px)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 56, flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ height: 1, width: 32, background: '#f5c518' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#f5c518', letterSpacing: '3px', textTransform: 'uppercase' }}>
                {tr.label}
              </span>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-bebas, var(--font-barlow))',
              fontSize: 'clamp(40px, 5vw, 64px)',
              lineHeight: 0.95, color: '#fff', letterSpacing: '1px',
            }}>
              {tr.h2a}{' '}
              <em style={{ fontFamily: 'var(--font-instrument, Georgia, serif)', fontStyle: 'italic', color: '#f5c518' }}>{tr.h2em}</em>
              <br />{tr.h2b}
            </h2>
          </div>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, maxWidth: 380 }}>
            {tr.subtitle}
          </p>
        </div>

        {/* Grid */}
        <div className="ld-features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          {FEATURES.map(f => (
            <div key={f.n} className="ld-feature-card" style={{
              padding: '36px 32px',
              borderRadius: 16,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(245,197,24,0.4)', letterSpacing: '2px', marginBottom: 20, fontFamily: 'var(--font-bebas, var(--font-barlow))' }}>
                {f.n} / {tr.cardLabel}
              </div>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 10, lineHeight: 1.3 }}>
                {f.title}
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
