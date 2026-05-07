import EnterpriseContactForm from '@/components/home/EnterpriseContactForm'

const PERKS_ES = [
  { n: '01', title: 'Jugadores ilimitados',             desc: 'Sin restricciones de participantes. Toda tu empresa en un solo prode.' },
  { n: '02', title: 'Branding 100% personalizado',       desc: 'Logo, colores y nombre de la empresa en toda la experiencia.' },
  { n: '03', title: 'Ranking por área o gerencia',       desc: 'Competencia interna por departamentos, no solo individual.' },
  { n: '04', title: 'Panel de administración exclusivo', desc: 'Control total: whitelist, aprobación, estadísticas y configuración.' },
  { n: '05', title: 'Soporte técnico prioritario',       desc: 'Acompañamiento durante todo el torneo. Respondemos rápido.' },
]

const PERKS_EN = [
  { n: '01', title: 'Unlimited players',        desc: 'No participant restrictions. Your entire company in one pool.' },
  { n: '02', title: '100% custom branding',     desc: 'Company logo, colors and name throughout the entire experience.' },
  { n: '03', title: 'Ranking by department',    desc: 'Internal competition by departments, not just individual.' },
  { n: '04', title: 'Exclusive admin panel',    desc: 'Full control: whitelist, approval, statistics and configuration.' },
  { n: '05', title: 'Priority tech support',    desc: 'Assistance throughout the entire tournament. We respond fast.' },
]

const TR = {
  es: {
    label: 'CONTACTO PARA EMPRESAS',
    h2a: 'EL MUNDIAL',
    h2em: 'une',
    h2b: 'A TU EMPRESA',
    subtitle: 'Generá engagement real entre tus empleados durante el Mundial. Sin límites, con tu marca y con datos de participación en tiempo real.',
    formTitle: 'Solicitá información',
    formDesc: 'Sin compromisos. Analizamos tu caso y armamos una propuesta a medida. Pago único por torneo.',
  },
  en: {
    label: 'CONTACT FOR COMPANIES',
    h2a: 'THE WORLD CUP',
    h2em: 'unites',
    h2b: 'YOUR COMPANY',
    subtitle: 'Generate real engagement among your employees during the World Cup. No limits, with your brand and real-time participation data.',
    formTitle: 'Request information',
    formDesc: 'No commitment. We analyze your case and put together a custom proposal. One-time payment per tournament.',
  },
}

export default function LandingEmpresas({ lang = 'es' }: { lang?: string }) {
  const PERKS = lang === 'en' ? PERKS_EN : PERKS_ES
  const tr = lang === 'en' ? TR.en : TR.es
  return (
    <section id="empresas" style={{
      padding: '100px clamp(20px, 4vw, 48px)',
      background: 'rgba(13, 43, 85, 0.6)',
      borderTop: '1px solid rgba(245,197,24,0.08)',
      borderBottom: '1px solid rgba(245,197,24,0.08)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Section label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ height: 1, width: 32, background: '#f5c518' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#f5c518', letterSpacing: '3px', textTransform: 'uppercase' }}>
            {tr.label}
          </span>
        </div>

        <div className="ld-empresas-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
          {/* LEFT — perks */}
          <div>
            <h2 style={{
              fontFamily: 'var(--font-bebas, var(--font-barlow))',
              fontSize: 'clamp(40px, 5vw, 60px)',
              lineHeight: 0.95, color: '#fff', letterSpacing: '1px', marginBottom: 16,
            }}>
              {tr.h2a}{' '}
              <em style={{ fontFamily: 'var(--font-instrument, Georgia, serif)', fontStyle: 'italic', color: '#f5c518' }}>{tr.h2em}</em>
              <br />{tr.h2b}
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 40, maxWidth: 440 }}>
              {tr.subtitle}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {PERKS.map(p => (
                <div key={p.n} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: 'rgba(245,197,24,0.1)', border: '1px solid rgba(245,197,24,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-bebas, var(--font-barlow))', fontSize: 13, color: '#f5c518',
                  }}>
                    {p.n}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 }}>
                      {p.title}
                    </div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                      {p.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — contact form */}
          <div style={{
            background: 'rgba(13,43,85,0.6)',
            border: '1px solid rgba(245,197,24,0.15)',
            borderRadius: 20, padding: '40px 36px',
          }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                {tr.formTitle}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                {tr.formDesc}
              </div>
            </div>
            <EnterpriseContactForm />
          </div>
        </div>
      </div>
    </section>
  )
}
