'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Trophy, Plus, Users, Lock } from 'lucide-react'
import { createProde } from '@/lib/actions/prodes'

const PLANS = [
  {
    id: 'free',
    label: 'Free',
    price: 'Gratis',
    priceNote: 'para siempre',
    limit: 'Hasta 25 jugadores',
    highlight: 'Ideal para amigos y familia',
    color: 'var(--text-muted)',
  },
  {
    id: 'pro',
    label: 'Pro',
    price: '$19.999',
    priceNote: 'pago único',
    limit: 'Hasta 50 jugadores',
    highlight: 'Banner y foto personalizados',
    color: 'var(--accent)',
  },
  {
    id: 'business',
    label: 'Business',
    price: '$199.999',
    priceNote: 'pago único',
    limit: 'Hasta 300 jugadores',
    highlight: 'Áreas, logo y ranking grupal',
    color: '#FFD700',
  },
]

export default function CrearProdePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialPlan = searchParams.get('plan') ?? 'free'
  const validInitial = ['free', 'pro', 'business'].includes(initialPlan) ? initialPlan : 'free'

  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const [requiresApproval, setRequiresApproval] = useState(false)
  const [plan, setPlan] = useState(validInitial)
  const [showPromo, setShowPromo] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    formData.set('plan', plan)
    startTransition(async () => {
      const result = await createProde(formData)
      if (result?.mpUrl) {
        window.location.href = result.mpUrl
        return
      }
      if (result?.error) {
        setError(result.error)
        return
      }
      if (result?.slug) {
        router.push(`/prode/${result.slug}`)
      }
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <Trophy size={20} style={{ color: 'var(--accent)' }} />
        <h1 style={{ fontWeight: 900, fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Crear Prode
        </h1>
      </div>

      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '28px 24px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Selector de plan */}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '10px' }}>
              <label style={labelStyle}>Elegí tu plan</label>
              <a href="/precios" target="_blank" style={{ color: 'var(--accent)', fontWeight: 400, fontSize: '11px', textDecoration: 'none' }}>
                ver detalle completo
              </a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {PLANS.map((p) => {
                const isSelected = plan === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlan(p.id)}
                    style={{
                      width: '100%',
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '14px 16px',
                      borderRadius: '8px',
                      border: `2px solid ${isSelected ? p.color : 'var(--border-light)'}`,
                      background: isSelected ? 'rgba(116,172,223,0.07)' : 'var(--bg-primary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', color: p.color }}>
                          {p.label}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>·</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.limit}</span>
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.highlight}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '15px', fontWeight: 900, color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {p.price}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{p.priceNote}</div>
                    </div>
                  </button>
                )
              })}
            </div>
            {plan !== 'free' && (
              <div style={{ marginTop: '10px' }}>
                {!showPromo ? (
                  <button
                    type="button"
                    onClick={() => setShowPromo(true)}
                    style={{ background: 'none', border: 'none', padding: 0, color: 'var(--accent)', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Tengo un código promocional
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      name="promo_code"
                      type="text"
                      placeholder="Código promo"
                      maxLength={30}
                      style={{ ...inputStyle, width: 'auto', flex: 1, textTransform: 'uppercase', letterSpacing: '1px' }}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPromo(false)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer' }}
                    >
                      Cancelar
                    </button>
                  </div>
                )}
                {!showPromo && (
                  <p style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Al crear el prode serás redirigido a MercadoPago para completar el pago.
                  </p>
                )}
              </div>
            )}
          </div>

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

          {/* Toggle entrada libre / aprobación */}
          <div>
            <label style={labelStyle}>Tipo de acceso</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setRequiresApproval(false)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 8px',
                  borderRadius: '6px',
                  border: `2px solid ${!requiresApproval ? 'var(--accent)' : 'var(--border-light)'}`,
                  background: !requiresApproval ? 'rgba(116, 172, 223, 0.1)' : 'var(--bg-primary)',
                  color: !requiresApproval ? 'var(--accent)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Users size={18} />
                <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.3px' }}>Entrada libre</span>
                <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.3 }}>
                  Cualquiera con el código entra
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRequiresApproval(true)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 8px',
                  borderRadius: '6px',
                  border: `2px solid ${requiresApproval ? 'var(--accent)' : 'var(--border-light)'}`,
                  background: requiresApproval ? 'rgba(116, 172, 223, 0.1)' : 'var(--bg-primary)',
                  color: requiresApproval ? 'var(--accent)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Lock size={18} />
                <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.3px' }}>Con aprobación</span>
                <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.3 }}>
                  Vos aceptás a cada jugador
                </span>
              </button>
            </div>
            <input type="hidden" name="requires_approval" value={requiresApproval ? '1' : '0'} />
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
            {isPending
              ? plan !== 'free' ? 'Redirigiendo a MercadoPago...' : 'Creando...'
              : 'Crear Prode'
            }
          </button>
        </form>
      </div>

      <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
        Al crear el prode vas a recibir un <strong style={{ color: 'var(--accent)' }}>código de invitación</strong> para compartir con tus amigos o compañeros.
      </p>
    </div>
  )
}
