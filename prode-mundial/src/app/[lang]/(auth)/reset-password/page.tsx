'use client'

import { useState, useTransition } from 'react'
import { resetPassword } from '@/lib/actions/auth'
import { useDictionary } from '@/hooks/useDictionary'

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg-primary)',
  border: '1px solid var(--border-light)',
  borderRadius: '4px',
  padding: '9px 12px',
  color: 'var(--text-primary)',
  fontSize: '14px',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 700,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '6px',
}

export default function ResetPasswordPage() {
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const t = useDictionary()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError(t.auth.resetPassword.passwordMismatch)
      return
    }
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await resetPassword(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative', overflow: 'hidden' }}>
      <img
        src="/estadio.jpg"
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center 40%',
          opacity: 0.09, filter: 'blur(3px) saturate(0.6)',
          transform: 'scale(1.003)', zIndex: 0,
        }}
      />
      <div style={{ width: '100%', maxWidth: '380px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src="/escudo.png" alt="Rey del Prode" style={{ width: '200px', display: 'block', margin: '0 auto 12px' }} />
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '28px 24px' }}>
          <h2 style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '8px', textAlign: 'center' }}>
            {t.auth.resetPassword.title}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginBottom: '20px', lineHeight: '1.4' }}>
            {t.auth.resetPassword.description}
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>{t.auth.resetPassword.password}</label>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                placeholder={t.auth.resetPassword.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
              />
            </div>
            <div>
              <label style={labelStyle}>{t.auth.resetPassword.confirmPassword}</label>
              <input
                type="password"
                required
                placeholder={t.auth.resetPassword.confirmPlaceholder}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  ...inputStyle,
                  borderColor: confirmPassword && confirmPassword !== password ? 'var(--live)' : 'var(--border-light)',
                }}
                onFocus={(e) => (e.target.style.borderColor = confirmPassword !== password ? 'var(--live)' : 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = confirmPassword && confirmPassword !== password ? 'var(--live)' : 'var(--border-light)')}
              />
              {confirmPassword && confirmPassword !== password && (
                <p style={{ color: 'var(--live)', fontSize: '12px', marginTop: '4px' }}>{t.auth.resetPassword.passwordMismatchInline}</p>
              )}
            </div>

            {error && <p style={{ color: 'var(--live)', fontSize: '13px' }}>{error}</p>}

            <button
              type="submit"
              disabled={isPending}
              style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '4px', padding: '10px', fontWeight: 700, fontSize: '14px', letterSpacing: '0.5px', textTransform: 'uppercase', opacity: isPending ? 0.7 : 1, cursor: isPending ? 'not-allowed' : 'pointer' }}
            >
              {isPending ? t.auth.resetPassword.pending : t.auth.resetPassword.submit}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
