import Link from 'next/link'

interface ShieldLogoProps {
  onClick?: () => void
}

export default function ShieldLogo({ onClick }: ShieldLogoProps) {
  return (
    <Link href="/" onClick={onClick} style={{ textDecoration: 'none', display: 'block', padding: '14px 8px 10px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
      <img
        src="/escudo.png"
        alt="Rey del Prode"
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
        Rey del Prode
      </span>
    </Link>
  )
}
