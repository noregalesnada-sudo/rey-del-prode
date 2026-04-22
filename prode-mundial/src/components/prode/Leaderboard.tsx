'use client'

import { useState } from 'react'
import { useDictionary } from '@/hooks/useDictionary'

const PAGE_SIZE = 25

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
  title?: string
  subtitle?: string
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

function TableRow({ row, globalIndex, isMe, youLabel }: { row: LeaderboardRow; globalIndex: number; isMe: boolean; youLabel: string }) {
  const medal = globalIndex === 0 ? '🥇' : globalIndex === 1 ? '🥈' : globalIndex === 2 ? '🥉' : null
  return (
    <tr style={{ borderTop: '1px solid var(--border)', background: isMe ? 'rgba(116, 172, 223, 0.08)' : 'transparent' }}>
      <td style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700 }}>
        {medal ?? globalIndex + 1}
      </td>
      <td style={{ padding: '8px 12px', fontSize: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {globalIndex < 3 && <Avatar url={row.avatar_url} username={row.username} size={24} />}
          <span style={{ fontWeight: isMe ? 700 : 400, color: isMe ? 'var(--accent)' : 'var(--text-primary)' }}>
            {row.username}
            {isMe && <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px', fontWeight: 400 }}>{youLabel}</span>}
          </span>
        </div>
      </td>
      <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 900, fontSize: '15px', color: 'var(--text-primary)' }}>{row.total_points}</td>
      <td style={{ padding: '8px 12px', textAlign: 'center', fontSize: '13px', color: '#27ae60' }}>{row.exact_hits}</td>
      <td style={{ padding: '8px 12px', textAlign: 'center', fontSize: '13px', color: 'var(--accent)' }}>{row.partial_hits}</td>
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
          {title ?? t.leaderboard.title}
        </span>
        {subtitle && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{subtitle}</span>}
      </div>

      {/* Podio — top 3 con avatars grandes, siempre visible */}
      {podium.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '16px', padding: '20px 16px 16px', background: 'rgba(116, 172, 223, 0.04)', borderBottom: '1px solid var(--border)' }}>
          {[podium[1], podium[0], podium[2]].map((row, visualIndex) => {
            if (!row) return <div key={visualIndex} style={{ width: 80 }} />
            const realIndex = rows.indexOf(row)
            const size = avatarSizes[realIndex] ?? 36
            const isMe = row.user_id === currentUserId
            const medals = ['🥈', '🥇', '🥉']
            const heightOffsets = ['0px', '20px', '0px']

            return (
              <div key={row.user_id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', transform: `translateY(-${heightOffsets[visualIndex]})` }}>
                <span style={{ fontSize: '20px' }}>{medals[visualIndex]}</span>
                <Avatar url={row.avatar_url} username={row.username} size={size} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', fontWeight: isMe ? 700 : 400, color: isMe ? 'var(--accent)' : 'var(--text-primary)', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.username}{isMe && ` ${t.leaderboard.you}`}
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

      {/* Tabla paginada */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'rgba(116, 172, 223, 0.05)' }}>
            <th style={{ padding: '7px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', width: '32px' }}>#</th>
            <th style={{ padding: '7px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.leaderboard.player}</th>
            <th style={{ padding: '7px 12px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.leaderboard.pts}</th>
            <th style={{ padding: '7px 12px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.leaderboard.exact}</th>
            <th style={{ padding: '7px 12px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.leaderboard.winner}</th>
          </tr>
        </thead>
        <tbody>
          {pageRows.map((row) => {
            const globalIndex = rows.indexOf(row)
            return (
              <TableRow
                key={row.user_id}
                row={row}
                globalIndex={globalIndex}
                isMe={row.user_id === currentUserId}
                youLabel={t.leaderboard.you}
              />
            )
          })}
        </tbody>
      </table>

      {/* Fila fija del usuario actual — solo cuando no está en la página visible */}
      {currentUserRow && !isCurrentUserOnPage && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td colSpan={5} style={{ padding: '4px 12px', borderTop: '2px solid var(--accent)', background: 'rgba(116, 172, 223, 0.04)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{t.leaderboard.yourPosition}</span>
              </td>
            </tr>
            <TableRow
              row={currentUserRow}
              globalIndex={currentUserIndex}
              isMe={true}
              youLabel={t.leaderboard.you}
            />
          </tbody>
        </table>
      )}

      {/* Controles de paginación — solo si hay más de una página */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
          padding: '10px 12px', borderTop: '1px solid var(--border)',
          background: 'rgba(116, 172, 223, 0.03)', fontSize: '13px',
        }}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              background: 'none', border: '1px solid var(--border)', borderRadius: '4px',
              padding: '4px 10px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
              fontWeight: 700, fontSize: '12px',
            }}
          >
            {t.leaderboard.prev}
          </button>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
            {t.leaderboard.page.replace('{current}', String(currentPage)).replace('{total}', String(totalPages))}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              background: 'none', border: '1px solid var(--border)', borderRadius: '4px',
              padding: '4px 10px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
              fontWeight: 700, fontSize: '12px',
            }}
          >
            {t.leaderboard.next}
          </button>
        </div>
      )}
    </div>
  )
}
