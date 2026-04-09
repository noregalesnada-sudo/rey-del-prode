'use client'

import { useState, useTransition } from 'react'
import { Trophy, Plus } from 'lucide-react'
import { createProde } from '@/lib/actions/prodes'

export default function CrearProdePage() {
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createProde(formData)
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
    fontFamily: 'Roboto, Arial, sans-serif',
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
    <div style={{ maxWidth: '480px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <Trophy size={20} style={{ color: 'var(--accent)' }} />
        <h1 style={{ fontWeight: 900, fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Crear Prode
        </h1>
      </div>

      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '28px 24px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Nombre del prode</label>
            <input
              name="name"
              type="text"
              required
              placeholder="Ej: Prode de la Oficina"
              maxLength={60}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
            />
          </div>

          <div>
            <label style={labelStyle}>Descripción <span style={{ fontWeight: 400, textTransform: 'none' }}>(opcional)</span></label>
            <textarea
              name="description"
              placeholder="Una descripción breve..."
              rows={3}
              maxLength={200}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
            />
          </div>

          {error && <p style={{ color: 'var(--live)', fontSize: '13px' }}>{error}</p>}

          <button
            type="submit"
            disabled={isPending}
            style={{
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '10px 20px',
              fontWeight: 700,
              fontSize: '14px',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: isPending ? 0.7 : 1,
              cursor: isPending ? 'not-allowed' : 'pointer',
            }}
          >
            <Plus size={16} />
            {isPending ? 'Creando...' : 'Crear Prode'}
          </button>
        </form>
      </div>

      <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
        Al crear el prode vas a recibir un <strong style={{ color: 'var(--accent)' }}>link de invitación</strong> para compartir con tus amigos o compañeros.
      </p>
    </div>
  )
}
