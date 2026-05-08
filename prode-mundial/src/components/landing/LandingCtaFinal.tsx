'use client'

import Link from 'next/link'
import LandingCountdown from './LandingCountdown'

const TR = {
  es: {
    date: 'El Mundial arranca el 11 de junio de 2026',
    h2: 'NO LLEGUES', h2em: 'tarde',
    desc: 'Creá tu prode ahora y tenés tiempo de cargar todos tus pronósticos antes del primer partido.',
    cta1: 'Crear mi prode gratis',
    cta2: 'Solución para empresas',
  },
  en: {
    date: 'The World Cup starts June 11, 2026',
    h2: "DON'T BE", h2em: 'late',
    desc: 'Create your pool now and have time to submit all your predictions before the first match.',
    cta1: 'Create my free pool',
    cta2: 'Enterprise solution',
  },
}

const IconSoccer = () => (
  <svg width="20" height="20" viewBox="0 0 288.906 288.906" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M288.906,144.453C288.906,64.802,224.104,0,144.453,0S0,64.802,0,144.453s64.802,144.453,144.453,144.453
      S288.906,224.104,288.906,144.453z M18.089,139.94l18.897,10.91v45.576l-6.13,3.539C22.629,183.198,18,164.357,18,144.453
      C18,142.942,18.036,141.439,18.089,139.94z M270.906,144.453c0,20.447-4.884,39.773-13.538,56.882l-8.502-4.909v-45.576
      l21.885-12.635C270.852,140.282,270.906,142.361,270.906,144.453z M59.717,50.673l25.739,14.861v45.576l-39.47,22.788
      l-25.452-14.695C26.012,92.281,40.07,68.443,59.717,50.673z M268.034,117.634l-28.168,16.263l-39.47-22.788V65.534
      l27.589-15.929C247.873,67.14,262.219,90.814,268.034,117.634z M133.927,196.426l-39.471,22.788l-39.47-22.788v-45.576
      l39.47-22.788l39.471,22.788V196.426z M103.456,65.534l39.471-22.788l39.47,22.788v45.576l-39.47,22.788
      l-39.471-22.788V65.534z M151.927,150.851l39.47-22.788l39.47,22.788v45.576l-39.47,22.788l-39.47-22.788V150.851z
      M200.396,234.944l39.47-22.789l8.183,4.724c-12.155,17.334-28.543,31.488-47.652,40.955V234.944z
      M191.396,49.804l-39.47-22.789v-8.788c22.102,1.295,42.696,8.287,60.33,19.533L191.396,49.804z
      M133.927,27.016L94.456,49.804L75.215,38.695c17.141-11.26,37.167-18.469,58.712-20.253V27.016z
      M45.986,212.156l39.47,22.789v21.326c-18.257-9.672-33.875-23.68-45.472-40.649L45.986,212.156z
      M103.456,234.944l39.471-22.789l39.47,22.789v30.143c-11.983,3.777-24.729,5.819-37.943,5.819
      c-14.343,0-28.135-2.405-40.997-6.826V234.944z"/>
  </svg>
)

const IconTrophy = () => (
  <svg width="30" height="30" viewBox="0 0 254.395 254.395" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="m192.943,65.744c0-36.252-29.493-65.744-65.746-65.744s-65.746,29.492-65.746,65.744
      c0,8.336 2.527,17.966 2.928,19.428l-0.005,0.002c2.372,8.184 5.919,16.047 9.674,24.371
      8.383,18.584 17.884,39.646 17.884,72.492 0,31.751-11.003,54.982-14.375,61.346
      -1.231,2.324-1.155,5.125 0.201,7.379 1.356,2.254 3.795,3.633 6.426,3.633h86.027
      c2.631,0 5.069-1.379 6.426-3.633 1.356-2.254 1.433-5.055 0.201-7.379
      -3.372-6.363-14.375-29.595-14.375-61.346 0-32.846 9.501-53.909 17.884-72.492
      3.756-8.324 7.302-16.188 9.674-24.371l-0.005-0.002c0.4-1.462 2.927-11.092 2.927-19.428z
      m-65.746-50.744c27.981,0 50.746,22.764 50.746,50.744 0,4.252-0.977,9.384-1.671,12.5
      -4.14-3.532-9.335-5.471-14.836-5.471-5.947,0-11.538,2.267-15.82,6.365
      -9.241-19.319-20.956-37.527-33.477-41.461-5.293-1.664-10.53-0.935-15.145,2.109
      -5.938,3.917-11.336,13.153-4.863,30.967 1.761,5.535-1.198,11.378-4.812,12.539
      -4.222,1.356-8.778-2.598-9.777-7.852-0.559-2.937-1.092-6.558-1.092-9.697
      0.001-27.979 22.766-50.743 50.747-50.743z
      m6.171,116.953c-0.585-20.371-6.166-29.321-13.89-41.708l-1.035-1.661
      c-18.402-29.593-14.747-35.248-13.188-36.275 0.833-0.549 1.414-0.628 2.388-0.32
      6.678,2.098 19.291,18.981 32.42,51.971 1.138,2.891 2.854,5.549 5.116,7.811
      4.007,4.008 9.243,6.321 14.854,6.646-6.616,16.348-12.624,36.411-12.624,63.5
      0,10.494 1.064,20.105 2.672,28.668h-42.479c17.972-32.958 26.406-54.483 25.711-78.753z
      m33.667-30.67c-1.495,1.496-3.483,2.319-5.599,2.319-2.114,0-4.102-0.823-5.597-2.319
      -1.495-1.494-2.318-3.48-2.318-5.594 0-2.114 0.824-4.102 2.319-5.598
      1.495-1.496 3.482-2.318 5.596-2.318 2.114,0 4.102,0.823 5.598,2.318
      s2.318,3.482 2.318,5.597c0.001,2.115-0.823,4.102-2.317,5.595z
      m-79.314,2.094c-0.743-1.647-1.473-3.271-2.188-4.882 0.131,0.003 0.261,0.018 0.393,0.018
      1.978,0 3.973-0.3 5.944-0.926 4.087-1.303 7.552-3.813 10.188-7.07
      1.202,2.019 2.425,4.021 3.647,5.986l1.045,1.678c7.193,11.536 11.156,17.891 11.624,34.201
      0.399,13.971-2.556,27.127-11.471,46.622-0.576-34.37-10.866-57.191-19.182-75.627z
      m8.183,136.018c1.576-3.885 3.229-8.475 4.762-13.689h53.062
      c1.533,5.215 3.186,9.805 4.762,13.689h-62.586z"/>
  </svg>
)

export default function LandingCtaFinal({ lang }: { lang: string }) {
  const lp = (p: string) => `/${lang}${p}`
  const tr = lang === 'en' ? TR.en : TR.es

  return (
    <section style={{
      padding: '120px clamp(20px, 4vw, 48px)',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: '#ffffff',
      borderTop: '3px solid #74ACDF',
      borderBottom: '3px solid #74ACDF',
    }}>
      <style>{`
        .cta-btn-primary {
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .cta-btn-primary:hover {
          background: rgba(116,172,223,0.18) !important;
          border-color: #74ACDF !important;
          transform: translateY(-3px);
        }
        .cta-btn-primary:active { transform: scale(0.97); }

        .cta-btn-secondary {
          transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
        }
        .cta-btn-secondary:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 10px 44px rgba(245,197,24,0.65) !important;
        }
        .cta-btn-secondary:active { transform: scale(0.97); }
      `}</style>

      {/* Radial glow celeste */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 700, height: 400, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(116,172,223,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
          <LandingCountdown lang={lang} theme="light" />
        </div>

        <p style={{ fontSize: 18, color: 'rgba(0,0,0,0.75)', textTransform: 'uppercase', letterSpacing: '3px', fontWeight: 700, marginBottom: 20 }}>
          {tr.date}
        </p>

        <h2 style={{
          fontFamily: 'var(--font-bebas, var(--font-barlow))',
          fontSize: 'clamp(48px, 7vw, 96px)',
          lineHeight: 0.9, color: '#74ACDF', letterSpacing: '2px', marginBottom: 20,
        }}>
          {tr.h2}{' '}
          <em style={{ fontFamily: 'var(--font-instrument, Georgia, serif)', fontStyle: 'italic', color: '#f5c518' }}>{tr.h2em}</em>
        </h2>

        <p style={{ fontSize: 17, color: 'rgba(16,66,112,0.65)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 44px' }}>
          {tr.desc}
        </p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href={lp('/register')} className="cta-btn-primary" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '16px 36px', borderRadius: 8, fontSize: 16, fontWeight: 700,
            color: '#2a77c0', textDecoration: 'none',
            border: '1px solid rgba(116,172,223,0.4)',
            boxShadow: '0 4px 32px rgba(245,197,24,0.45)',
            background: 'rgba(116,172,223,0.06)',
            letterSpacing: '0.3px',
          }}>
            <IconSoccer />
            {tr.cta1}
          </Link>
          <a href="#empresas" className="cta-btn-secondary" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '16px 32px', borderRadius: 8, fontSize: 16, fontWeight: 600,
            color: '#071428', background: '#f5c518', textDecoration: 'none',
            boxShadow: '0 4px 32px rgba(245,197,24,0.45)',
          }}>
            <IconTrophy />
            {tr.cta2}
          </a>
        </div>
      </div>
    </section>
  )
}
