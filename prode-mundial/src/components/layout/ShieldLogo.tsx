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
    </Link>
  )
}
