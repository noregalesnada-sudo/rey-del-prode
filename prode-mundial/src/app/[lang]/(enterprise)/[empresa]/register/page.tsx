'use client'

import { useState, useTransition } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { registerEnterprise } from '@/lib/actions/enterprise'
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
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 700,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '5px',
}

export default function EnterpriseRegisterPage() {
  const params = useParams()
  const empresa = params.empresa as string
  const lang = params.lang as string

  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const t = useDictionary()

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
    formData.set('company_slug', empresa)
    startTransition(async () => {
      const result = await registerEnterprise(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', position: 'relative', overflow: 'hidden',
    }}>
      <img src="/estadio.jpg" alt="" aria-hidden="true" style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        objectFit: 'cover', objectPosition: 'center 40%',
        opacity: 0.09, filter: 'blur(3px) saturate(0.6)',
        transform: 'scale(1.003)', zIndex: 0,
      }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <img src="/escudo.png" alt="Rey del Prode" style={{ width: '120px', display: 'block', margin: '0 auto 10px' }} />
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '28px 24px' }}>
          <h2 style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '6px', textAlign: 'center' }}>
            {t.auth.register.title}
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '20px' }}>
            Ingresá el mail de tu empresa para registrarte
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
              <label style={labelStyle}>Email corporativo *</label>
              <input name="email" type="email" required placeholder="tu@empresa.com" style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')} />
            </div>

            <div>
              <label style={labelStyle}>{t.auth.register.password}</label>
              <input name="password" type="password" required placeholder={t.auth.register.passwordPlaceholder} minLength={8}
                value={password} onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')} />
            </div>

            <div>
              <label style={labelStyle}>{t.auth.register.confirmPassword}</label>
              <input type="password" required placeholder={t.auth.register.confirmPlaceholder}
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ ...inputStyle, borderColor: confirmPassword && confirmPassword !== password ? 'var(--live)' : 'var(--border-light)' }}
                onFocus={(e) => (e.target.style.borderColor = confirmPassword !== password ? 'var(--live)' : 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = confirmPassword && confirmPassword !== password ? 'var(--live)' : 'var(--border-light)')} />
              {confirmPassword && confirmPassword !== password && (
                <p style={{ color: 'var(--live)', fontSize: '11px', marginTop: '3px' }}>{t.auth.register.passwordMismatchInline}</p>
              )}
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)}
                style={{ marginTop: '2px', accentColor: 'var(--accent)', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {t.auth.register.termsText}{' '}
                <Link href={`/${lang}/terminos`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 700 }}>
                  {t.auth.register.termsLink}
                </Link>
              </span>
            </label>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: '4px', fontSize: '13px', fontWeight: 700, background: 'rgba(231,76,60,0.15)', color: 'var(--live)', border: '1px solid var(--live)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={isPending} style={{
              background: 'var(--accent)', color: '#fff', border: 'none',
              borderRadius: '4px', padding: '11px', fontWeight: 700,
              fontSize: '14px', letterSpacing: '0.5px', textTransform: 'uppercase',
              opacity: isPending ? 0.7 : 1, cursor: isPending ? 'not-allowed' : 'pointer',
            }}>
              {isPending ? t.auth.register.pending : t.auth.register.submit}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>
          {t.auth.register.hasAccount}{' '}
          <Link href={`/${lang}/${empresa}`} style={{ color: 'var(--accent)', fontWeight: 700 }}>{t.auth.login.submit}</Link>
        </p>
      </div>
    </div>
  )
}
