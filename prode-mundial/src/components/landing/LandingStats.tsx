'use client'

import { useEffect, useRef, useState } from 'react'

const STATS_ES = [
  { value: 48,  suffix: '',  label: 'Equipos',        detail: 'la edición más grande' },
  { value: 104, suffix: '',  label: 'Partidos',       detail: 'para pronosticar' },
  { value: 3,   suffix: '',  label: 'Países sede',    detail: 'USA · MEX · CAN' },
  { value: 39,  suffix: '',  label: 'Días de torneo', detail: '11 jun → 19 jul' },
]

const STATS_EN = [
  { value: 48,  suffix: '',  label: 'Teams',             detail: 'the biggest edition' },
  { value: 104, suffix: '',  label: 'Matches',           detail: 'to predict' },
  { value: 3,   suffix: '',  label: 'Host nations',      detail: 'USA · MEX · CAN' },
  { value: 39,  suffix: '',  label: 'Tournament days',   detail: 'Jun 11 → Jul 19' },
]

function StatItem({ value, suffix, label, detail }: (typeof STATS)[0]) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const animated = useRef(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !animated.current) {
        animated.current = true
        const duration = 1400
        const start = Date.now()
        const tick = () => {
          const p = Math.min((Date.now() - start) / duration, 1)
          const ease = 1 - Math.pow(1 - p, 3)
          setDisplay(Math.floor(ease * value))
          if (p < 1) requestAnimationFrame(tick)
          else setDisplay(value)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.4 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [value])

  return (
    <div ref={ref} style={{
      textAlign: 'center', padding: '40px 24px',
      border: '1px solid rgba(245,197,24,0.1)',
      borderRadius: 16,
      background: 'rgba(245,197,24,0.03)',
    }}>
      <div style={{
        fontFamily: 'var(--font-bebas, var(--font-barlow))',
        fontSize: 'clamp(56px, 6vw, 80px)',
        lineHeight: 1,
        color: '#f5c518',
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-1px',
      }}>
        {display}{suffix}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginTop: 8, textTransform: 'uppercase', letterSpacing: '1px' }}>
        {label}
      </div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
        {detail}
      </div>
    </div>
  )
}

export default function LandingStats({ lang = 'es' }: { lang?: string }) {
  const STATS = lang === 'en' ? STATS_EN : STATS_ES
  return (
    <section style={{ padding: '80px clamp(20px, 4vw, 48px)' }}>
      <div className="ld-stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        maxWidth: 1200, margin: '0 auto',
      }}>
        {STATS.map(s => <StatItem key={s.label} {...s} />)}
      </div>
    </section>
  )
}
