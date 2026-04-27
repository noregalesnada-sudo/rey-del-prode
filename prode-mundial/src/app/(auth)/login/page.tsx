'use client'

import { useState, useTransition, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/lib/actions/auth'

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

function LoginForm() {
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? ''

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await login(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {next && <input type="hidden" name="next" value={next} />}
      <div>
        <label style={labelStyle}>Email</label>
        <input name="email" type="email" required placeholder="tu@email.com" style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')} />
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>Contraseña</label>
          <Link href="/forgot-password" style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 600 }}>
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <input name="password" type="password" required placeholder="••••••••" style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')} />
      </div>

      {error && <p style={{ color: 'var(--live)', fontSize: '13px' }}>{error}</p>}

      <button type="submit" disabled={isPending}
        style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '4px', padding: '10px', fontWeight: 700, fontSize: '14px', letterSpacing: '0.5px', textTransform: 'uppercase', opacity: isPending ? 0.7 : 1, cursor: isPending ? 'not-allowed' : 'pointer' }}>
        {isPending ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  )
}

export default function LoginPage() {
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
            Iniciar sesión
          </h2>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>

        <p style={{ textAlign: 'center', marginTop: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>
          ¿No tenés cuenta?{' '}
          <Link href="/register" style={{ color: 'var(--accent)', fontWeight: 700 }}>Registrate</Link>
        </p>
      </div>
    </div>
  )
}
