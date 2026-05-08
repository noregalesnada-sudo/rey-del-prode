const B = '/icons/casos%20de%20uso'
const CASE_ICONS = [
  `${B}/males-friends-hug-side-by-side-svgrepo-com.svg`,
  `${B}/business-bag-svgrepo-com.svg`,
  `${B}/soccer-stadium-1-svgrepo-com.svg`,
]

const CASES_ES = [
  {
    emoji: '👨‍👩‍👧‍👦',
    tag: 'AMIGOS',
    title: 'El prode del asado',
    desc: 'Armá el prode familiar, invitá a todos con un link y que gane el mejor pronosticador. Ideal para grupos de hasta 25 personas sin costo.',
    highlight: 'Gratis hasta 25 jugadores',
  },
  {
    emoji: '💼',
    tag: 'EMPRESA',
    title: 'El prode del trabajo',
    desc: 'Generá engagement entre tus empleados durante el Mundial. Panel de administración, branding de la empresa y ranking por área o gerencia.',
    highlight: 'Solución enterprise a medida',
    featured: true,
  },
  {
    emoji: '🏟️',
    tag: 'CLUBES Y PEÑAS',
    title: 'El prode del club',
    desc: 'Organizá el prode de tu peña, club o hinchada. Hasta 50 jugadores en el plan Pro y 150 en el Business, con foto de grupo y banner personalizado"',
    highlight: 'Plan Pro desde $19.999',
  },
]

const CASES_EN = [
  {
    emoji: '👨‍👩‍👧‍👦',
    tag: 'FRIENDS',
    title: 'The family pool',
    desc: 'Set up the family pool, invite everyone with a link and let the best predictor win. Perfect for groups up to 25 people at no cost.',
    highlight: 'Free up to 25 players',
  },
  {
    emoji: '💼',
    tag: 'COMPANY',
    title: 'The office pool',
    desc: 'Generate engagement among your employees during the World Cup. Admin panel, company branding and ranking by department or division.',
    highlight: 'Custom enterprise solution',
    featured: true,
  },
  {
    emoji: '🏟️',
    tag: 'CLUBS & FANS',
    title: 'The fan club pool',
    desc: 'Organize the pool for your fan club or supporters group. Up to 50 players on the Pro plan, with group photo and exclusive badge.',
    highlight: 'Pro plan from $19,999',
  },
]

const TR = {
  es: { label: 'CASOS DE USO', h2: 'PARA CADA', h2em: 'grupo', badge: 'Más solicitado' },
  en: { label: 'USE CASES',    h2: 'FOR EVERY', h2em: 'group',  badge: 'Most requested' },
}

export default function LandingUseCases({ lang = 'es' }: { lang?: string }) {
  const CASES = lang === 'en' ? CASES_EN : CASES_ES
  const tr = lang === 'en' ? TR.en : TR.es
  return (
    <section id="usos" style={{ padding: '100px clamp(20px, 4vw, 48px)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {CASES.map((c, i) => (
            <div key={c.tag} style={{
              padding: '40px 32px',
              borderRadius: 20,
              border: c.featured ? '1px solid rgba(245,197,24,0.35)' : '1px solid rgba(255,255,255,0.07)',
              background: c.featured
                ? 'linear-gradient(135deg, rgba(245,197,24,0.08) 0%, rgba(13,43,85,0.8) 100%)'
                : 'rgba(13,43,85,0.4)',
              position: 'relative',
            }}>
              {c.featured && (
                <div style={{
                  position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
                  background: '#f5c518', color: '#071428',
                  fontSize: 10, fontWeight: 800, letterSpacing: '2px',
                  padding: '4px 16px', borderRadius: '0 0 8px 8px', textTransform: 'uppercase',
                }}>
                  {tr.badge}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={CASE_ICONS[i]} alt="" width={52} height={52} style={{ filter: 'brightness(0) invert(1)', objectFit: 'contain', marginBottom: 10 }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#f5c518', letterSpacing: '2.5px', textTransform: 'uppercase' }}>
                  {c.tag}
                </span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 12, lineHeight: 1.3 }}>
                {c.title}
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 20 }}>
                {c.desc}
              </div>
              <div style={{
                display: 'inline-block',
                background: 'rgba(245,197,24,0.1)',
                border: '1px solid rgba(245,197,24,0.2)',
                borderRadius: 6,
                padding: '5px 12px',
                fontSize: 12, fontWeight: 700, color: '#f5c518',
              }}>
                {c.highlight}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
