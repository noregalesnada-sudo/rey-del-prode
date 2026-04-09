'use client'

import { useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { Trophy } from 'lucide-react'
import Link from 'next/link'
import { login } from '@/lib/actions/auth'

export default function LoginPage() {
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
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Trophy size={28} style={{ color: 'var(--accent)' }} />
            <span style={{ fontWeight: 900, fontSize: '24px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
              PRODE <span style={{ color: 'var(--accent)' }}>2026</span>
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Mundial de Fútbol</p>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '28px 24px' }}>
          <h2 style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '20px' }}>
            Iniciar sesión
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {next && <input type="hidden" name="next" value={next} />}
            <div>
              <label style={labelStyle}>Email</label>
              <input name="email" type="email" required placeholder="tu@email.com" style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')} />
            </div>
            <div>
              <label style={labelStyle}>Contraseña</label>
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
        </div>

        <p style={{ textAlign: 'center', marginTop: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>
          ¿No tenés cuenta?{' '}
          <Link href="/register" style={{ color: 'var(--accent)', fontWeight: 700 }}>Registrate</Link>
        </p>
      </div>
    </div>
  )
}
