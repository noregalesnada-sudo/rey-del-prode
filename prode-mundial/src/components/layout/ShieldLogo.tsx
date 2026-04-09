import Link from 'next/link'

interface ShieldLogoProps {
  onClick?: () => void
}

export default function ShieldLogo({ onClick }: ShieldLogoProps) {
  return (
    <Link href="/" onClick={onClick} style={{ textDecoration: 'none', display: 'block', padding: '14px 8px 10px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
      <svg viewBox="0 0 120 152" width="108" style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}>

        {/* Corona encima del escudo */}
        <g transform="translate(34, 0)">
          {/* Base de la corona */}
          <rect x="1" y="18" width="50" height="5" rx="2.5" fill="#C9A84C" />
          {/* Puntas de la corona */}
          <polygon points="26,0 13,14 1,8 1,18 51,18 51,8 39,14" fill="#C9A84C" />
          {/* Bolitas en las puntas */}
          <circle cx="1"  cy="8"  r="2.5" fill="#C9A84C" />
          <circle cx="26" cy="0"  r="2.5" fill="#C9A84C" />
          <circle cx="51" cy="8"  r="2.5" fill="#C9A84C" />
        </g>

        {/* Escudo */}
        <path
          d="M8,28 Q8,20 16,20 L104,20 Q112,20 112,28 L112,82 C112,115 60,148 60,148 C60,148 8,115 8,82 Z"
          fill="#0a2040"
          stroke="#C9A84C"
          strokeWidth="3"
        />

        {/* REY */}
        <text x="60" y="60" textAnchor="middle" fontSize="23" fontWeight="900" fill="#74ACDF" fontFamily="Arial, sans-serif" letterSpacing="3">REY</text>

        {/* DEL */}
        <text x="60" y="87" textAnchor="middle" fontSize="23" fontWeight="900" fontFamily="Arial, sans-serif" letterSpacing="3">
          <tspan fill="#ffffff">D</tspan><tspan fill="#FFD700">E</tspan><tspan fill="#ffffff">L</tspan>
        </text>

        {/* PRODE */}
        <text x="60" y="114" textAnchor="middle" fontSize="23" fontWeight="900" fill="#74ACDF" fontFamily="Arial, sans-serif" letterSpacing="3">PRODE</text>

        {/* Subtítulo */}
        <text x="60" y="131" textAnchor="middle" fontSize="7.5" fill="#9ab3d1" fontFamily="Arial, sans-serif" letterSpacing="1.5">COPA DEL MUNDO 2026</text>

      </svg>
    </Link>
  )
}
