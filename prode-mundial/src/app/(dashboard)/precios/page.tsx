import type { Metadata } from 'next'
import Link from 'next/link'
import { Check } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Planes y Precios — Prode del Mundial 2026',
  description: 'Creá tu prode del Mundial 2026. Plan Free gratis hasta 25 jugadores, Plan Pro hasta 50 jugadores ($19.999 ARS) y Plan Business hasta 200 jugadores ($199.999 ARS). Pago único.',
  alternates: { canonical: 'https://www.reydelprode.com/precios' },
}

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: null,
    priceLabel: 'Gratis',
    priceNote: 'para siempre',
    limit: 'Hasta 25 jugadores',
    color: 'var(--text-muted)',
    accent: false,
    features: [
      'Hasta 25 jugadores por prode',
      'Leaderboard con podio',
      'Premios editables',
      'Código y link de invitación',
      'Aprobación manual de miembros',
      'Picks con auto-guardado',
    ],
    cta: 'Crear Prode gratis',
    ctaHref: '/crear-prode',
    ctaPaid: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19999,
    priceLabel: '$19.999',
    priceNote: 'pago único — todo el Mundial',
    limit: 'Hasta 50 jugadores',
    color: 'var(--accent)',
    accent: true,
    features: [
      'Hasta 50 jugadores por prode',
      'Todo lo del plan Free',
      'Foto o banner del prode',
      'Badge "Pro" en el prode',
    ],
    cta: 'Crear Prode Pro',
    ctaHref: '/crear-prode?plan=pro',
    ctaPaid: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 199999,
    priceLabel: '$199.999',
    priceNote: 'pago único — todo el Mundial',
    limit: 'Hasta 200 jugadores',
    color: '#FFD700',
    accent: false,
    features: [
      'Hasta 200 jugadores por prode',
      'Todo lo del plan Pro',
      'División por Áreas',
      'Leaderboard por Área',
      'Ranking promedio de Áreas',
      'Logo de empresa personalizado',
      'Fotos de premios',
      'Badge "Business" en el prode',
    ],
    cta: 'Crear Prode Business',
    ctaHref: '/crear-prode?plan=business',
    ctaPaid: true,
  },
]

export default function PreciosPage() {
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '40px 0 80px' }}>

      <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
        Planes
      </p>
      <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
        Precios
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '48px', maxWidth: '480px', lineHeight: 1.6 }}>
        Pago único por todo el Mundial 2026. Sin suscripciones mensuales, sin cobros sorpresa.
      </p>

      {/* Cards de planes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '48px' }}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            style={{
              background: 'var(--card-bg, #0d2545)',
              border: `2px solid ${plan.accent ? 'var(--accent)' : 'rgba(116,172,223,0.15)'}`,
              borderRadius: '10px',
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            {plan.accent && (
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'var(--accent)',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 900,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                padding: '4px 12px',
                borderRadius: '20px',
              }}>
                Más popular
              </div>
            )}

            <div style={{ marginBottom: '4px' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: plan.color,
              }}>
                {plan.name}
              </span>
            </div>

            <div style={{ marginBottom: '4px' }}>
              <span style={{ fontSize: '30px', fontWeight: 900, color: 'var(--text-primary)' }}>
                {plan.priceLabel}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              {plan.priceNote}
            </div>
            <div style={{
              fontSize: '12px',
              fontWeight: 700,
              color: plan.color,
              marginBottom: '24px',
              paddingBottom: '20px',
              borderBottom: '1px solid rgba(116,172,223,0.1)',
            }}>
              {plan.limit}
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              {plan.features.map((f, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  <Check size={14} style={{ color: plan.color, flexShrink: 0, marginTop: '1px' }} />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href={plan.ctaHref}
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '11px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                textDecoration: 'none',
                background: plan.accent ? 'var(--accent)' : 'transparent',
                color: plan.accent ? '#fff' : plan.color,
                border: plan.accent ? 'none' : `2px solid ${plan.color}`,
              }}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      {/* Enterprise */}
      <div style={{
        background: 'var(--card-bg, #0d2545)',
        border: '1px solid rgba(116,172,223,0.12)',
        borderRadius: '8px',
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            ¿Más de 300 participantes?
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Para empresas grandes armamos una solución a medida. Contactanos y te cotizamos.
          </div>
        </div>
        <a
          href="mailto:agencia@posicionarte.online"
          style={{
            padding: '10px 20px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            textDecoration: 'none',
            border: '1px solid rgba(116,172,223,0.3)',
            color: 'var(--text-muted)',
            whiteSpace: 'nowrap',
          }}
        >
          Contactar
        </a>
      </div>

      {/* Nota pie */}
      <p style={{ marginTop: '32px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
        Los pagos se procesan de forma segura a través de MercadoPago.
        Ante consultas sobre comprobantes de pago podés contactarnos por email.
      </p>

    </div>
  )
}
