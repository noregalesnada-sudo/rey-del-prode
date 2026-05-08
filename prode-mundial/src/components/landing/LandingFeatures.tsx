const B = '/icons/para%20empresas'
const ICONS = [
  { src: `${B}/whistle-illustration-2-svgrepo-com.svg`,   filter: 'brightness(0) invert(1)' },
  { src: `${B}/colors-svgrepo-com.svg`,                   filter: undefined },
  { src: `${B}/lock-svgrepo-com.svg`,                     filter: 'brightness(0) invert(1)' },
  { src: `${B}/business-sharp-svgrepo-com.svg`,           filter: 'brightness(0) invert(1)' },
  { src: `${B}/flash-thunder-svgrepo-com.svg`,            filter: undefined },
  { src: `${B}/soccer-graphic-svgrepo-com%20(1).svg`,     filter: 'brightness(0) invert(1)' },
]

const FEATURES_ES = [
  { title: 'Panel de administración', desc: 'Creá el prode, cargá empleados y seguí el ranking. Sin IT.' },
  { title: 'Tu marca, tu experiencia', desc: 'Logo, colores y dominio propios. Parece tuyo porque es tuyo.' },
  { title: 'Acceso solo para tu empresa', desc: 'Cargá los mails corporativos. El sistema bloquea el resto.' },
  { title: 'Rankings por área o gerencia', desc: 'Competencia segmentada por equipo o nivel. Rivalidades sanas.' },
  { title: 'Lista en minutos, sin IT', desc: 'Alta en menos de 10 minutos. Sin instalaciones ni tickets.' },
  { title: 'Escalá sin límites', desc: 'De 20 a 5.000 empleados. Sin cambios de plan.' },
]

const FEATURES_EN = [
  { title: 'Full admin panel', desc: 'Create the pool, add employees, track rankings. No IT.' },
  { title: 'Your brand, your experience', desc: 'Custom logo, colors and domain. Looks like yours because it is.' },
  { title: 'Company-only access', desc: 'Add corporate emails. The system blocks everyone else.' },
  { title: 'Rankings by team or department', desc: 'Segmented by team or level. Healthy rivalry, real engagement.' },
  { title: 'Live in minutes, no IT', desc: 'Up in under 10 minutes. No installs, no tech tickets.' },
  { title: 'Unlimited scale', desc: 'From 20 to 5,000 employees. No plan changes needed.' },
]

const STATS_ES = [
  { value: '< 10 min', label: 'para lanzar tu prode' },
  { value: '5.000+', label: 'empleados soportados' },
  { value: '0', label: 'dependencia de IT' },
]

const STATS_EN = [
  { value: '< 10 min', label: 'to launch your pool' },
  { value: '5,000+', label: 'employees supported' },
  { value: '0', label: 'IT dependency' },
]

const TR = {
  es: {
    label: 'PARA EMPRESAS',
    h2a: 'CONECTÁ TU EQUIPO',
    h2em: 'con el mundial',
    h2b: '2026',
    subtitle: 'La plataforma de prode corporativo que convierte el Mundial en team building real — sin IT, sin fricciones.',
  },
  en: {
    label: 'FOR COMPANIES',
    h2a: 'CONNECT YOUR TEAM',
    h2em: 'with the world cup',
    h2b: '2026',
    subtitle: 'The corporate World Cup pool that turns the tournament into real team building — no IT, no friction.',
  },
}

export default function LandingFeatures({ lang = 'es' }: { lang?: string }) {
  const FEATURES = lang === 'en' ? FEATURES_EN : FEATURES_ES
  const STATS = lang === 'en' ? STATS_EN : STATS_ES
  const tr = lang === 'en' ? TR.en : TR.es
  return (
    <>
    <style>{`
      .ld-feature-card {
        transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s ease, background 0.25s ease;
      }
      .ld-feature-card:hover {
        transform: translateY(-4px);
        background: rgba(13,43,85,0.85) !important;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      }
    `}</style>
    <section
      id="features"
      aria-label={lang === 'en' ? 'Corporate World Cup pool features' : 'Funciones del prode corporativo'}
      style={{ padding: '100px clamp(20px, 4vw, 48px)' }}
    >
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
              {tr.h2a}<br />
              <em style={{ fontFamily: 'var(--font-instrument, Georgia, serif)', fontStyle: 'italic', color: '#f5c518' }}>{tr.h2em}</em>
              {tr.h2b && <>{" "}{tr.h2b}</>}
            </h2>
          </div>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, maxWidth: 360 }}>
            {tr.subtitle}
          </p>
        </div>

        {/* Feature grid */}
        <ul
          role="list"
          className="ld-features-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, listStyle: 'none', margin: 0, padding: 0 }}
        >
          {FEATURES.map((f, i) => (
            <li key={i} role="listitem" className="ld-feature-card" style={{ padding: '24px 28px', borderRadius: 16, position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8, lineHeight: 1.3 }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>
                  {f.desc}
                </p>
              </div>
              <div style={{
                width: 56, height: 56, flexShrink: 0,
                background: 'rgba(245,197,24,0.08)',
                border: '1px solid rgba(245,197,24,0.15)',
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ICONS[i].src} alt="" width={34} height={34} style={{ filter: ICONS[i].filter, objectFit: 'contain' }} />
              </div>
            </li>
          ))}
        </ul>

        {/* Stats strip */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 'clamp(32px, 6vw, 80px)',
          marginTop: 56,
          paddingTop: 40,
          borderTop: '1px solid rgba(255,255,255,0.07)',
          flexWrap: 'wrap',
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-bebas, var(--font-barlow))', fontSize: 'clamp(32px, 4vw, 48px)', color: '#f5c518', lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 6, letterSpacing: '0.5px' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    </>
  )
}
