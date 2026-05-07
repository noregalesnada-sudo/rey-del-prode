'use client'

import { Fragment, useEffect, useState } from 'react'

const TARGET = new Date('2026-06-11T19:00:00-06:00')

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

export default function LandingCountdown({ lang = 'es' }: { lang?: string }) {
  const [t, setT] = useState<ReturnType<typeof getLeft>>(null)

  useEffect(() => {
    setT(getLeft())
    const id = setInterval(() => setT(getLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!t) return null

  const labels = lang === 'en'
    ? ['Days', 'Hrs', 'Min', 'Sec']
    : ['Días', 'Hs', 'Min', 'Seg']

  const blocks = [
    { v: t.d, label: labels[0] },
    { v: t.h, label: labels[1] },
    { v: t.m, label: labels[2] },
    { v: t.s, label: labels[3] },
  ]

  return (
    <>
      <style>{`
        .ld-cd { display: flex; gap: 8px; align-items: center; }
        .ld-cd-unit {
          display: flex; flex-direction: column; align-items: center;
          background: rgba(245,197,24,0.06);
          border: 1px solid rgba(245,197,24,0.2);
          border-radius: 12px; padding: 18px 24px; min-width: 96px;
        }
        .ld-cd-num {
          font-family: var(--font-bebas, var(--font-barlow));
          font-size: 64px; line-height: 1; font-variant-numeric: tabular-nums;
        }
        .ld-cd-sep {
          font-family: var(--font-bebas, var(--font-barlow));
          font-size: 48px; color: rgba(245,197,24,0.4); margin-bottom: 18px;
        }
        @media (max-width: 520px) {
          .ld-cd { gap: 4px; }
          .ld-cd-unit { padding: 10px 10px; min-width: 0; border-radius: 8px; }
          .ld-cd-num { font-size: 38px; }
          .ld-cd-sep { font-size: 28px; margin-bottom: 12px; }
        }
      `}</style>
      <div className="ld-cd">
        {blocks.map(({ v, label }, i) => (
          <Fragment key={i}>
            <div className="ld-cd-unit">
              <span className="ld-cd-num" style={{ color: i === 0 ? '#f5c518' : '#fff' }}>
                {String(v).padStart(2, '0')}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginTop: 6 }}>
                {label}
              </span>
            </div>
            {i < 3 && <span className="ld-cd-sep">:</span>}
          </Fragment>
        ))}
      </div>
    </>
  )
}
