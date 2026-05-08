import Image from 'next/image'
import LandingCountdown from './LandingCountdown'

const TR = {
  es: {
    eyebrow: 'Prode del Mundial 2026',
    desc: 'Pronosticá los 104 partidos del Mundial, armá tu prode privado con amigos, familia o tu empresa y seguí el ranking en tiempo real.',
    cta1: 'Crear mi prode gratis',
    cta2: 'Para empresas',
    cta3: 'Ver precios',
    badges: [
      { n: '100%', label: 'Gratis para empezar' },
      { n: '48',   label: 'Selecciones' },
      { n: '104',  label: 'Partidos' },
      // { n: '∞',    label: 'Amigos y compañeros' },
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
    cta1: 'Create my free pool',
    cta2: 'For companies',
    cta3: 'See pricing',
    badges: [
      { n: '100%', label: 'Free to start' },
      { n: '48',   label: 'Nations' },
      { n: '104',  label: 'Matches' },
      // { n: '∞',    label: 'Friends & teammates' },
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
    <>
      <style>{`
        .hero-cta-primary {
          transition: transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease;
        }
        .hero-cta-primary:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 10px 44px rgba(245,197,24,0.65) !important;
        }
        .hero-cta-primary:active { transform: scale(0.97); }

        .hero-cta-secondary {
          transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .hero-cta-secondary:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.13) !important;
          border-color: rgba(255,255,255,0.45) !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.25);
        }
        .hero-cta-secondary:active { transform: scale(0.97); }

        .hero-cta-link {
          transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .hero-cta-link:hover {
          transform: translateY(-2px);
          background: rgba(116,172,223,0.13) !important;
          border-color: rgba(116,172,223,0.65) !important;
          box-shadow: 0 4px 20px rgba(116,172,223,0.2);
        }
        .hero-cta-link:active { transform: scale(0.97); }
      `}</style>
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
            <span style={{ color: '#74ACDF' }}>REY</span>{' '}
            <em style={{
              fontFamily: 'var(--font-instrument, Georgia, serif)',
              fontStyle: 'italic',
              letterSpacing: '-1px',
            }}>
              <span style={{ color: '#fff' }}>d</span>
              <span style={{ color: '#f5c518' }}>e</span>
              <span style={{ color: '#fff' }}>l</span>
            </em>
              {' '}
            <span style={{ WebkitTextStroke: '2px #74ACDF', color: 'transparent' }}>
            {/* <span style={{ color: '#74ACDF' }}> */}
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
            <a href="#empresas" className="hero-cta-secondary" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 28px', borderRadius: 8, fontSize: 15, fontWeight: 600,
              color: '#fff', textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.22)',
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(8px)',
            }}>
              <svg width={30} height={30} viewBox="0 0 512 512" fill="currentColor" aria-hidden>
                <path d="M157.604,321.598c7.26-2.232,10.041-6.696,10.6-10.046c-0.559-4.469-3.143-6.279-3.986-14.404c-0.986-9.457,6.91-32.082,9.258-36.119c-0.32-0.772-0.65-1.454-0.965-2.247c-11.002-6.98-22.209-19.602-27.359-42.416c-2.754-12.197-0.476-24.661,6.121-35.287c0,0-7.463-52.071,3.047-86.079c-9.818-4.726-20.51-3.93-35.164-2.466c-11.246,1.126-12.842,3.516-21.48,2.263c-9.899-1.439-17.932-4.444-20.348-5.654c-1.392-0.694-14.449,10.89-18.084,20.35c-11.531,29.967-8.435,50.512-5.5,66.057c-0.098,1.592-0.224,3.178-0.224,4.787l2.68,11.386c0.01,0.12,0,0.232,0.004,0.346c-5.842,5.24-9.363,12.815-7.504,21.049c3.828,16.934,12.07,23.802,20.186,26.777c5.383,15.186,10.606,24.775,16.701,31.222c1.541,7.027,2.902,16.57,1.916,26.032C83.389,336.78,0,315.904,0,385.481c0,9.112,25.951,23.978,88.818,28.259c-0.184-1.342-0.31-2.695-0.31-4.078C88.508,347.268,129.068,330.379,157.604,321.598z"/>
                <path d="M424.5,297.148c-0.986-9.457,0.371-18.995,1.912-26.011c6.106-6.458,11.328-16.052,16.713-31.246c8.113-2.977,16.35-9.848,20.174-26.774c1.77-7.796-1.293-15.006-6.59-20.2c3.838-12.864,18.93-72.468-26.398-84.556c-15.074-18.839-28.258-18.087-50.871-15.827c-11.246,1.126-12.844,3.516-21.477,2.263c-1.89-0.275-3.682-0.618-5.41-0.984c1.658,2.26,3.238,4.596,4.637,7.092c15.131,27.033,11.135,61.27,6.381,82.182c5.67,10.21,7.525,21.944,4.963,33.285c-5.15,22.8-16.352,35.419-27.348,42.4c-0.551,1.383-2.172,4.214,0.06,7.006c2.039,3.305,2.404,2.99,4.627,5.338c1.539,7.027,2.898,16.57,1.91,26.032c-0.812,7.85-14.352,14.404-10.533,17.576c3.756,1.581,8.113,3.234,13,5.028c28.025,10.29,74.928,27.516,74.928,89.91c0,1.342-0.117,2.659-0.291,3.96C486.524,409.195,512,394.511,512,385.481C512,315.904,428.613,336.78,424.5,297.148z"/>
                <path d="M301.004,307.957c-1.135-10.885,0.432-21.867,2.201-29.956c7.027-7.423,13.047-18.476,19.244-35.968c9.34-3.427,18.826-11.335,23.23-30.826c2.028-8.976-1.494-17.276-7.586-23.256c4.412-14.81,21.785-83.437-30.398-97.353c-17.354-21.692-32.539-20.825-58.57-18.222c-12.951,1.294-14.791,4.048-24.731,2.603c-11.4-1.657-20.646-5.117-23.428-6.508c-1.602-0.803-16.637,12.538-20.826,23.428c-13.27,34.5-9.705,58.159-6.33,76.056c-0.111,1.833-0.264,3.658-0.264,5.511l3.092,13.11c0.01,0.135,0,0.264,0.004,0.399c-6.726,6.03-10.777,14.752-8.636,24.232c4.402,19.498,13.894,27.404,23.238,30.828c6.199,17.485,12.207,28.533,19.231,35.956c1.773,8.084,3.34,19.076,2.205,29.966c-4.738,45.626-100.744,21.593-100.744,101.706c0,12.355,41.4,33.902,144.906,33.902c103.506,0,144.906-21.547,144.906-33.902C401.748,329.549,305.742,353.583,301.004,307.957z M240.039,430.304l-26.276-106.728l32.324,13.453l-1.738,15.619l5.135-0.112L240.039,430.304z M276.209,430.304l-9.447-77.768l5.135,0.112l-1.738-15.619l32.324-13.453L276.209,430.304z"/>
              </svg>
              {tr.cta2}
            </a>
            <a href={cta1Href} className="hero-cta-primary" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 28px', borderRadius: 8, fontSize: 15, fontWeight: 700,
              color: '#071428', background: '#f5c518', textDecoration: 'none',
              boxShadow: '0 4px 28px rgba(245,197,24,0.45)', letterSpacing: '0.3px',
            }}>
              <svg width={30} height={30} viewBox="0 0 950 950" fill="currentColor" aria-hidden>
                <path d="M938.399,107.816H11.601C5.194,107.816,0,112.435,0,118.132v584.875c0,5.697,5.194,10.316,11.601,10.316h330.031h12.52h12.519l-4.049,74.092h224.758l-4.049-74.092h12.519h12.52h330.031c6.406,0,11.601-4.619,11.601-10.316V118.132C950,112.434,944.806,107.816,938.399,107.816z M902.095,656.12c0,4.877-4.67,8.831-10.431,8.831h-285.94h-12.519h-12.52H369.312h-12.519h-12.519H58.336c-5.761,0-10.431-3.954-10.431-8.831V159.858c0-4.877,4.67-8.831,10.431-8.831h833.327c5.761,0,10.431,3.954,10.431,8.831L902.095,656.12L902.095,656.12z"/>
                <path d="M639.304,831.867v-13.408c0-5.696-4.619-10.315-10.315-10.315h-15.439H601.03h-12.52H361.488h-12.52h-12.518h-15.438c-5.697,0-10.315,4.619-10.315,10.315v13.408c0,5.697,4.619,10.316,10.315,10.316h13.578h280.818h13.578C634.685,842.184,639.304,837.564,639.304,831.867z"/>
                <path d="M475,186c-122.601,0-221.989,99.388-221.989,221.989c0,88.289,51.544,164.535,126.18,200.3c10.395,4.981,21.241,9.166,32.454,12.5c20.078,5.969,41.34,9.189,63.355,9.189s43.277-3.222,63.355-9.189c11.214-3.333,22.061-7.519,32.455-12.5c74.635-35.765,126.179-112.011,126.179-200.3C696.989,285.388,597.601,186,475,186z M659.282,485.827c-2.684,6.342-5.684,12.506-8.977,18.494l-85.147,12.674c-2.904,0.434-6.189,2.973-7.338,5.675l-33.694,79.242c-15.945,4.03-32.378,6.066-49.126,6.066s-33.181-2.037-49.126-6.066L392.18,522.67c-1.148-2.702-4.434-5.241-7.338-5.675l-85.147-12.674c-3.292-5.987-6.293-12.151-8.977-18.494c-8.001-18.917-12.962-38.749-14.841-59.161l63.315-58.264c2.159-1.988,3.452-5.935,2.887-8.815l-16.59-84.411c2.61-2.932,5.303-5.806,8.098-8.601c17.879-17.879,38.621-32.005,61.664-42.033l75.111,42.063c2.562,1.435,6.715,1.435,9.275,0l75.111-42.063c23.043,10.028,43.785,24.154,61.664,42.033c2.795,2.795,5.487,5.668,8.098,8.601l-16.59,84.411c-0.566,2.881,0.726,6.828,2.887,8.815l63.315,58.264C672.244,447.078,667.284,466.91,659.282,485.827z"/>
                <path d="M556.2,378.227l-76.9-55.871c-2.375-1.726-6.226-1.726-8.601,0l-76.9,55.871c-2.375,1.726-3.564,5.388-2.658,8.181l29.373,90.401c0.907,2.792,4.023,5.056,6.959,5.056h95.054c2.936,0,6.051-2.263,6.959-5.056l29.373-90.401C559.766,383.614,558.576,379.952,556.2,378.227z"/>
              </svg>
              {tr.cta1}
            </a>
            <a href="#precios" className="hero-cta-link" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 28px', borderRadius: 8, fontSize: 15, fontWeight: 600,
              color: '#fff', textDecoration: 'none',
              border: '1px solid #74ACDF',
              background: '#74ACDF',
              backdropFilter: 'blur(8px)',
            }}>
              <svg width={30} height={30} viewBox="0 -32 1088 1088" fill="currentColor" aria-hidden>
                <path d="M992 64H768c-52.8 0-126.546 30.546-163.882 67.882L227.882 508.118c-37.334 37.334-37.334 98.428 0 135.764l280.236 280.232c37.334 37.336 98.428 37.336 135.764 0l376.232-376.232C1057.454 510.546 1088 436.8 1088 384V160c0-52.8-43.2-96-96-96z m-128 320c-53.02 0-96-42.98-96-96s42.98-96 96-96 96 42.98 96 96-42.98 96-96 96zM86.626 598.624l342.378 342.378c-36.264 19.16-82.462 13.54-112.886-16.888L35.882 643.882c-37.334-37.336-37.334-98.43 0-135.764L412.118 131.882C449.454 94.546 523.2 64 576 64L86.626 553.372c-12.444 12.446-12.444 32.808 0 45.252z"/>
              </svg>
              {tr.cta3}
            </a>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
            {tr.badges.map(({ n, label }) => (
              <div key={label}>
                <div style={{ fontFamily: 'var(--font-bebas, var(--font-barlow)), system-ui, sans-serif', fontSize: 28, color: '#f5c518', lineHeight: 1 }}>
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
              background: 'rgba(13,43,85,0.96)', backdropFilter: 'blur(12px)',
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
              background: 'rgba(13,43,85,0.96)', backdropFilter: 'blur(12px)',
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
    </>
  )
}
