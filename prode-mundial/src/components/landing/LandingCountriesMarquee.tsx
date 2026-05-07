const TEAMS = [
  { flag: '🇺🇸', name: 'Estados Unidos' }, { flag: '🇲🇽', name: 'México' }, { flag: '🇨🇦', name: 'Canadá' },
  { flag: '🇦🇷', name: 'Argentina' },      { flag: '🇧🇷', name: 'Brasil' },  { flag: '🇫🇷', name: 'Francia' },
  { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'Inglaterra' },     { flag: '🇪🇸', name: 'España' },  { flag: '🇩🇪', name: 'Alemania' },
  { flag: '🇵🇹', name: 'Portugal' },       { flag: '🇳🇱', name: 'Países Bajos' }, { flag: '🇧🇪', name: 'Bélgica' },
  { flag: '🇯🇵', name: 'Japón' },          { flag: '🇰🇷', name: 'Corea del Sur' }, { flag: '🇦🇺', name: 'Australia' },
  { flag: '🇲🇦', name: 'Marruecos' },      { flag: '🇸🇦', name: 'Arabia Saudita' }, { flag: '🇮🇷', name: 'Irán' },
  { flag: '🇸🇳', name: 'Senegal' },        { flag: '🇬🇭', name: 'Ghana' },   { flag: '🇺🇾', name: 'Uruguay' },
  { flag: '🇨🇴', name: 'Colombia' },       { flag: '🇨🇱', name: 'Chile' },   { flag: '🇪🇨', name: 'Ecuador' },
]

function Item({ flag, name }: { flag: string; name: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '0 20px' }}>
      <span style={{ fontSize: 22 }}>{flag}</span>
      <span style={{ fontFamily: 'var(--font-bebas, var(--font-barlow))', fontSize: 15, letterSpacing: '1.5px', color: 'rgba(255,255,255,0.7)' }}>
        {name}
      </span>
    </span>
  )
}

export default function LandingCountriesMarquee() {
  const doubled = [...TEAMS, ...TEAMS]
  return (
    <div style={{
      overflow: 'hidden', padding: '36px 0',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      position: 'relative',
    }}>
      {/* fade edges */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(90deg, #0A1F3D, transparent)', zIndex: 1 }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(-90deg, #0A1F3D, transparent)', zIndex: 1 }} />

      <div style={{
        display: 'flex', whiteSpace: 'nowrap',
        animation: 'ld-marquee 45s linear infinite',
        willChange: 'transform',
      }}>
        {doubled.map((t, i) => <Item key={i} {...t} />)}
      </div>
    </div>
  )
}
