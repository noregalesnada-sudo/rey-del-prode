interface LeaderboardRow {
  user_id: string
  username: string
  total_points: number
  exact_hits: number
  partial_hits: number
  avatar_url?: string | null
}

interface LeaderboardProps {
  rows: LeaderboardRow[]
  currentUserId: string
}

function Avatar({ url, username, size }: { url?: string | null; username: string; size: number }) {
  const initials = username.slice(0, 2).toUpperCase()
  if (url) {
    return (
      <img
        src={url}
        alt={username}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent)', flexShrink: 0 }}
      />
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: 'var(--accent)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, color: '#fff', flexShrink: 0,
      border: '2px solid var(--accent-dark)',
    }}>
      {initials}
    </div>
  )
}

export default function Leaderboard({ rows, currentUserId }: LeaderboardProps) {
  const podium = rows.slice(0, 3)
  const rest = rows.slice(3)

  const avatarSizes = [64, 48, 38]

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        background: 'var(--bg-section-header)', borderRadius: '8px 8px 0 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 12px', height: '32px',
      }}>
        <span style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
          🏅 Tabla de Líderes
        </span>
      </div>

      {/* Podio — top 3 con avatars grandes */}
      {podium.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '16px', padding: '20px 16px 16px', background: 'rgba(116, 172, 223, 0.04)', borderBottom: '1px solid var(--border)' }}>
          {/* Reordenar para mostrar 2do-1ro-3ro */}
          {[podium[1], podium[0], podium[2]].map((row, visualIndex) => {
            if (!row) return <div key={visualIndex} style={{ width: 80 }} />
            const realIndex = rows.indexOf(row)
            const size = avatarSizes[realIndex] ?? 36
            const isMe = row.user_id === currentUserId
            const medals = ['🥈', '🥇', '🥉']
            const heightOffsets = ['0px', '20px', '0px']
            const labels = ['2°', '1°', '3°']

            return (
              <div key={row.user_id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', marginBottom: heightOffsets[visualIndex] === '0px' ? '0' : undefined, transform: `translateY(-${heightOffsets[visualIndex]})` }}>
                <span style={{ fontSize: '20px' }}>{medals[visualIndex]}</span>
                <Avatar url={row.avatar_url} username={row.username} size={size} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', fontWeight: isMe ? 700 : 400, color: isMe ? 'var(--accent)' : 'var(--text-primary)', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.username}{isMe && ' (vos)'}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--text-primary)' }}>
                    {row.total_points} pts
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Tabla completa */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'rgba(116, 172, 223, 0.05)' }}>
            <th style={{ padding: '7px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', width: '32px' }}>#</th>
            <th style={{ padding: '7px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Jugador</th>
            <th style={{ padding: '7px 12px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pts</th>
            <th style={{ padding: '7px 12px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Exactos</th>
            <th style={{ padding: '7px 12px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ganador</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const isMe = row.user_id === currentUserId
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null
            return (
              <tr key={row.user_id} style={{ borderTop: '1px solid var(--border)', background: isMe ? 'rgba(116, 172, 223, 0.08)' : 'transparent' }}>
                <td style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700 }}>
                  {medal ?? i + 1}
                </td>
                <td style={{ padding: '8px 12px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {i < 3 && <Avatar url={row.avatar_url} username={row.username} size={24} />}
                    <span style={{ fontWeight: isMe ? 700 : 400, color: isMe ? 'var(--accent)' : 'var(--text-primary)' }}>
                      {row.username}
                      {isMe && <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px', fontWeight: 400 }}>(vos)</span>}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 900, fontSize: '15px', color: 'var(--text-primary)' }}>{row.total_points}</td>
                <td style={{ padding: '8px 12px', textAlign: 'center', fontSize: '13px', color: '#27ae60' }}>{row.exact_hits}</td>
                <td style={{ padding: '8px 12px', textAlign: 'center', fontSize: '13px', color: 'var(--accent)' }}>{row.partial_hits}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
