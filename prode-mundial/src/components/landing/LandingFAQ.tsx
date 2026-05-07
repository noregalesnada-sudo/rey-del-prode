'use client'

import { useState } from 'react'
import Link from 'next/link'

const FAQS_ES = [
  {
    q: '¿Cómo funciona el sistema de puntos?',
    a: 'Sumás puntos por cada partido según tu pronóstico: 3 puntos si acertás el resultado exacto, 2 puntos si acertás el ganador con diferencia de goles correcta, y 1 punto si solo acertás el ganador. En fases eliminatorias los puntos se multiplican. El pick del campeón suma puntos extra al final.',
  },
  {
    q: '¿Puedo crear más de un prode privado?',
    a: 'Sí. Podés crear y participar en múltiples prodes al mismo tiempo: el de la familia, el del trabajo, el del club. Cada grupo tiene su propio ranking separado.',
  },
  {
    q: '¿Qué diferencia hay entre Free y Pro?',
    a: 'El plan Free te da todo lo esencial hasta 25 jugadores, de forma gratuita y para siempre. El plan Pro sube el límite a 50 jugadores y agrega foto de grupo, badge exclusivo y soporte directo. Es un pago único por todo el Mundial 2026.',
  },
  {
    q: '¿El pago es seguro?',
    a: 'Sí. Los pagos se procesan a través de MercadoPago, la plataforma de pagos más utilizada de Latinoamérica. Nunca almacenamos datos de tu tarjeta.',
  },
  {
    q: '¿Puedo cargar pronósticos antes de que empiece el torneo?',
    a: 'Sí, podés cargar todos tus pronósticos con anticipación. Incluso antes de que arranque el primer partido podés tener todos los picks cargados. Solo se bloquean cuando empieza cada partido.',
  },
  {
    q: '¿Funciona para empresas grandes?',
    a: 'Sí, tenemos un plan Enterprise pensado para empresas sin límite de jugadores, con branding personalizado, panel de administración, ranking por área y soporte técnico prioritario. Completá el formulario de contacto y armamos la propuesta a medida.',
  },
]

const FAQS_EN = [
  {
    q: 'How does the scoring system work?',
    a: 'You earn points for each match based on your prediction: 3 points for an exact score, 2 points for the correct winner with the right goal difference, and 1 point for correctly picking the winner. Points multiply in knockout rounds. The champion pick earns bonus points at the end.',
  },
  {
    q: 'Can I create more than one private pool?',
    a: 'Yes. You can create and participate in multiple pools at the same time: the family one, the work one, the club one. Each group has its own separate ranking.',
  },
  {
    q: "What's the difference between Free and Pro?",
    a: 'The Free plan gives you everything essential for up to 25 players, completely free forever. The Pro plan raises the limit to 50 players and adds a group photo, exclusive badge and direct support. It\'s a one-time payment for the entire 2026 World Cup.',
  },
  {
    q: 'Is payment secure?',
    a: 'Yes. Payments are processed through MercadoPago, the most widely used payment platform in Latin America. We never store your card data.',
  },
  {
    q: 'Can I submit predictions before the tournament starts?',
    a: 'Yes, you can submit all your predictions in advance. Even before the first match kicks off you can have all your picks in. They only lock when each match begins.',
  },
  {
    q: 'Does it work for large companies?',
    a: "Yes, we have an Enterprise plan designed for companies with unlimited players, custom branding, admin panel, ranking by department and priority technical support. Fill out the contact form and we'll put together a tailored proposal.",
  },
]

const TR = {
  es: {
    label: 'FAQ',
    h2: 'DUDAS', h2em: 'frecuentes',
    subtitle: 'Si no encontrás lo que buscás, escribinos por WhatsApp y te respondemos al toque.',
    contact: 'Contactar →',
  },
  en: {
    label: 'FAQ',
    h2: 'FREQUENTLY', h2em: 'asked questions',
    subtitle: "If you don't find what you're looking for, message us on WhatsApp and we'll reply right away.",
    contact: 'Contact us →',
  },
}

export default function LandingFAQ({ lang }: { lang: string }) {
  const [open, setOpen] = useState<number | null>(0)
  const FAQS = lang === 'en' ? FAQS_EN : FAQS_ES
  const tr = lang === 'en' ? TR.en : TR.es

  return (
    <section id="faq" style={{
      padding: '100px clamp(20px, 4vw, 48px)',
      borderTop: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 80, alignItems: 'start' }} className="ld-empresas-grid">
          {/* LEFT */}
          <div style={{ position: 'sticky', top: 120 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ height: 1, width: 32, background: '#f5c518' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#f5c518', letterSpacing: '3px', textTransform: 'uppercase' }}>{tr.label}</span>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-bebas, var(--font-barlow))',
              fontSize: 'clamp(40px, 4vw, 56px)',
              lineHeight: 0.95, color: '#fff', letterSpacing: '1px', marginBottom: 20,
            }}>
              {tr.h2}{' '}
              <em style={{ fontFamily: 'var(--font-instrument, Georgia, serif)', fontStyle: 'italic', color: '#f5c518' }}>{tr.h2em}</em>
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 28 }}>
              {tr.subtitle}
            </p>
            <Link href={`/${lang}/contacto`} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '11px 22px', borderRadius: 8, fontSize: 13, fontWeight: 700,
              color: '#050d1a', background: '#f5c518', textDecoration: 'none',
            }}>
              {tr.contact}
            </Link>
          </div>

          {/* RIGHT — accordion */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{
                border: '1px solid',
                borderColor: open === i ? 'rgba(245,197,24,0.25)' : 'rgba(255,255,255,0.06)',
                borderRadius: 12,
                background: open === i ? 'rgba(245,197,24,0.04)' : 'transparent',
                overflow: 'hidden',
                transition: 'border-color 0.2s, background 0.2s',
              }}>
                <button onClick={() => setOpen(open === i ? null : i)} style={{
                  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '20px 24px', background: 'none', border: 'none', cursor: 'pointer',
                  color: '#fff', textAlign: 'left', gap: 16,
                }}>
                  <span style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>{faq.q}</span>
                  <span style={{
                    flexShrink: 0, width: 24, height: 24, borderRadius: '50%',
                    border: '1px solid rgba(245,197,24,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, color: '#f5c518',
                    transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s ease',
                  }}>
                    +
                  </span>
                </button>
                {open === i && (
                  <div style={{ padding: '0 24px 22px', fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
