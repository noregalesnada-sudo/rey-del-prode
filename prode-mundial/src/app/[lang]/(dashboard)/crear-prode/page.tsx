'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Trophy, Plus, Users, Lock } from 'lucide-react'
import { createProde } from '@/lib/actions/prodes'
import { useDictionary, useLang } from '@/hooks/useDictionary'

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

  const t = useDictionary()
  const lang = useLang()
  const lp = (path: string) => `/${lang}${path}`

  const PLANS = [
    {
      id: 'free',
      label: t.createProde.plans.free.label,
      price: t.pricing.free,
      priceNote: t.pricing.plans.free.priceNote,
      limit: t.pricing.plans.free.limit,
      highlight: t.createProde.plans.free.highlight,
      color: 'var(--text-muted)',
    },
    {
      id: 'pro',
      label: t.createProde.plans.pro.label,
      price: '$19.999',
      priceNote: t.pricing.plans.pro.priceNote,
      limit: t.pricing.plans.pro.limit,
      highlight: t.createProde.plans.pro.highlight,
      color: 'var(--accent)',
    },
    {
      id: 'business',
      label: t.createProde.plans.business.label,
      price: '$199.999',
      priceNote: t.pricing.plans.business.priceNote,
      limit: t.pricing.plans.business.limit,
      highlight: t.createProde.plans.business.highlight,
      color: '#FFD700',
    },
  ]

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
        router.push(lp(`/prode/${result.slug}`))
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
          {t.createProde.title}
        </h1>
      </div>

      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '28px 24px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '10px' }}>
              <label style={labelStyle}>{t.createProde.choosePlan}</label>
              <a href={lp('/precios')} target="_blank" style={{ color: 'var(--accent)', fontWeight: 400, fontSize: '11px', textDecoration: 'none' }}>
                {t.createProde.viewDetail}
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
                        <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', color: p.color }}>{p.label}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>·</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.limit}</span>
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.highlight}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '15px', fontWeight: 900, color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)' }}>{p.price}</div>
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
                    {t.createProde.promoCode}
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      name="promo_code"
                      type="text"
                      placeholder={t.createProde.promoPlaceholder}
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
                      {t.createProde.cancel}
                    </button>
                  </div>
                )}
                {!showPromo && (
                  <p style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {t.createProde.mpRedirect}
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>{t.createProde.name}</label>
            <input
              name="name" type="text" required
              placeholder={t.createProde.namePlaceholder}
              maxLength={60} style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
            />
          </div>

          <div>
            <label style={labelStyle}>{t.createProde.description} <span style={{ fontWeight: 400, textTransform: 'none' }}>{t.createProde.descOptional}</span></label>
            <textarea
              name="description"
              placeholder={t.createProde.descPlaceholder}
              rows={3} maxLength={200}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
            />
          </div>

          <div>
            <label style={labelStyle}>{t.createProde.accessType}</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setRequiresApproval(false)}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                  padding: '12px 8px', borderRadius: '6px',
                  border: `2px solid ${!requiresApproval ? 'var(--accent)' : 'var(--border-light)'}`,
                  background: !requiresApproval ? 'rgba(116, 172, 223, 0.1)' : 'var(--bg-primary)',
                  color: !requiresApproval ? 'var(--accent)' : 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <Users size={18} />
                <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.3px' }}>{t.createProde.openAccess}</span>
                <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.3 }}>
                  {t.createProde.openAccessDesc}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRequiresApproval(true)}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                  padding: '12px 8px', borderRadius: '6px',
                  border: `2px solid ${requiresApproval ? 'var(--accent)' : 'var(--border-light)'}`,
                  background: requiresApproval ? 'rgba(116, 172, 223, 0.1)' : 'var(--bg-primary)',
                  color: requiresApproval ? 'var(--accent)' : 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <Lock size={18} />
                <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.3px' }}>{t.createProde.approvalRequired}</span>
                <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.3 }}>
                  {t.createProde.approvalDesc}
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
              background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '4px',
              padding: '10px 20px', fontWeight: 700, fontSize: '14px', letterSpacing: '0.5px',
              textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              opacity: isPending ? 0.7 : 1, cursor: isPending ? 'not-allowed' : 'pointer',
            }}
          >
            <Plus size={16} />
            {isPending
              ? plan !== 'free' ? t.createProde.redirectingMp : t.createProde.creating
              : t.createProde.submit
            }
          </button>
        </form>
      </div>

      <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
        {t.createProde.inviteInfo}
      </p>
    </div>
  )
}
