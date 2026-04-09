'use client'

import { useState, useTransition, useRef } from 'react'
import { Hash, X, ArrowRight, Clock } from 'lucide-react'
import { joinProdeByCode } from '@/lib/actions/prodes'

export default function JoinByCode() {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [pendingMsg, setPendingMsg] = useState('')
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleOpen() {
    setOpen(true)
    setCode('')
    setError('')
    setPendingMsg('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function handleClose() {
    setOpen(false)
    setCode('')
    setError('')
    setPendingMsg('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (code.trim().length < 4) return
    setError('')
    setPendingMsg('')
    startTransition(async () => {
      const result = await joinProdeByCode(code.trim())
      if (result?.error) setError(result.error)
      if (result?.pending) {
        setPendingMsg('Tu solicitud fue enviada. El admin del prode tiene que aceptarte.')
      }
      // Si no hay error ni pending → el action hizo redirect automáticamente
    })
  }

  const inputStyle: React.CSSProperties = {
    flex: 1,
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-light)',
    borderRadius: '4px',
    padding: '10px 14px',
    color: 'var(--text-primary)',
    fontSize: '20px',
    fontFamily: 'monospace',
    fontWeight: 700,
    letterSpacing: '4px',
    textTransform: 'uppercase',
    outline: 'none',
    width: '100%',
    textAlign: 'center',
  }

  return (
    <>
      <button
        onClick={handleOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 24px',
          color: 'var(--text-muted)',
          fontWeight: 700,
          fontSize: '14px',
          background: 'transparent',
          border: 'none',
          borderTop: '1px solid var(--border)',
          borderLeft: '3px solid transparent',
          width: '100%',
          textAlign: 'left',
          cursor: 'pointer',
          transition: 'all 0.2s',
          marginTop: '4px',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(116, 172, 223, 0.08)'
          ;(e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLElement).style.background = 'transparent'
          ;(e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'
        }}
      >
        <Hash size={13} />
        Unirse con código
      </button>

      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
        >
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '28px 24px',
            width: '100%',
            maxWidth: '360px',
            position: 'relative',
          }}>
            <button
              onClick={handleClose}
              style={{
                position: 'absolute', top: '12px', right: '12px',
                background: 'none', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', padding: '4px',
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <Hash size={20} style={{ color: 'var(--accent)' }} />
              <h2 style={{ fontWeight: 900, fontSize: '15px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Unirse a un Prode
              </h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
              Ingresá el código de 6 caracteres que te compartió el admin.
            </p>

            {pendingMsg ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                padding: '20px', textAlign: 'center',
              }}>
                <Clock size={32} style={{ color: '#FFD700' }} />
                <p style={{ fontSize: '14px', lineHeight: 1.5, color: 'var(--text-primary)' }}>
                  {pendingMsg}
                </p>
                <button
                  onClick={handleClose}
                  style={{
                    background: 'var(--accent)', color: '#fff', border: 'none',
                    borderRadius: '4px', padding: '8px 20px',
                    fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                  }}
                >
                  Entendido
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  ref={inputRef}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))
                    setError('')
                  }}
                  placeholder="ABC123"
                  maxLength={6}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
                />

                {error && (
                  <p style={{ color: 'var(--live)', fontSize: '13px', textAlign: 'center' }}>{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isPending || code.length < 4}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    background: 'var(--accent)', color: '#fff', border: 'none',
                    borderRadius: '4px', padding: '11px',
                    fontWeight: 700, fontSize: '14px', letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    cursor: isPending || code.length < 4 ? 'not-allowed' : 'pointer',
                    opacity: isPending || code.length < 4 ? 0.6 : 1,
                    transition: 'opacity 0.2s',
                  }}
                >
                  {isPending ? 'Buscando...' : (
                    <><ArrowRight size={16} /> Unirme</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
