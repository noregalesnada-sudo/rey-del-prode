const FEATURES_ES = [
  { n: '01', icon: '⚡', title: 'Pronósticos en tiempo real', desc: 'Cargá tus picks antes de cada partido. El ranking se actualiza al instante con los resultados oficiales.' },
  { n: '02', icon: '👥', title: 'Prodes privados', desc: 'Creá tu grupo, invitá amigos o compañeros con un link único y competí entre ustedes sin ruido externo.' },
  { n: '03', icon: '🎯', title: 'Sistema de puntos justo', desc: 'Puntos por resultado exacto, por ganador y por instancia. Multiplicadores en fases finales y desempate automático.' },
  { n: '04', icon: '📊', title: 'Estadísticas detalladas', desc: 'Ranking completo, posición global, aciertos históricos y comparación con las predicciones más populares del torneo.' },
  { n: '05', icon: '🏆', title: 'Campeón del torneo', desc: 'Apostá quién va a levantar la Copa. El pick del campeón suma puntos extra al final del torneo.' },
  { n: '06', icon: '🏢', title: 'Modo empresa', desc: 'Panel de administración, branding personalizado, control de acceso por whitelist y ranking por área o gerencia.' },
]

const FEATURES_EN = [
  { n: '01', icon: '⚡', title: 'Real-time predictions', desc: 'Submit your picks before each match. The ranking updates instantly with official results.' },
  { n: '02', icon: '👥', title: 'Private pools', desc: 'Create your group, invite friends or colleagues with a unique link and compete among yourselves.' },
  { n: '03', icon: '🎯', title: 'Fair scoring system', desc: 'Points for exact score, winner, and match stage. Multipliers in knockout rounds and automatic tiebreaking.' },
  { n: '04', icon: '📊', title: 'Detailed statistics', desc: 'Full ranking, global position, historical accuracy and comparison with the most popular tournament predictions.' },
  { n: '05', icon: '🏆', title: 'Tournament champion', desc: 'Bet on who will lift the Cup. The champion pick earns bonus points at the end of the tournament.' },
  { n: '06', icon: '🏢', title: 'Enterprise mode', desc: 'Admin panel, custom branding, whitelist access control and ranking by department or division.' },
]

const TR = {
  es: {
    label: 'FUNCIONES',
    h2a: 'TODO LO QUE',
    h2em: 'necesitás',
    h2b: 'PARA VIVIR EL MUNDIAL',
    subtitle: 'Una plataforma diseñada para que jugar al prode sea simple, justo y entretenido — desde el primer partido hasta la final.',
    cardLabel: 'FUNCIÓN',
  },
  en: {
    label: 'FEATURES',
    h2a: 'EVERYTHING YOU',
    h2em: 'need',
    h2b: 'TO LIVE THE WORLD CUP',
    subtitle: 'A platform designed to make playing the pool simple, fair and entertaining — from the first match to the final.',
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
