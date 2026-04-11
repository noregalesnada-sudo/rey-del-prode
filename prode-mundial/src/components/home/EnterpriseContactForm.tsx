'use client'

import { useState, useTransition } from 'react'
import { submitEnterpriseContact } from '@/lib/actions/enterprise'

const employeeOptions = [
  '1 – 50',
  '51 – 150',
  '151 – 300',
  '301 – 500',
  'Más de 500',
]

export default function EnterpriseContactForm() {
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const res = await submitEnterpriseContact(fd)
      if (res?.error) {
        setError(res.error)
      } else {
        setDone(true)
      }
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: '12px 28px',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          cursor: 'pointer',
          background: 'rgba(255,215,0,0.12)',
          border: '2px solid rgba(255,215,0,0.4)',
          color: '#FFD700',
          whiteSpace: 'nowrap',
          transition: 'background 0.15s',
        }}
      >
        Solicitar información
      </button>
    )
  }

  return (
    <div style={{
      marginTop: '24px',
      background: 'rgba(0,0,0,0.2)',
      border: '1px solid rgba(255,215,0,0.15)',
      borderRadius: '8px',
      padding: '24px 28px',
    }}>
      {done ? (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#4ade80', marginBottom: '6px' }}>
            Mensaje recibido
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Nos ponemos en contacto con vos a la brevedad para darte todos los detalles y armar la propuesta.
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Completá tus datos y te contactamos nosotros
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Sin compromisos. Analizamos tu caso y te armamos una propuesta.
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '4px' }}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Nombre completo</label>
                <input name="nombre" required placeholder="Juan Pérez" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input name="email" type="email" required placeholder="juan@empresa.com" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Teléfono</label>
                <input name="telefono" placeholder="+54 11 1234-5678" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Empresa</label>
                <input name="empresa" required placeholder="Nombre de la empresa" style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Empleados aproximados</label>
              <select name="empleados" required style={{ ...inputStyle, appearance: 'none' as const }}>
                <option value="">Seleccioná una opción</option>
                {employeeOptions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            {error && (
              <div style={{ fontSize: '12px', color: '#ef4444' }}>{error}</div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  padding: '10px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 700,
                  background: 'none', border: '1px solid rgba(116,172,223,0.2)',
                  color: 'var(--text-muted)', cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                style={{
                  padding: '10px 24px', borderRadius: '6px', fontSize: '13px', fontWeight: 800,
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                  background: isPending ? 'rgba(255,215,0,0.08)' : 'rgba(255,215,0,0.15)',
                  border: '2px solid rgba(255,215,0,0.4)', color: '#FFD700',
                  cursor: isPending ? 'not-allowed' : 'pointer',
                }}
              >
                {isPending ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: 'var(--text-muted)',
  marginBottom: '5px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(116,172,223,0.06)',
  border: '1px solid rgba(116,172,223,0.2)',
  borderRadius: '6px',
  padding: '9px 12px',
  fontSize: '13px',
  color: 'var(--text-primary)',
  outline: 'none',
  boxSizing: 'border-box',
}
