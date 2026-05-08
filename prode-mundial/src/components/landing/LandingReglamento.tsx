'use client'

const TR = {
  es: {
    label: 'REGLAMENTO',
    h2: 'BAJATE LAS',
    h2em: 'reglas del juego',
    subtitle: 'Todo lo que necesitás saber: puntaje exacto, ganador, fase de grupos, eliminatorias, pick del campeón y bloqueo de pronósticos. Todo en un PDF.',
    btn: 'Descargar Reglamento',
    size: 'PDF · Mundial 2026',
  },
  en: {
    label: 'RULEBOOK',
    h2: 'DOWNLOAD THE',
    h2em: 'official rulebook',
    subtitle: 'Everything you need to know: exact score, winner picks, group stage, knockout rounds, champion pick and prediction locking. All in one PDF.',
    btn: 'Download Rulebook',
    size: 'PDF · World Cup 2026',
  },
}

export default function LandingReglamento({ lang }: { lang: string }) {
  const tr = lang === 'en' ? TR.en : TR.es

  return (
    <section id="reglamento" style={{
      padding: '80px clamp(20px, 4vw, 48px)',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      background: 'linear-gradient(135deg, rgba(220,38,38,0.04) 0%, rgba(7,20,40,0) 60%)',
    }}>
      <style>{`
        .ld-reglamento-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 16px 32px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          text-decoration: none;
          border: none;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(220,38,38,0.35), 0 1px 0 rgba(255,255,255,0.1) inset;
          transition: transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.22s ease;
          letter-spacing: 0.3px;
          white-space: nowrap;
        }
        .ld-reglamento-btn::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
          transform: skewX(-20deg);
          transition: left 0.55s ease;
        }
        .ld-reglamento-btn:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 8px 40px rgba(220,38,38,0.55), 0 0 0 1px rgba(220,38,38,0.4), 0 1px 0 rgba(255,255,255,0.12) inset;
        }
        .ld-reglamento-btn:hover::before {
          left: 160%;
        }
        .ld-reglamento-btn:active {
          transform: translateY(-1px) scale(1.01);
          box-shadow: 0 4px 20px rgba(220,38,38,0.45);
        }
        .ld-reglamento-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 48px;
        }
        .ld-reglamento-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
          flex-shrink: 0;
        }
        @media (max-width: 700px) {
          .ld-reglamento-inner {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 28px !important;
          }
          .ld-reglamento-right {
            align-items: flex-start !important;
          }
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="ld-reglamento-inner">

          {/* LEFT — texto */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ height: 1, width: 32, background: '#dc2626' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', letterSpacing: '3px', textTransform: 'uppercase' }}>{tr.label}</span>
            </div>

            <h2 style={{
              fontFamily: 'var(--font-bebas, var(--font-barlow))',
              fontSize: 'clamp(36px, 4vw, 54px)',
              lineHeight: 0.95,
              color: '#fff',
              letterSpacing: '1px',
              marginBottom: 16,
            }}>
              {tr.h2}{' '}
              <em style={{ fontFamily: 'var(--font-instrument, Georgia, serif)', fontStyle: 'italic', color: '#f5c518' }}>{tr.h2em}</em>
            </h2>

            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, maxWidth: 520 }}>
              {tr.subtitle}
            </p>
          </div>

          {/* RIGHT — botón */}
          <div className="ld-reglamento-right">
            <a
              href="/api/reglamento"
              download="Reglamento Rey del Prode.pdf"
              className="ld-reglamento-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <text x="6" y="17" fontSize="5.5" fontWeight="800" fill="white" fontFamily="sans-serif" letterSpacing="0.5">PDF</text>
              </svg>
              {tr.btn}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.85 }}>
                <path d="M12 3V15M12 15L8 11M12 15L16 11" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 19H19" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </a>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.5px' }}>
              {tr.size}
            </span>
          </div>

        </div>
      </div>
    </section>
  )
}
