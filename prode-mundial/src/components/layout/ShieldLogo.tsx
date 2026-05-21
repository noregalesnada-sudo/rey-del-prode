import Link from 'next/link'

interface ShieldLogoProps {
  onClick?: () => void
  lang?: string
}

export default function ShieldLogo({ onClick, lang }: ShieldLogoProps) {
  const isEn = lang === 'en'
  return (
    <Link href="/" onClick={onClick} style={{ textDecoration: 'none', display: 'block', padding: '14px 8px 10px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
      <img
        src={isEn ? '/prode-logo-ingles.png' : '/escudo.png'}
        alt={isEn ? 'Prediction King' : 'Rey del Prode'}
        width={108}
        style={{ display: 'block', margin: '0 auto' }}
      />
      <span style={{
        display: 'block',
        fontFamily: 'var(--font-barlow), "Barlow Condensed", Arial, sans-serif',
        fontWeight: 700,
        fontSize: '15px',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        color: 'var(--accent)',
        marginTop: '6px',
      }}>
        {isEn ? 'Prediction King' : 'Rey del Prode'}
      </span>
    </Link>
  )
}
