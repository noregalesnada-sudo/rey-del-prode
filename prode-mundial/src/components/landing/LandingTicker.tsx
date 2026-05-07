const ITEMS_ES = [
  '48 EQUIPOS',
  '104 PARTIDOS',
  '3 PAÍSES SEDE',
  'USA · MÉXICO · CANADÁ',
  '11 JUN 2026',
  'PRODES PRIVADOS',
  'RANKING EN TIEMPO REAL',
  'PAGO ÚNICO POR TORNEO',
  'SIN SUSCRIPCIÓN',
  'GRATIS PARA EMPEZAR',
]

const ITEMS_EN = [
  '48 TEAMS',
  '104 MATCHES',
  '3 HOST NATIONS',
  'USA · MEXICO · CANADA',
  'JUN 11, 2026',
  'PRIVATE POOLS',
  'REAL-TIME RANKING',
  'ONE-TIME PAYMENT',
  'NO SUBSCRIPTION',
  'FREE TO START',
]

const DOT = (
  <span style={{ width: 4, height: 4, background: '#071428', borderRadius: '50%', display: 'inline-block', flexShrink: 0 }} />
)

export default function LandingTicker({ lang = 'es' }: { lang?: string }) {
  const ITEMS = lang === 'en' ? ITEMS_EN : ITEMS_ES
  const doubled = [...ITEMS, ...ITEMS]
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 101,
      background: '#f5c518', color: '#071428', height: 32,
      display: 'flex', alignItems: 'center',
      overflow: 'hidden',
      borderBottom: '1px solid rgba(0,0,0,0.12)',
    }}>
      <div style={{
        display: 'flex', gap: 40, whiteSpace: 'nowrap',
        animation: 'ld-ticker 40s linear infinite',
        fontFamily: 'var(--font-bebas, var(--font-barlow), sans-serif)',
        fontSize: 13, letterSpacing: '2px', paddingLeft: 40,
        willChange: 'transform',
      }}>
        {doubled.map((item, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
            {item}
            {DOT}
          </span>
        ))}
      </div>
    </div>
  )
}
