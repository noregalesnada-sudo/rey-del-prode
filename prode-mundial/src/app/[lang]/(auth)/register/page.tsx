'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { register } from '@/lib/actions/auth'
import { useDictionary, useLang } from '@/hooks/useDictionary'

export default function RegisterPage() {
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const [confirmPassword, setConfirmPassword] = useState('')
  const [password, setPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const t = useDictionary()
  const lang = useLang()
  const lp = (path: string) => `/${lang}${path}`

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError(t.auth.register.passwordMismatch)
      return
    }
    if (!termsAccepted) {
      setError(t.auth.register.termsRequired)
      return
    }
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await register(formData)
      if (result?.error) setError(result.error)
    })
  }

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
          <img
            src="/escudo.png"
            alt="Rey del Prode"
            style={{ width: '200px', display: 'block', margin: '0 auto 12px' }}
          />
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '28px 24px' }}>
          <h2 style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '20px', textAlign: 'center' }}>
            {t.auth.register.title}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={labelStyle}>{t.auth.register.firstName}</label>
                <input name="first_name" type="text" required placeholder={t.auth.register.firstNamePlaceholder} style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')} />
              </div>
              <div>
                <label style={labelStyle}>{t.auth.register.lastName}</label>
                <input name="last_name" type="text" required placeholder={t.auth.register.lastNamePlaceholder} style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>{t.auth.register.username}</label>
              <input name="username" type="text" required placeholder={t.auth.register.usernamePlaceholder} style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')} />
            </div>
            <div>
              <label style={labelStyle}>{t.auth.register.email}</label>
              <input name="email" type="email" required placeholder="tu@email.com" style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')} />
            </div>
            <div>
              <label style={labelStyle}>{t.auth.register.password}</label>
              <input
                name="password" type="password" required placeholder={t.auth.register.passwordPlaceholder} minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
              />
            </div>
            <div>
              <label style={labelStyle}>{t.auth.register.confirmPassword}</label>
              <input
                type="password" required placeholder={t.auth.register.confirmPlaceholder}
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
                <p style={{ color: 'var(--live)', fontSize: '12px', marginTop: '4px' }}>{t.auth.register.passwordMismatchInline}</p>
              )}
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                style={{ marginTop: '2px', accentColor: 'var(--accent)', flexShrink: 0 }}
              />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                {t.auth.register.termsText}{' '}
                <Link href={lp('/terminos')} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 700 }}>
                  {t.auth.register.termsLink}
                </Link>
              </span>
            </label>

            {error && <p style={{ color: 'var(--live)', fontSize: '13px' }}>{error}</p>}

            <button type="submit" disabled={isPending}
              style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '4px', padding: '10px', fontWeight: 700, fontSize: '14px', letterSpacing: '0.5px', textTransform: 'uppercase', opacity: isPending ? 0.7 : 1, cursor: isPending ? 'not-allowed' : 'pointer' }}>
              {isPending ? t.auth.register.pending : t.auth.register.submit}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>
          {t.auth.register.hasAccount}{' '}
          <Link href={lp('/login')} style={{ color: 'var(--accent)', fontWeight: 700 }}>{t.auth.register.login}</Link>
        </p>
      </div>
    </div>
  )
}
