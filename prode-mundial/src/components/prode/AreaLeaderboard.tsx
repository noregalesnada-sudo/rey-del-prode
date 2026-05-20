interface AreaRow {
  area: string
  miembros: number
  promedio: number
  total: number
}

interface Labels {
  title: string
  avgPts: string
  department: string
  players: string
  avg: string
  total: string
  empty: string
}

interface AreaLeaderboardProps {
  rows: AreaRow[]
  labels: Labels
}

const medals = ['🥇', '🥈', '🥉']

export default function AreaLeaderboard({ rows, labels }: AreaLeaderboardProps) {
  if (rows.length === 0) {
    return (
      <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ background: 'var(--bg-section-header)', padding: '8px 12px', height: '32px', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
            {labels.title}
          </span>
        </div>
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
          {labels.empty}
        </div>
      </div>
    )
  }

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{
        background: 'var(--bg-section-header)', padding: '8px 12px', height: '32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
          {labels.title}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{labels.avgPts}</span>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'rgba(116,172,223,0.04)' }}>
            <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>#</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{labels.department}</th>
            <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{labels.players}</th>
            <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{labels.avg}</th>
            <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{labels.total}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.area} style={{
              borderTop: '1px solid var(--border)',
              background: i === 0 ? 'rgba(255,215,0,0.04)' : 'transparent',
            }}>
              <td style={{ padding: '10px 12px', fontSize: '14px', fontWeight: 700, color: i < 3 ? '#FFD700' : 'var(--text-muted)', width: '32px' }}>
                {medals[i] ?? i + 1}
              </td>
              <td style={{ padding: '10px 12px', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {row.area}
              </td>
              <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
                {row.miembros}
              </td>
              <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                <span style={{ fontSize: '15px', fontWeight: 900, color: i === 0 ? '#FFD700' : 'var(--accent)' }}>
                  {row.promedio.toFixed(1)}
                </span>
              </td>
              <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'right' }}>
                {row.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
