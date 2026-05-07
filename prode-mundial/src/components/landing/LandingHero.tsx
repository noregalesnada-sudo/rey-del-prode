import Image from 'next/image'
import LandingCountdown from './LandingCountdown'

const TR = {
  es: {
    eyebrow: 'Prode del Mundial 2026',
    desc: 'Pronosticá los 104 partidos del Mundial, armá tu prode privado con amigos, familia o tu empresa y seguí el ranking en tiempo real.',
    cta1: '⚽ Crear mi prode gratis',
    cta2: '🏢 Para empresas',
    cta3: 'Ver precios →',
    badges: [
      { n: '100%', label: 'Gratis para empezar' },
      { n: '48',   label: 'Selecciones' },
      { n: '104',  label: 'Partidos' },
      { n: '∞',    label: 'Amigos y compañeros' },
    ],
    cardPos: 'Tu posición',
    cardPlayers: 'de 24 jugadores',
    cardLive: 'En vivo',
    cardQF: 'Cuartos de final',
    cardPoints: 'Puntos',
    countdownLabel: 'El Mundial arranca en',
    countdownDate: '11 Jun 2026 · Ciudad de México',
  },
  en: {
    eyebrow: 'World Cup 2026 Pool',
    desc: 'Predict all 104 World Cup matches, create your private pool with friends, family or your company and follow the ranking in real time.',
    cta1: '⚽ Create my free pool',
    cta2: '🏢 For companies',
    cta3: 'See pricing →',
    badges: [
      { n: '100%', label: 'Free to start' },
      { n: '48',   label: 'Nations' },
      { n: '104',  label: 'Matches' },
      { n: '∞',    label: 'Friends & teammates' },
    ],
    cardPos: 'Your position',
    cardPlayers: 'of 24 players',
    cardLive: 'Live',
    cardQF: 'Quarter finals',
    cardPoints: 'Points',
    countdownLabel: 'The World Cup starts in',
    countdownDate: 'Jun 11, 2026 · Mexico City',
  },
}

export default function LandingHero({ lang, loggedIn }: { lang: string; loggedIn?: boolean }) {
  const lp = (p: string) => `/${lang}${p}`
  const tr = lang === 'en' ? TR.en : TR.es
  const cta1Href = loggedIn ? lp('/crear-prode') : lp('/register')

  return (
    <section id="hero" style={{
      position: 'relative',
      minHeight: '100svh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '104px clamp(32px, 5vw, 72px) 0',
      overflow: 'hidden',
    }}>
      {/* Bg: estadio + overlays */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Image src="/estadio.jpg" alt="" fill priority aria-hidden
          style={{ objectFit: 'cover', opacity: 0.12, filter: 'blur(1px)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 25% 15%, rgba(245,197,24,0.07) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 70% at 80% 5%, rgba(245,197,24,0.04) 0%, transparent 55%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,13,26,0.2) 0%, rgba(5,13,26,0) 25%, rgba(5,13,26,0) 60%, rgba(5,13,26,1) 100%)' }} />
      </div>

      {/* Grid: copy | visual */}
      <div className="ld-hero-grid" style={{ position: 'relative', zIndex: 1, paddingBottom: 16 }}>
        {/* LEFT — copy */}
        <div>
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 28,
            background: 'rgba(245,197,24,0.08)', border: '1px solid rgba(245,197,24,0.22)',
            borderRadius: 100, padding: '7px 16px',
          }}>
            <span style={{ position: 'relative', width: 8, height: 8, flexShrink: 0 }}>
              <span style={{ position: 'absolute', inset: 0, background: '#22c55e', borderRadius: '50%', animation: 'ld-ping 1.6s cubic-bezier(0,0,0.2,1) infinite' }} />
              <span style={{ position: 'absolute', inset: 0, background: '#22c55e', borderRadius: '50%' }} />
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#f5c518', letterSpacing: '2px', textTransform: 'uppercase' }}>
              {tr.eyebrow}
            </span>
          </div>

          {/* Headline con tipografía mixta */}
          <h1 style={{
            fontFamily: 'var(--font-bebas, var(--font-barlow), sans-serif)',
            fontSize: 'clamp(68px, 9.5vw, 140px)',
            lineHeight: 0.9,
            letterSpacing: '2px',
            marginBottom: 28,
            color: '#fff',
          }}>
            REY{' '}
            <em style={{
              fontFamily: 'var(--font-instrument, Georgia, serif)',
              fontStyle: 'italic',
              color: '#f5c518',
              letterSpacing: '-1px',
            }}>del</em>
            <br />
            <span style={{ WebkitTextStroke: '2px #f5c518', color: 'transparent' }}>
              PRODE
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(15px, 1.6vw, 18px)',
            color: 'rgba(255,255,255,0.62)',
            lineHeight: 1.65,
            marginBottom: 36,
            maxWidth: 480,
          }}>
            {tr.desc}
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
            <a href={cta1Href} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 28px', borderRadius: 8, fontSize: 15, fontWeight: 700,
              color: '#050d1a', background: '#f5c518', textDecoration: 'none',
              boxShadow: '0 4px 28px rgba(245,197,24,0.45)', letterSpacing: '0.3px',
            }}>
              {tr.cta1}
            </a>
            <a href="#empresas" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 28px', borderRadius: 8, fontSize: 15, fontWeight: 600,
              color: '#fff', textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.22)',
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(8px)',
            }}>
              {tr.cta2}
            </a>
            <a href="#precios" style={{
              display: 'inline-flex', alignItems: 'center',
              fontSize: 14, fontWeight: 600,
              color: 'rgba(245,197,24,0.8)', textDecoration: 'none',
              borderBottom: '1px solid rgba(245,197,24,0.35)',
              paddingBottom: 2,
            }}>
              {tr.cta3}
            </a>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
            {tr.badges.map(({ n, label }) => (
              <div key={label}>
                <div style={{ fontFamily: 'var(--font-bebas, var(--font-barlow))', fontSize: 28, color: '#f5c518', lineHeight: 1 }}>
                  {n}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2, fontWeight: 500 }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — trophy card visual */}
        <div className="ld-hero-visual" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 340, height: 380 }}>
            {/* Anillo exterior */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 440, height: 440,
              border: '1px solid rgba(245,197,24,0.1)',
              borderRadius: '50%', pointerEvents: 'none',
            }} />
            {/* Anillo rotante dashed */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 320, height: 320,
              border: '1px dashed rgba(245,197,24,0.15)',
              borderRadius: '50%', pointerEvents: 'none',
              animation: 'ld-spin-slow 35s linear infinite',
            }} />
            {/* Glow central */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 220, height: 220,
              background: 'radial-gradient(circle, rgba(245,197,24,0.1) 0%, transparent 70%)',
              borderRadius: '50%',
            }} />

            {/* Copa */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -54%)',
            }}>
              <Image
                src="/copa.png" alt="Copa del Mundo 2026"
                width={190} height={210}
                style={{ filter: 'drop-shadow(0 0 36px rgba(245,197,24,0.35)) drop-shadow(0 12px 50px rgba(0,0,0,0.6))' }}
              />
            </div>

            {/* Mini-card: posición */}
            <div style={{
              position: 'absolute', top: 24, right: -24,
              animation: 'ld-float-a 3.5s ease-in-out infinite',
              background: 'rgba(15,29,53,0.96)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(245,197,24,0.22)', borderRadius: 12,
              padding: '10px 14px', minWidth: 130,
            }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '1px' }}>{tr.cardPos}</div>
              <div style={{ fontFamily: 'var(--font-bebas, var(--font-barlow))', fontSize: 22, color: '#f5c518', lineHeight: 1 }}>🥇 #1</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{tr.cardPlayers}</div>
            </div>

            {/* Mini-card: en vivo */}
            <div style={{
              position: 'absolute', bottom: 80, left: -36,
              animation: 'ld-float-b 4.2s ease-in-out infinite',
              background: 'rgba(15,29,53,0.96)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(231,76,60,0.28)', borderRadius: 12,
              padding: '10px 14px', minWidth: 150,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#e74c3c', boxShadow: '0 0 6px #e74c3c', display: 'inline-block' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#e74c3c', textTransform: 'uppercase', letterSpacing: '1px' }}>{tr.cardLive}</span>
              </div>
              <div style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>🇦🇷 ARG 2 – 1 BRA 🇧🇷</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>63&apos; · {tr.cardQF}</div>
            </div>

            {/* Mini-card: puntos */}
            <div style={{
              position: 'absolute', bottom: 24, right: -12,
              animation: 'ld-float-c 5s ease-in-out infinite',
              background: 'rgba(245,197,24,0.08)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(245,197,24,0.28)', borderRadius: 12,
              padding: '10px 14px',
            }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginBottom: 2 }}>{tr.cardPoints}</div>
              <div style={{ fontFamily: 'var(--font-bebas, var(--font-barlow))', fontSize: 26, color: '#f5c518', lineHeight: 1 }}>247</div>
            </div>
          </div>
        </div>
      </div>

      {/* Countdown bar */}
      <div style={{
        position: 'relative', zIndex: 1,
        borderTop: '1px solid rgba(245,197,24,0.1)',
        marginTop: 40, padding: '24px clamp(20px,4vw,48px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20,
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600 }}>
          {tr.countdownLabel}
        </span>
        <LandingCountdown lang={lang} />
        <span style={{ fontSize: 11, color: 'rgba(245,197,24,0.4)', letterSpacing: '0.5px' }}>
          {tr.countdownDate}
        </span>
      </div>
    </section>
  )
}
