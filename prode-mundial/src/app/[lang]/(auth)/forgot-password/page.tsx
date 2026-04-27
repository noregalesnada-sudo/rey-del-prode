'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { forgotPassword } from '@/lib/actions/auth'
import { useDictionary, useLang } from '@/hooks/useDictionary'

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

export default function ForgotPasswordPage() {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const t = useDictionary()
  const lang = useLang()
  const lp = (path: string) => `/${lang}${path}`

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await forgotPassword(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess(true)
      }
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
          {success ? (
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '10px' }}>
                {t.auth.forgotPassword.successTitle}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5', marginBottom: '20px' }}>
                {t.auth.forgotPassword.successText}
              </p>
              <Link href={lp('/login')} style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '14px' }}>
                {t.auth.forgotPassword.backToLogin}
              </Link>
            </div>
          ) : (
            <>
              <h2 style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '8px', textAlign: 'center' }}>
                {t.auth.forgotPassword.title}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginBottom: '20px', lineHeight: '1.4' }}>
                {t.auth.forgotPassword.description}
              </p>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <input type="hidden" name="lang" value={lang} />
                <div>
                  <label style={labelStyle}>{t.auth.forgotPassword.email}</label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="tu@email.com"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
                  />
                </div>
                {error && <p style={{ color: 'var(--live)', fontSize: '13px' }}>{error}</p>}
                <button
                  type="submit"
                  disabled={isPending}
                  style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '4px', padding: '10px', fontWeight: 700, fontSize: '14px', letterSpacing: '0.5px', textTransform: 'uppercase', opacity: isPending ? 0.7 : 1, cursor: isPending ? 'not-allowed' : 'pointer' }}
                >
                  {isPending ? t.auth.forgotPassword.pending : t.auth.forgotPassword.submit}
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>
          <Link href={lp('/login')} style={{ color: 'var(--accent)', fontWeight: 700 }}>
            {t.auth.forgotPassword.backToLogin}
          </Link>
        </p>
      </div>
    </div>
  )
}
