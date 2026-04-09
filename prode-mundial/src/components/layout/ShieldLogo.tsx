import Link from 'next/link'

interface ShieldLogoProps {
  onClick?: () => void
}

export default function ShieldLogo({ onClick }: ShieldLogoProps) {
  return (
    <Link href="/" onClick={onClick} style={{ textDecoration: 'none', display: 'block', padding: '14px 8px 10px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
      <svg viewBox="0 0 120 162" width="108" style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}>

        {/* Corona encima del escudo */}
        <g transform="translate(34, 0)">
          <rect x="1" y="18" width="50" height="5" rx="2.5" fill="#C9A84C" />
          <polygon points="26,1 13,14 1,8 1,18 51,18 51,8 39,14" fill="#C9A84C" />
          <circle cx="1"  cy="8"  r="2.5" fill="#C9A84C" />
          <circle cx="26" cy="1"  r="2.5" fill="#C9A84C" />
          <circle cx="51" cy="8"  r="2.5" fill="#C9A84C" />
        </g>

        {/* Escudo — parte plana ancha hasta y=98, luego tapa hacia el centro */}
        <path
          d="M8,28 Q8,20 16,20 L104,20 Q112,20 112,28 L112,98 C112,128 60,158 60,158 C60,158 8,128 8,98 Z"
          fill="#0a2040"
          stroke="#C9A84C"
          strokeWidth="3"
        />

        {/* REY */}
        <text x="60" y="55" textAnchor="middle" fontSize="21" fontWeight="900" fill="#74ACDF" fontFamily="Arial, sans-serif" letterSpacing="3">REY</text>

        {/* DEL — E en dorado */}
        <text x="60" y="79" textAnchor="middle" fontSize="21" fontWeight="900" fontFamily="Arial, sans-serif" letterSpacing="3">
          <tspan fill="#ffffff">D</tspan><tspan fill="#FFD700">E</tspan><tspan fill="#ffffff">L</tspan>
        </text>

        {/* PRODE */}
        <text x="60" y="103" textAnchor="middle" fontSize="21" fontWeight="900" fill="#74ACDF" fontFamily="Arial, sans-serif" letterSpacing="3">PRODE</text>

        {/* Subtítulo en dos líneas dentro de la parte ancha */}
        <text x="60" y="119" textAnchor="middle" fontSize="7" fill="#9ab3d1" fontFamily="Arial, sans-serif" letterSpacing="1">COPA DEL MUNDO</text>
        <text x="60" y="130" textAnchor="middle" fontSize="7" fill="#9ab3d1" fontFamily="Arial, sans-serif" letterSpacing="1">2026</text>

      </svg>
    </Link>
  )
}
