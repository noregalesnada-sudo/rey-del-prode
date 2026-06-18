'use client'

import { useState } from 'react'
import { useDictionary } from '@/hooks/useDictionary'

const PAGE_SIZE = 25

interface LeaderboardRow {
  user_id: string
  username: string
  first_name?: string | null
  last_name?: string | null
  total_points: number
  exact_hits: number
  partial_hits: number
  diff_hits: number
  winner_hits: number
  avatar_url?: string | null
}

interface LeaderboardProps {
  rows: LeaderboardRow[]
  currentUserId: string
  title?: string
  subtitle?: string
}

function getDisplayName(row: Pick<LeaderboardRow, 'first_name' | 'last_name' | 'username'>): string {
  const full = [row.first_name, row.last_name].filter(Boolean).join(' ').trim()
  return full || row.username
}

function Avatar({ url, username, size, ring }: { url?: string | null; username: string; size: number; ring?: string }) {
  const initials = username.slice(0, 2).toUpperCase()
  const border = `2px solid ${ring ?? 'var(--accent)'}`
  if (url) {
    return <img src={url} alt={username} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border, flexShrink: 0 }} />
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent-dark),#2a4a7b)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 800, color: '#fff', flexShrink: 0, border,
    }}>
      {initials}
    </div>
  )
}

function TableRow({ row, globalIndex, isMe, youLabel }: { row: LeaderboardRow; globalIndex: number; isMe: boolean; youLabel: string }) {
  const medal = globalIndex === 0 ? '🥇' : globalIndex === 1 ? '🥈' : globalIndex === 2 ? '🥉' : null
  return (
    <tr style={{ borderTop: '1px solid var(--border)', background: isMe ? 'rgba(116, 172, 223, 0.10)' : 'transparent' }}>
      <td style={{ padding: '10px 4px 10px 12px', fontSize: '13px', color: globalIndex < 3 ? 'var(--gold-light, #fad54a)' : 'var(--text-muted)', fontWeight: 800 }}>
        {medal ?? globalIndex + 1}
      </td>
      <td style={{ padding: '10px 6px', fontSize: '13px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          {globalIndex < 3 && <Avatar url={row.avatar_url} username={getDisplayName(row)} size={24} />}
          <span style={{ fontWeight: isMe ? 800 : 600, color: isMe ? 'var(--accent-light)' : 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {getDisplayName(row)}
            {isMe && <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '5px', fontWeight: 600 }}>{youLabel}</span>}
          </span>
        </div>
      </td>
      <td style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 900, fontSize: '15px', color: 'var(--accent-light)' }}>{row.total_points}</td>
      <td style={{ padding: '10px 4px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#27ae60' }}>{row.exact_hits}</td>
      <td style={{ padding: '10px 4px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#f39c12' }}>{row.diff_hits}</td>
      <td style={{ padding: '10px 4px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: 'var(--accent)' }}>{row.winner_hits}</td>
    </tr>
  )
}

export default function Leaderboard({ rows, currentUserId, title, subtitle }: LeaderboardProps) {
  const t = useDictionary()
  const [currentPage, setCurrentPage] = useState(1)

  const podium = rows.slice(0, 3)
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const pageRows = rows.slice(pageStart, pageStart + PAGE_SIZE)

  const currentUserIndex = rows.findIndex((r) => r.user_id === currentUserId)
  const currentUserRow = currentUserIndex >= 0 ? rows[currentUserIndex] : null
  const isCurrentUserOnPage = pageRows.some((r) => r.user_id === currentUserId)

  const avatarSizes = [62, 48, 38]
  const rings = ['#f5c518', '#c8d2dc', '#cd7f32'] // oro / plata / bronce por posición real

  const thStyle: React.CSSProperties = { padding: '9px 4px', textAlign: 'center', fontSize: '10.5px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }

  return (
    <div style={{ border: '1px solid var(--section-border)', borderRadius: 16, overflow: 'hidden', background: 'var(--bg-card)' }}>
      {/* Header */}
      <div style={{ padding: '13px 16px 11px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent)' }}>
          🏆 {title ?? t.leaderboard.title}
        </span>
        {subtitle && <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>{subtitle}</span>}
      </div>

      {/* Podio top 3 */}
      {podium.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '18px', padding: '20px 16px 18px', background: 'linear-gradient(180deg, rgba(245,197,24,0.05), transparent)', borderBottom: '1px solid var(--border)' }}>
          {[podium[1], podium[0], podium[2]].map((row, visualIndex) => {
            if (!row) return <div key={visualIndex} style={{ width: 80 }} />
            const realIndex = rows.indexOf(row)
            const size = avatarSizes[realIndex] ?? 36
            const isMe = row.user_id === currentUserId
            const medals = ['🥈', '🥇', '🥉']
            const isFirst = visualIndex === 1

            return (
              <div key={row.user_id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', transform: isFirst ? 'translateY(-12px)' : 'none' }}>
                <span style={{ fontSize: '22px' }}>{medals[visualIndex]}</span>
                <Avatar url={row.avatar_url} username={getDisplayName(row)} size={size} ring={rings[realIndex] ?? 'var(--accent)'} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', fontWeight: isMe ? 800 : 600, color: isMe ? 'var(--accent-light)' : 'var(--text-primary)', maxWidth: '84px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {getDisplayName(row)}{isMe && ` ${t.leaderboard.you}`}
                  </div>
                  <div style={{ fontSize: '17px', fontWeight: 900, color: isFirst ? '#f5c518' : 'var(--accent-light)' }}>
                    {row.total_points} <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>pts</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Tabla */}
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '30px' }} />
          <col />
          <col style={{ width: '38px' }} />
          <col style={{ width: '42px' }} />
          <col style={{ width: '42px' }} />
          <col style={{ width: '40px' }} />
        </colgroup>
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.025)' }}>
            <th style={{ ...thStyle, textAlign: 'left', paddingLeft: 12 }}>#</th>
            <th style={{ ...thStyle, textAlign: 'left', paddingLeft: 6 }}>{t.leaderboard.player}</th>
            <th style={thStyle}>{t.leaderboard.pts}</th>
            <th style={{ ...thStyle, color: '#27ae60' }} title={t.leaderboard.exact}>3 pts</th>
            <th style={{ ...thStyle, color: '#f39c12' }} title={t.leaderboard.diff}>2 pts</th>
            <th style={{ ...thStyle, color: 'var(--accent)' }} title={t.leaderboard.winner}>1 pt</th>
          </tr>
        </thead>
        <tbody>
          {pageRows.map((row) => {
            const globalIndex = rows.indexOf(row)
            return (
              <TableRow key={row.user_id} row={row} globalIndex={globalIndex} isMe={row.user_id === currentUserId} youLabel={t.leaderboard.you} />
            )
          })}
        </tbody>
      </table>

      {/* Fila fija del usuario actual cuando no está en la página visible */}
      {currentUserRow && !isCurrentUserOnPage && (
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '30px' }} /><col /><col style={{ width: '38px' }} /><col style={{ width: '42px' }} /><col style={{ width: '42px' }} /><col style={{ width: '40px' }} />
          </colgroup>
          <tbody>
            <tr>
              <td colSpan={6} style={{ padding: '5px 12px', borderTop: '2px solid var(--accent)', background: 'rgba(116, 172, 223, 0.06)' }}>
                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{t.leaderboard.yourPosition}</span>
              </td>
            </tr>
            <TableRow row={currentUserRow} globalIndex={currentUserIndex} isMe={true} youLabel={t.leaderboard.you} />
          </tbody>
        </table>
      )}

      {/* Leyenda de columnas */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '4px 14px', padding: '10px 16px', borderTop: '1px solid var(--border)', fontSize: '10.5px', fontWeight: 700 }}>
        <span><span style={{ color: '#27ae60', fontWeight: 800 }}>3 pts</span> <span style={{ color: 'var(--text-muted)' }}>= {t.leaderboard.legendExact}</span></span>
        <span><span style={{ color: '#f39c12', fontWeight: 800 }}>2 pts</span> <span style={{ color: 'var(--text-muted)' }}>= {t.leaderboard.legendDiff}</span></span>
        <span><span style={{ color: 'var(--accent)', fontWeight: 800 }}>1 pt</span> <span style={{ color: 'var(--text-muted)' }}>= {t.leaderboard.legendPartial}</span></span>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '12px', borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,0.015)' }}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{ background: 'transparent', border: '1px solid var(--border-light)', borderRadius: 999, padding: '6px 14px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: currentPage === 1 ? 'var(--text-muted)' : 'var(--accent-light)', fontWeight: 800, fontSize: '12px' }}
          >
            {t.leaderboard.prev}
          </button>
          <span style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: 12.5 }}>
            {t.leaderboard.page.replace('{current}', String(currentPage)).replace('{total}', String(totalPages))}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{ background: 'transparent', border: '1px solid var(--border-light)', borderRadius: 999, padding: '6px 14px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--accent-light)', fontWeight: 800, fontSize: '12px' }}
          >
            {t.leaderboard.next}
          </button>
        </div>
      )}
    </div>
  )
}
