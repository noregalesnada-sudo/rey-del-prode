const TEAMS = [
  { code: 'us', name: 'Estados Unidos' }, { code: 'mx', name: 'México' },         { code: 'ca', name: 'Canadá' },
  { code: 'ar', name: 'Argentina' },      { code: 'br', name: 'Brasil' },         { code: 'fr', name: 'Francia' },
  { code: 'uy', name: 'Uruguay' },        { code: 'ec', name: 'Ecuador' },        { code: 'co', name: 'Colombia' },
  { code: 'pa', name: 'Panamá' },         { code: 'es', name: 'España' },         { code: 'de', name: 'Alemania' },
  { code: 'py', name: 'Paraguay' },       { code: 'nl', name: 'Países Bajos' },   { code: 'be', name: 'Bélgica' },
  { code: 'sa', name: 'Arabia Saudita' }, { code: 'gh', name: 'Ghana' },          { code: 'ma', name: 'Marruecos' },
  { code: 'gb-eng', name: 'Inglaterra' }, { code: 'sn', name: 'Senegal' },        { code: 'pt', name: 'Portugal' },
  { code: 'jp', name: 'Japón' },          { code: 'kr', name: 'Corea del Sur' },  { code: 'au', name: 'Australia' },
]

function Item({ code, name }: { code: string; name: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '0 20px' }}>
      <img
        src={`https://flagcdn.com/w40/${code}.png`}
        alt={name}
        width={24}
        height={16}
        style={{ objectFit: 'cover', borderRadius: 2, flexShrink: 0 }}
      />
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
