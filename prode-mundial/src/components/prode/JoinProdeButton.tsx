'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Clock } from 'lucide-react'
import { joinProde } from '@/lib/actions/prodes'

export default function JoinProdeButton({ slug }: { slug: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [pendingApproval, setPendingApproval] = useState(false)
  const router = useRouter()

  function handleJoin() {
    setError('')
    startTransition(async () => {
      const result = await joinProde(slug)
      if (result.error) {
        setError(result.error)
      } else if (result.pending) {
        setPendingApproval(true)
      } else if (result.slug) {
        router.push(`/prode/${result.slug}`)
      }
    })
  }

  if (pendingApproval) {
    return (
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <Clock size={28} style={{ color: '#FFD700', marginBottom: '10px' }} />
        <p style={{ fontSize: '14px', lineHeight: 1.5, color: 'var(--text-primary)' }}>
          Tu solicitud fue enviada.<br />
          El admin tiene que aceptarte para que puedas participar.
        </p>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={handleJoin}
        disabled={isPending}
        style={{
          background: 'var(--accent)',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          padding: '12px 32px',
          fontWeight: 700,
          fontSize: '14px',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          cursor: isPending ? 'not-allowed' : 'pointer',
          opacity: isPending ? 0.7 : 1,
          width: '100%',
          transition: 'opacity 0.2s',
        }}
      >
        {isPending ? 'Uniéndome...' : 'Unirme al Prode'}
      </button>
      {error && (
        <p style={{ color: 'var(--live)', fontSize: '13px', marginTop: '10px', textAlign: 'center' }}>
          {error}
        </p>
      )}
    </div>
  )
}
