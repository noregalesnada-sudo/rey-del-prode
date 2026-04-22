import type { Metadata } from 'next'
import Link from 'next/link'
import { Check } from 'lucide-react'
import EnterpriseContactForm from '@/components/home/EnterpriseContactForm'
import { getDictionary, hasLocale } from '@/app/[lang]/dictionaries'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Planes y Precios — Prode del Mundial 2026',
  description: 'Creá tu prode del Mundial 2026. Plan Free gratis hasta 25 jugadores, Plan Pro hasta 50 jugadores ($19.999 ARS) y Plan Business hasta 150 jugadores ($199.999 ARS). Pago único.',
  alternates: { canonical: 'https://www.reydelprode.com/precios' },
}

const PLAN_IDS = ['free', 'pro', 'business'] as const
type PlanId = typeof PLAN_IDS[number]

const planMeta: Record<PlanId, { name: string; price: string | null; priceLabel: string; color: string; accent: boolean }> = {
  free:     { name: 'Free',     price: null,     priceLabel: 'Gratis',    color: 'var(--text-muted)', accent: false },
  pro:      { name: 'Pro',      price: '19.999', priceLabel: '$19.999',   color: 'var(--accent)',     accent: true  },
  business: { name: 'Business', price: '199.999',priceLabel: '$199.999',  color: '#FFD700',           accent: false },
}

export default async function PreciosPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const t = await getDictionary(lang)
  const lp = (path: string) => `/${lang}${path}`

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '40px 0 80px' }}>
      <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
        {t.pricing.label}
      </p>
      <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
        {t.pricing.title}
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '48px', maxWidth: '480px', lineHeight: 1.6 }}>
        {t.pricing.subtitle}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '48px' }}>
        {PLAN_IDS.map((id) => {
          const meta = planMeta[id]
          const tp = t.pricing.plans[id]
          return (
            <div key={id} style={{
              background: 'var(--card-bg, #0d2545)',
              border: `2px solid ${meta.accent ? 'var(--accent)' : 'rgba(116,172,223,0.15)'}`,
              borderRadius: '10px', padding: '28px 24px',
              display: 'flex', flexDirection: 'column', position: 'relative',
            }}>
              {meta.accent && (
                <div style={{
                  position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--accent)', color: '#fff', fontSize: '10px', fontWeight: 900,
                  letterSpacing: '1.5px', textTransform: 'uppercase', padding: '4px 12px', borderRadius: '20px',
                }}>
                  {t.pricing.mostPopular}
                </div>
              )}
              <div style={{ marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: meta.color }}>{meta.name}</span>
              </div>
              <div style={{ marginBottom: '4px' }}>
                <span style={{ fontSize: '30px', fontWeight: 900, color: 'var(--text-primary)' }}>{meta.priceLabel}</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                {id === 'free' ? t.pricing.free + ' ' + t.pricing.forever : tp.priceNote}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: meta.color, marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid rgba(116,172,223,0.1)' }}>
                {tp.limit}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                {tp.features.map((f: string, i: number) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    <Check size={14} style={{ color: meta.color, flexShrink: 0, marginTop: '1px' }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={lp(id === 'free' ? '/crear-prode' : `/crear-prode?plan=${id}`)}
                style={{
                  display: 'block', textAlign: 'center', padding: '11px 16px', borderRadius: '6px',
                  fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', textDecoration: 'none',
                  background: meta.accent ? 'var(--accent)' : 'transparent',
                  color: meta.accent ? '#fff' : meta.color,
                  border: meta.accent ? 'none' : `2px solid ${meta.color}`,
                }}
              >
                {tp.cta}
              </Link>
            </div>
          )
        })}
      </div>

      {/* Enterprise */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,215,0,0.06) 0%, rgba(13,37,69,1) 60%)',
        border: '1px solid rgba(255,215,0,0.25)', borderRadius: '10px', padding: '28px 32px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          display: 'inline-block', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px',
          padding: '3px 10px', borderRadius: '20px', background: 'rgba(255,215,0,0.15)', color: '#FFD700',
          border: '1px solid rgba(255,215,0,0.3)', marginBottom: '12px',
        }}>
          Enterprise
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
          <div style={{ flex: '1 1 320px' }}>
            <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t.pricing.enterprise.title}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6, maxWidth: '480px' }}>
              {t.pricing.enterprise.desc}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              {t.pricing.enterprise.features.map((text: string) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <Check size={13} style={{ color: '#FFD700', flexShrink: 0 }} />
                  {text}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', justifyContent: 'center' }}>
            <div style={{ fontSize: '12px', color: 'rgba(255,215,0,0.6)', textAlign: 'right', letterSpacing: '0.5px' }}>
              {t.pricing.enterprise.pricing}
            </div>
            <EnterpriseContactForm />
          </div>
        </div>
      </div>

      <p style={{ marginTop: '32px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
        {t.pricing.footer}
      </p>
    </div>
  )
}
