interface ProdePlayerStatsProps {
  position: number
  totalMembers: number
  totalPoints: number
  exactHits: number
  partialHits: number
}

function positionColor(pos: number): string {
  if (pos === 1) return '#FFD700'
  if (pos === 2) return '#C0C0C0'
  if (pos === 3) return '#CD7F32'
  return 'var(--accent)'
}

export default function ProdePlayerStats({
  position,
  totalMembers,
  totalPoints,
  exactHits,
  partialHits,
}: ProdePlayerStatsProps) {
  const posColor = positionColor(position)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0',
      background: 'linear-gradient(135deg, rgba(116,172,223,0.12) 0%, rgba(116,172,223,0.06) 100%)',
      border: '1px solid var(--accent)',
      borderRadius: '10px',
      boxShadow: '0 0 16px rgba(116,172,223,0.15)',
      overflow: 'hidden',
      maxWidth: '480px',
      margin: '0 auto 20px',
    }}>
      {/* Posición */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '14px 20px', borderRight: '1px solid var(--border)',
        minWidth: '80px',
      }}>
        <span style={{ fontSize: '28px', fontWeight: 900, color: posColor, lineHeight: 1, letterSpacing: '-1px' }}>
          {position}°
        </span>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '3px' }}>
          de {totalMembers}
        </span>
      </div>

      {/* Puntos */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '14px 20px', borderRight: '1px solid var(--border)',
        flex: 1,
      }}>
        <span style={{ fontSize: '28px', fontWeight: 900, color: 'var(--accent)', lineHeight: 1, letterSpacing: '-1px' }}>
          {totalPoints}
        </span>
        <span style={{ fontSize: '10px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '3px', opacity: 0.8 }}>
          puntos
        </span>
      </div>

      {/* Exactos */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '14px 16px', borderRight: '1px solid var(--border)',
        flex: 1,
      }}>
        <span style={{ fontSize: '20px', fontWeight: 800, color: '#f0c040', lineHeight: 1 }}>
          {exactHits}
        </span>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '3px' }}>
          exactos
        </span>
      </div>

      {/* Parciales */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '14px 16px',
        flex: 1,
      }}>
        <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-secondary, #aaa)', lineHeight: 1 }}>
          {partialHits}
        </span>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '3px' }}>
          parciales
        </span>
      </div>
    </div>
  )
}
