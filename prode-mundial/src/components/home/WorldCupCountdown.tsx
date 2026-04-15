'use client'

import { useEffect, useState } from 'react'

// Partido inaugural: 11 de junio de 2026, Ciudad de México (UTC-6)
const WORLD_CUP_START = new Date('2026-06-11T19:00:00-06:00')

function getTimeLeft() {
  const diff = WORLD_CUP_START.getTime() - Date.now()
  if (diff <= 0) return null
  const days    = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  return { days, hours, minutes, seconds }
}

export default function WorldCupCountdown() {
  const [time, setTime] = useState<ReturnType<typeof getTimeLeft>>(null)

  useEffect(() => {
    setTime(getTimeLeft())
    const interval = setInterval(() => setTime(getTimeLeft()), 1000)
    return () => clearInterval(interval)
  }, [])

  if (!time) return null

  const blocks = [
    { value: time.days,    label: 'Días' },
    { value: time.hours,   label: 'Hs' },
    { value: time.minutes, label: 'Min' },
    { value: time.seconds, label: 'Seg' },
  ]

  return (
    <div className="countdown-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      position: 'relative',
      zIndex: 1,
    }}>
      <p style={{
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '2px',
        color: 'var(--text-muted)',
      }}>
        Faltan para el arranque
      </p>

      <div style={{ display: 'flex', gap: '10px' }}>
        {blocks.map(({ value, label }) => (
          <div key={label} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(10, 31, 61, 0.75)',
            border: '1px solid rgba(116,172,223,0.2)',
            borderRadius: '8px',
            padding: '14px 16px 10px',
            minWidth: '68px',
            backdropFilter: 'blur(8px)',
          }}>
            <span style={{
              fontSize: '42px',
              fontWeight: 900,
              lineHeight: 1,
              color: label === 'Seg' ? 'var(--text-muted)' : label === 'Días' ? '#FFD700' : 'var(--accent)',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-1px',
            }}>
              {String(value).padStart(2, '0')}
            </span>
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              color: 'var(--text-muted)',
              marginTop: '6px',
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <p style={{ fontSize: '11px', color: 'rgba(116,172,223,0.4)', letterSpacing: '0.5px' }}>
        11 Jun 2026 · México
      </p>
    </div>
  )
}
