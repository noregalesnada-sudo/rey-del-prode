'use client'

import Link from 'next/link'
import LandingCountdown from './LandingCountdown'

const TR = {
  es: {
    date: 'El Mundial arranca el 11 de junio de 2026',
    h2: 'NO LLEGUES', h2em: 'tarde',
    desc: 'Creá tu prode ahora y tenés tiempo de cargar todos tus pronósticos antes del primer partido.',
    cta1: '⚽ Crear mi prode gratis',
    cta2: '🏢 Solución para empresas',
  },
  en: {
    date: 'The World Cup starts June 11, 2026',
    h2: "DON'T BE", h2em: 'late',
    desc: 'Create your pool now and have time to submit all your predictions before the first match.',
    cta1: '⚽ Create my free pool',
    cta2: '🏢 Enterprise solution',
  },
}

export default function LandingCtaFinal({ lang }: { lang: string }) {
  const lp = (p: string) => `/${lang}${p}`
  const tr = lang === 'en' ? TR.en : TR.es

  return (
    <section style={{
      padding: '120px clamp(20px, 4vw, 48px)',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      borderTop: '1px solid rgba(245,197,24,0.1)',
    }}>
      {/* Radial glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 700, height: 400, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(245,197,24,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
          <LandingCountdown lang={lang} />
        </div>

        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '3px', fontWeight: 700, marginBottom: 20 }}>
          {tr.date}
        </p>

        <h2 style={{
          fontFamily: 'var(--font-bebas, var(--font-barlow))',
          fontSize: 'clamp(48px, 7vw, 96px)',
          lineHeight: 0.9, color: '#fff', letterSpacing: '2px', marginBottom: 20,
        }}>
          {tr.h2}{' '}
          <em style={{ fontFamily: 'var(--font-instrument, Georgia, serif)', fontStyle: 'italic', color: '#f5c518' }}>{tr.h2em}</em>
        </h2>

        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 44, maxWidth: 520, margin: '0 auto 44px' }}>
          {tr.desc}
        </p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href={lp('/register')} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '16px 36px', borderRadius: 8, fontSize: 16, fontWeight: 700,
            color: '#071428', background: '#f5c518', textDecoration: 'none',
            boxShadow: '0 4px 32px rgba(245,197,24,0.45)',
            letterSpacing: '0.3px',
          }}>
            {tr.cta1}
          </Link>
          <a href="#empresas" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '16px 32px', borderRadius: 8, fontSize: 16, fontWeight: 600,
            color: '#fff', textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.22)',
            background: 'rgba(255,255,255,0.06)',
          }}>
            {tr.cta2}
          </a>
        </div>
      </div>
    </section>
  )
}
