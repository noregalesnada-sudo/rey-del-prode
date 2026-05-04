'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteOwnAccount } from '@/lib/actions/admin'

export default function DeleteAccountButton() {
  const [step, setStep] = useState<'idle' | 'confirm'>('idle')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const router = useRouter()

  function handleConfirm() {
    setError('')
    startTransition(async () => {
      const result = await deleteOwnAccount()
      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/login')
      }
    })
  }

  if (step === 'idle') {
    return (
      <button
        onClick={() => setStep('confirm')}
        style={{
          background: 'none',
          border: '1px solid rgba(231,76,60,0.4)',
          color: 'var(--live)',
          borderRadius: '4px',
          padding: '8px 16px',
          fontSize: '13px',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(231,76,60,0.08)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
      >
        Eliminar mi cuenta
      </button>
    )
  }

  return (
    <div style={{
      background: 'rgba(231,76,60,0.06)',
      border: '1px solid rgba(231,76,60,0.3)',
      borderRadius: '6px',
      padding: '16px',
    }}>
      <p style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '6px', fontWeight: 700 }}>
        ¿Estás seguro?
      </p>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>
        Esta acción es irreversible. Se eliminarán tu cuenta, tus pronósticos y todos tus datos personales de forma permanente.
      </p>
      {error && (
        <p style={{ fontSize: '12px', color: 'var(--live)', marginBottom: '12px' }}>{error}</p>
      )}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleConfirm}
          disabled={isPending}
          style={{
            background: 'rgba(231,76,60,0.15)',
            border: '1px solid var(--live)',
            color: 'var(--live)',
            borderRadius: '4px',
            padding: '7px 16px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: isPending ? 'not-allowed' : 'pointer',
            opacity: isPending ? 0.6 : 1,
          }}
        >
          {isPending ? 'Eliminando...' : 'Sí, eliminar mi cuenta'}
        </button>
        <button
          onClick={() => setStep('idle')}
          disabled={isPending}
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            borderRadius: '4px',
            padding: '7px 16px',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
