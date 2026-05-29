'use client'

import { useState, useTransition } from 'react'
import { updateMatchScore } from '@/lib/actions/admin-test-picks'

interface Props {
  matchId: string
  currentHomeScore: number | null
  currentAwayScore: number | null
  currentStatus: string
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Programado',
  live: 'En vivo',
  finished: 'Finalizado',
}

export default function ScoreEditor({ matchId, currentHomeScore, currentAwayScore, currentStatus }: Props) {
  const [open, setOpen] = useState(false)
  const [home, setHome] = useState(currentHomeScore != null ? String(currentHomeScore) : '')
  const [away, setAway] = useState(currentAwayScore != null ? String(currentAwayScore) : '')
  const [status, setStatus] = useState(currentStatus)
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  function handleSave() {
    const h = home === '' ? null : parseInt(home, 10)
    const a = away === '' ? null : parseInt(away, 10)
    if ((h != null && isNaN(h)) || (a != null && isNaN(a))) {
      setMsg({ ok: false, text: 'Valores inválidos' })
      return
    }
    setMsg(null)
    startTransition(async () => {
      const res = await updateMatchScore(matchId, h, a, status as 'scheduled' | 'live' | 'finished')
      if (res.error) {
        setMsg({ ok: false, text: res.error })
      } else {
        setMsg({ ok: true, text: 'Guardado ✓' })
        setTimeout(() => { setOpen(false); setMsg(null) }, 800)
      }
    })
  }

  const inputStyle = {
    width: '44px', textAlign: 'center' as const,
    background: '#111', border: '1px solid #333',
    borderRadius: '4px', color: '#fff',
    padding: '4px 6px', fontSize: '14px', fontWeight: 700,
  }

  const selectStyle = {
    background: '#111', border: '1px solid #333',
    borderRadius: '4px', color: '#aaa',
    padding: '4px 8px', fontSize: '11px', cursor: 'pointer',
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          background: 'none', border: '1px solid #2a2a2a',
          color: '#444', fontSize: '11px', padding: '3px 10px',
          borderRadius: '4px', cursor: 'pointer',
          transition: 'border-color 0.2s, color 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#555'; e.currentTarget.style.color = '#888' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#444' }}
      >
        {currentHomeScore != null ? `${currentHomeScore}-${currentAwayScore} · editar` : 'Cargar resultado'}
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <select value={status} onChange={(e) => setStatus(e.target.value)} style={selectStyle}>
        {Object.entries(STATUS_LABELS).map(([val, label]) => (
          <option key={val} value={val} style={{ background: '#111' }}>{label}</option>
        ))}
      </select>

      <input
        type="number" min="0" max="30" value={home}
        placeholder="0"
        onChange={(e) => setHome(e.target.value)}
        style={inputStyle}
      />
      <span style={{ color: '#555', fontWeight: 700 }}>-</span>
      <input
        type="number" min="0" max="30" value={away}
        placeholder="0"
        onChange={(e) => setAway(e.target.value)}
        style={inputStyle}
      />

      <button
        onClick={handleSave}
        disabled={isPending}
        style={{
          background: '#1a3a1a', border: '1px solid #2a4a2a',
          color: '#4caf50', padding: '4px 12px',
          borderRadius: '4px', fontSize: '11px', fontWeight: 800,
          cursor: 'pointer', opacity: isPending ? 0.6 : 1,
        }}
      >
        {isPending ? '...' : 'Guardar'}
      </button>

      <button
        onClick={() => { setOpen(false); setMsg(null) }}
        style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: '14px', padding: '2px 6px' }}
      >
        ✕
      </button>

      {msg && (
        <span style={{ fontSize: '11px', color: msg.ok ? '#4caf50' : '#ff6666' }}>
          {msg.text}
        </span>
      )}
    </div>
  )
}
