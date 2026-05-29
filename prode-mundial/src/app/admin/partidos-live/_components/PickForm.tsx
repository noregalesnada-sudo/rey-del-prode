'use client'

import { useState, useTransition } from 'react'
import { saveAdminTestPick } from '@/lib/actions/admin-test-picks'

interface Props {
  matchId: string
  initialHome?: number
  initialAway?: number
  homeTeam: string
  awayTeam: string
}

export default function PickForm({ matchId, initialHome, initialAway, homeTeam, awayTeam }: Props) {
  const [home, setHome] = useState<string>(initialHome != null ? String(initialHome) : '')
  const [away, setAway] = useState<string>(initialAway != null ? String(initialAway) : '')
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ ok?: boolean; msg?: string } | null>(null)

  const hasPick = initialHome != null && initialAway != null
  const isEditing = home !== String(initialHome ?? '') || away !== String(initialAway ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const h = parseInt(home, 10)
    const a = parseInt(away, 10)
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) {
      setFeedback({ ok: false, msg: 'Ingresá números válidos (≥ 0)' })
      return
    }
    setFeedback(null)
    startTransition(async () => {
      const res = await saveAdminTestPick(matchId, h, a)
      if (res.error) setFeedback({ ok: false, msg: res.error })
      else setFeedback({ ok: true, msg: 'Pick guardado ✓' })
    })
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {hasPick ? 'Tu pick:' : 'Predecí:'}
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '11px', color: '#888', maxWidth: '70px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {homeTeam}
        </span>
        <input
          type="number" min="0" max="20" value={home}
          onChange={(e) => { setHome(e.target.value); setFeedback(null) }}
          style={{
            width: '44px', textAlign: 'center', background: '#1a2a1a',
            border: `1px solid ${isEditing ? '#74acdf' : '#2a3a2a'}`,
            borderRadius: '4px', color: '#fff', padding: '4px 6px', fontSize: '13px', fontWeight: 700,
          }}
        />
        <span style={{ color: '#555', fontWeight: 700 }}>-</span>
        <input
          type="number" min="0" max="20" value={away}
          onChange={(e) => { setAway(e.target.value); setFeedback(null) }}
          style={{
            width: '44px', textAlign: 'center', background: '#1a2a1a',
            border: `1px solid ${isEditing ? '#74acdf' : '#2a3a2a'}`,
            borderRadius: '4px', color: '#fff', padding: '4px 6px', fontSize: '13px', fontWeight: 700,
          }}
        />
        <span style={{ fontSize: '11px', color: '#888', maxWidth: '70px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {awayTeam}
        </span>
      </div>

      {(isEditing || !hasPick) && (
        <button
          type="submit" disabled={isPending || home === '' || away === ''}
          style={{
            background: '#74acdf', color: '#000', border: 'none',
            borderRadius: '4px', padding: '4px 12px', fontSize: '11px', fontWeight: 800,
            cursor: 'pointer', opacity: isPending ? 0.6 : 1,
          }}
        >
          {isPending ? '...' : 'Guardar'}
        </button>
      )}

      {feedback && (
        <span style={{ fontSize: '11px', color: feedback.ok ? '#4caf50' : '#ff6666' }}>
          {feedback.msg}
        </span>
      )}
    </form>
  )
}
