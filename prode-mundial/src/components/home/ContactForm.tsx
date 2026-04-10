'use client'

import { useState, useTransition } from 'react'
import { sendContactEmail } from '@/lib/actions/contact'

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

export default function ContactForm() {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const form = e.currentTarget
    startTransition(async () => {
      const res = await sendContactEmail(formData)
      if (res?.error) {
        setResult({ type: 'error', msg: res.error })
      } else {
        setResult({ type: 'success', msg: '¡Mensaje enviado! Te respondemos a la brevedad.' })
        form.reset()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div>
          <label style={labelStyle}>Nombre completo *</label>
          <input name="nombre" type="text" required placeholder="Juan García" style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')} />
        </div>
        <div>
          <label style={labelStyle}>Teléfono</label>
          <input name="telefono" type="tel" placeholder="+54 11 1234-5678" style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div>
          <label style={labelStyle}>Email *</label>
          <input name="email" type="email" required placeholder="tu@email.com" style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')} />
        </div>
        <div>
          <label style={labelStyle}>Empresa</label>
          <input name="empresa" type="text" placeholder="Nombre de tu empresa" style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')} />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Consulta *</label>
        <textarea name="consulta" required rows={4} placeholder="Contanos en qué podemos ayudarte..."
          style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')} />
      </div>

      {result && (
        <div style={{
          padding: '10px 16px', borderRadius: '4px', fontSize: '13px', fontWeight: 700,
          background: result.type === 'success' ? 'rgba(39, 174, 96, 0.15)' : 'rgba(231, 76, 60, 0.15)',
          color: result.type === 'success' ? '#27ae60' : 'var(--live)',
          border: `1px solid ${result.type === 'success' ? '#27ae60' : 'var(--live)'}`,
        }}>
          {result.msg}
        </div>
      )}

      <button type="submit" disabled={isPending} style={{
        background: 'var(--accent)', color: '#fff', border: 'none',
        borderRadius: '4px', padding: '11px', fontWeight: 700,
        fontSize: '14px', letterSpacing: '0.5px', textTransform: 'uppercase',
        opacity: isPending ? 0.7 : 1, cursor: isPending ? 'not-allowed' : 'pointer',
        alignSelf: 'flex-start', minWidth: '160px',
      }}>
        {isPending ? 'Enviando...' : 'Enviar consulta'}
      </button>
    </form>
  )
}
