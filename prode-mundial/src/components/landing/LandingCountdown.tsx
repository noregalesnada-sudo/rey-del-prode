'use client'

import { Fragment, useEffect, useState } from 'react'

// Partido inaugural: 11 de junio de 2026, 16:00 hora Argentina (UTC-3) = 13:00 en Ciudad de México
const TARGET = new Date('2026-06-11T16:00:00-03:00')

function getLeft() {
  const diff = TARGET.getTime() - Date.now()
  if (diff <= 0) return null
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  }
}

export default function LandingCountdown({
  lang = 'es',
  theme = 'dark',
  label,
  liveLabel,
  dateLabel,
}: {
  lang?: string
  theme?: 'dark' | 'light'
  label?: string
  liveLabel?: string
  dateLabel?: string
}) {
  const isLight = theme === 'light'
  // El Mundial ya arrancó: TARGET está en el pasado, así que getLeft() === null
  // se resuelve igual en server y cliente (sin mismatch de hidratación).
  const [started] = useState(() => getLeft() === null)
  const [t, setT] = useState<ReturnType<typeof getLeft>>(null)

  useEffect(() => {
    if (started) return
    setT(getLeft())
    const id = setInterval(() => setT(getLeft()), 1000)
    return () => clearInterval(id)
  }, [started])

  const en = lang === 'en'
  const liveTag = en ? 'LIVE' : 'EN VIVO'
  const liveText = liveLabel ?? (en ? 'The World Cup is underway' : 'El Mundial ya arrancó')

  // Colores theme-dependientes van inline (no en el <style> compartido):
  // hay 2 instancias del countdown en la página (hero dark + CTA final light) y
  // las clases globales colisionan — la última en el DOM pisaría a la otra.
  const liveBg = isLight ? 'rgba(231,76,60,0.1)' : 'rgba(231,76,60,0.2)'
  const liveBorder = isLight ? 'rgba(231,76,60,0.4)' : 'rgba(231,76,60,0.55)'
  const liveShadow = isLight ? 'none' : '0 4px 20px rgba(231,76,60,0.22)'
  const liveTextColor = isLight ? '#071428' : '#fff'
  const liveTextShadow = isLight ? 'none' : '0 2px 10px rgba(0,0,0,0.55)'
  const tagShadow = isLight ? 'none' : '0 1px 6px rgba(0,0,0,0.4)'
  const unitBg = isLight ? 'rgba(116,172,223,0.08)' : 'rgba(245,197,24,0.06)'
  const unitBorder = isLight ? 'rgba(116,172,223,0.3)' : 'rgba(245,197,24,0.2)'
  const sepColor = isLight ? 'rgba(245,197,24,0.8)' : 'rgba(245,197,24,0.4)'

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    color: isLight ? 'rgba(7,20,40,0.5)' : 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    fontWeight: 600,
  }
  const dateStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: isLight ? 'rgba(16,66,112,0.7)' : 'rgba(245,197,24,0.75)',
    letterSpacing: '0.5px',
    textShadow: isLight ? 'none' : '0 1px 6px rgba(0,0,0,0.5)',
  }

  return (
    <>
      <style>{`
        .ld-cd { display: flex; gap: 8px; align-items: center; }
        .ld-cd-unit {
          display: flex; flex-direction: column; align-items: center;
          border-radius: 12px; padding: 18px 24px; min-width: 96px;
        }
        .ld-cd-num {
          font-family: var(--font-bebas, var(--font-barlow));
          font-size: 64px; line-height: 1; font-variant-numeric: tabular-nums;
        }
        .ld-cd-sep {
          font-family: var(--font-bebas, var(--font-barlow));
          font-size: 48px; margin-bottom: 18px;
        }
        .ld-cd-live {
          display: inline-flex; align-items: center; gap: 11px;
          padding: 11px 22px; border-radius: 999px;
        }
        .ld-cd-live-dot {
          width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0;
          background: #ff5546; box-shadow: 0 0 10px #ff5546;
          animation: ld-cd-pulse 1.4s ease-in-out infinite;
        }
        .ld-cd-live-tag {
          font-size: 12px; font-weight: 800; letter-spacing: 1.5px;
          text-transform: uppercase; color: #ff6a5c;
        }
        .ld-cd-live-text {
          font-family: var(--font-bebas, var(--font-barlow));
          font-size: 28px; line-height: 1; letter-spacing: 1.5px;
        }
        @keyframes ld-cd-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(0.78); }
        }
        @media (max-width: 520px) {
          .ld-cd { gap: 4px; }
          .ld-cd-unit { padding: 10px 10px; min-width: 0; border-radius: 8px; }
          .ld-cd-num { font-size: 38px; }
          .ld-cd-sep { font-size: 28px; margin-bottom: 12px; }
          .ld-cd-live { padding: 9px 16px; gap: 9px; }
          .ld-cd-live-text { font-size: 21px; }
        }
      `}</style>

      {started ? (
        <>
          <span className="ld-cd-live" style={{ background: liveBg, border: `1px solid ${liveBorder}`, boxShadow: liveShadow }}>
            <span className="ld-cd-live-dot" />
            <span className="ld-cd-live-tag" style={{ textShadow: tagShadow }}>{liveTag}</span>
            <span className="ld-cd-live-text" style={{ color: liveTextColor, textShadow: liveTextShadow }}>{liveText}</span>
          </span>
          {dateLabel && <span style={dateStyle}>{dateLabel}</span>}
        </>
      ) : (
        <>
          {label && <span style={labelStyle}>{label}</span>}
          {t && (
            <div className="ld-cd">
              {[
                { v: t.d, label: en ? 'Days' : 'Días' },
                { v: t.h, label: en ? 'Hrs' : 'Hs' },
                { v: t.m, label: en ? 'Min' : 'Min' },
                { v: t.s, label: en ? 'Sec' : 'Seg' },
              ].map(({ v, label: lbl }, i) => (
                <Fragment key={i}>
                  <div className="ld-cd-unit" style={{ background: unitBg, border: `1px solid ${unitBorder}` }}>
                    <span className="ld-cd-num" style={{ color: i === 0 ? '#f5c518' : (isLight ? '#071428' : '#fff') }}>
                      {String(v).padStart(2, '0')}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: isLight ? 'rgba(7,20,40,0.5)' : 'rgba(255,255,255,0.45)', marginTop: 6 }}>
                      {lbl}
                    </span>
                  </div>
                  {i < 3 && <span className="ld-cd-sep" style={{ color: sepColor }}>:</span>}
                </Fragment>
              ))}
            </div>
          )}
          {dateLabel && <span style={dateStyle}>{dateLabel}</span>}
        </>
      )}
    </>
  )
}
