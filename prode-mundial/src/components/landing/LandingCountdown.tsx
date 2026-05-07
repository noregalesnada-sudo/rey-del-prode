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

const unitStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  background: 'rgba(245,197,24,0.06)',
  border: '1px solid rgba(245,197,24,0.2)',
  borderRadius: 12, padding: '18px 24px', minWidth: 96,
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
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {blocks.map(({ v, label }, i) => (
        <Fragment key={i}>
          <div style={unitStyle}>
            <span style={{
              fontFamily: 'var(--font-bebas, var(--font-barlow))',
              fontSize: 64, lineHeight: 1, color: i === 0 ? '#f5c518' : '#fff',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {String(v).padStart(2, '0')}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginTop: 6 }}>
              {label}
            </span>
          </div>
          {i < 3 && (
            <span style={{ fontFamily: 'var(--font-bebas, var(--font-barlow))', fontSize: 48, color: 'rgba(245,197,24,0.4)', marginBottom: 18 }}>:</span>
          )}
        </Fragment>
      ))}
    </div>
  )
}
