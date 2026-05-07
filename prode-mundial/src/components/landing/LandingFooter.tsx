import Link from 'next/link'
import Image from 'next/image'

const COL_APP_ES = [
  { label: 'Funciones',     href: '#features' },
  { label: 'Precios',       href: '#precios' },
  { label: 'Cómo funciona', href: '#how' },
  { label: 'Para empresas', href: '#empresas' },
]

const COL_APP_EN = [
  { label: 'Features',     href: '#features' },
  { label: 'Pricing',      href: '#precios' },
  { label: 'How it works', href: '#how' },
  { label: 'For companies', href: '#empresas' },
]

const COL_LEGAL_ES = [
  { label: 'Privacidad', href: '/privacidad' },
  { label: 'Términos',   href: '/terminos' },
  { label: 'Contacto',   href: '/contacto' },
]

const COL_LEGAL_EN = [
  { label: 'Privacy', href: '/privacidad' },
  { label: 'Terms',   href: '/terminos' },
  { label: 'Contact', href: '/contacto' },
]

const COL_ACCOUNT_ES = [
  { label: 'Crear cuenta',    href: '/register' },
  { label: 'Iniciar sesión',  href: '/login' },
  { label: 'Mis pronósticos', href: '/mis-pronos' },
]

const COL_ACCOUNT_EN = [
  { label: 'Create account', href: '/register' },
  { label: 'Log in',         href: '/login' },
  { label: 'My predictions', href: '/mis-pronos' },
]

const TR = {
  es: {
    app: 'La App', account: 'Mi cuenta', legal: 'Legal',
    brandDesc: 'El prode del Mundial 2026. Para vos, tu familia, tus amigos y tu empresa.',
    copyright: '© 2026 Rey del Prode. Todos los derechos reservados.',
    bottom: 'Pagos procesados por MercadoPago · Hecho en Argentina 🇦🇷',
  },
  en: {
    app: 'The App', account: 'My account', legal: 'Legal',
    brandDesc: 'The World Cup 2026 pool. For you, your family, your friends and your company.',
    copyright: '© 2026 Rey del Prode. All rights reserved.',
    bottom: 'Payments processed by MercadoPago · Made in Argentina 🇦🇷',
  },
}

function ColLinks({ title, links, lang, anchor }: { title: string; links: { label: string; href: string }[]; lang: string; anchor?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#f5c518', letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: 16 }}>
        {title}
      </div>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {links.map(l => (
          <li key={l.href}>
            {anchor ? (
              <a href={l.href} className="ld-footer-link" style={{ fontSize: 13 }}>
                {l.label}
              </a>
            ) : (
              <Link href={`/${lang}${l.href}`} className="ld-footer-link" style={{ fontSize: 13 }}>
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function LandingFooter({ lang }: { lang: string }) {
  const tr = lang === 'en' ? TR.en : TR.es
  const COL_APP = lang === 'en' ? COL_APP_EN : COL_APP_ES
  const COL_LEGAL = lang === 'en' ? COL_LEGAL_EN : COL_LEGAL_ES
  const COL_ACCOUNT = lang === 'en' ? COL_ACCOUNT_EN : COL_ACCOUNT_ES

  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '60px clamp(20px, 4vw, 48px) 32px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="ld-footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <Link href={`/${lang}`} prefetch={false} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#fff', marginBottom: 16 }}>
              <Image src="/escudo.png" alt="Rey del Prode" width={36} height={36} style={{ borderRadius: 8 }} />
              <div>
                <div style={{ fontFamily: 'var(--font-bebas, var(--font-barlow))', fontSize: 20, letterSpacing: '2px', lineHeight: 1 }}>Rey del Prode</div>
                <div style={{ fontSize: 9, color: '#f5c518', letterSpacing: '3px' }}>MUNDIAL 2026</div>
              </div>
            </Link>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, maxWidth: 280 }}>
              {tr.brandDesc}
            </p>
          </div>

          <ColLinks title={tr.app}     links={COL_APP}     lang={lang} anchor />
          <ColLinks title={tr.account} links={COL_ACCOUNT} lang={lang} />
          <ColLinks title={tr.legal}   links={COL_LEGAL}   lang={lang} />
        </div>

        {/* Bottom bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)',
          flexWrap: 'wrap', gap: 12,
        }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
            {tr.copyright}
          </span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
            {tr.bottom}
          </span>
        </div>
      </div>
    </footer>
  )
}
