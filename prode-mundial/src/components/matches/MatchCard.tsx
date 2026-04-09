'use client'

import { useState } from 'react'
import { Clock, Lock } from 'lucide-react'

export interface Match {
  id: string
  homeTeam: string
  awayTeam: string
  homeFlag?: string
  awayFlag?: string
  matchDate: string
  status: 'scheduled' | 'live' | 'finished'
  homeScore?: number
  awayScore?: number
  minute?: number
  group?: string
  phase: string
  // Pick del usuario actual
  userPickHome?: number
  userPickAway?: number
  userPoints?: number
  // Minutos restantes para cierre
  minutesUntilStart?: number
}

interface MatchCardProps {
  match: Match
  canEdit: boolean
  onPickSave?: (matchId: string, home: number, away: number) => void
}

function PointsBadge({ points }: { points: number }) {
  const color =
    points === 3 ? '#27ae60' : points === 1 ? 'var(--accent)' : 'var(--text-muted)'
  return (
    <span
      style={{
        background: color,
        color: '#fff',
        borderRadius: '3px',
        padding: '1px 6px',
        fontSize: '11px',
        fontWeight: 700,
      }}
    >
      {points} pts
    </span>
  )
}

export default function MatchCard({ match, canEdit, onPickSave }: MatchCardProps) {
  const [pickHome, setPickHome] = useState<string>(
    match.userPickHome !== undefined ? String(match.userPickHome) : ''
  )
  const [pickAway, setPickAway] = useState<string>(
    match.userPickAway !== undefined ? String(match.userPickAway) : ''
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const isLocked = !canEdit || match.status !== 'scheduled'
  const hasPick = pickHome !== '' && pickAway !== ''

  async function handleSave() {
    if (!hasPick || isLocked) return
    setSaving(true)
    await onPickSave?.(match.id, Number(pickHome), Number(pickAway))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const d = new Date(match.matchDate)
  const matchDateFormatted = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`

  return (
    <div
      style={{
        borderBottom: '1px solid var(--border)',
        padding: '10px 16px',
        background: 'transparent',
        display: 'grid',
        gridTemplateColumns: '80px 1fr auto 1fr 120px',
        alignItems: 'center',
        gap: '8px',
        minHeight: '52px',
      }}
    >
      {/* Estado / Hora */}
      <div style={{ textAlign: 'center' }}>
        {match.status === 'live' && (
          <div
            style={{
              color: 'var(--live)',
              fontWeight: 700,
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: 'var(--live)',
                display: 'inline-block',
                animation: 'pulse 1.5s infinite',
              }}
            />
            {match.minute}&apos;
          </div>
        )}
        {match.status === 'finished' && (
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Final</span>
        )}
        {match.status === 'scheduled' && (
          <div style={{ color: 'var(--text-muted)', fontSize: '11px', textAlign: 'center' }}>
            <Clock size={11} style={{ display: 'inline', marginRight: '2px' }} />
            {matchDateFormatted}
          </div>
        )}
      </div>

      {/* Equipo Local */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '6px',
          fontWeight: 700,
          fontSize: '14px',
          color: 'var(--text-primary)',
        }}
      >
        {match.homeFlag && <span style={{ fontSize: '18px' }}>{match.homeFlag}</span>}
        {match.homeTeam}
      </div>

      {/* Marcador / Score */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          justifyContent: 'center',
          minWidth: '80px',
        }}
      >
        {match.status !== 'scheduled' ? (
          // Resultado real
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 900, fontSize: '20px', color: 'var(--text-primary)' }}>
            <span>{match.homeScore ?? '-'}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>-</span>
            <span>{match.awayScore ?? '-'}</span>
          </div>
        ) : !canEdit ? (
          // Partido no jugado, solo lectura — mostrar "vs"
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontWeight: 700, fontSize: '14px' }}>
            vs
          </div>
        ) : (
          // Input de predicción
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="number"
              min={0}
              max={20}
              value={pickHome}
              onChange={(e) => setPickHome(e.target.value)}
              disabled={isLocked}
              style={{
                width: '36px',
                textAlign: 'center',
                background: isLocked ? 'rgba(255,255,255,0.05)' : 'rgba(116, 172, 223, 0.15)',
                border: `1px solid ${isLocked ? 'var(--border)' : 'var(--accent)'}`,
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '16px',
                padding: '3px 0',
                outline: 'none',
              }}
            />
            <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>-</span>
            <input
              type="number"
              min={0}
              max={20}
              value={pickAway}
              onChange={(e) => setPickAway(e.target.value)}
              disabled={isLocked}
              style={{
                width: '36px',
                textAlign: 'center',
                background: isLocked ? 'rgba(255,255,255,0.05)' : 'rgba(116, 172, 223, 0.15)',
                border: `1px solid ${isLocked ? 'var(--border)' : 'var(--accent)'}`,
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '16px',
                padding: '3px 0',
                outline: 'none',
              }}
            />
          </div>
        )}
      </div>

      {/* Equipo Visitante */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontWeight: 700,
          fontSize: '14px',
          color: 'var(--text-primary)',
        }}
      >
        {match.awayTeam}
        {match.awayFlag && <span style={{ fontSize: '18px' }}>{match.awayFlag}</span>}
      </div>

      {/* Acciones / Puntos */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
        {match.status === 'scheduled' && (
          isLocked ? (
            match.userPickHome !== undefined ? (
              <span style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 700 }}>
                Pick: {match.userPickHome}-{match.userPickAway}
              </span>
            ) : (
              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                <Lock size={12} /> Sin pick
              </span>
            )
          ) : (
            <button
              onClick={handleSave}
              disabled={!hasPick || saving}
              style={{
                background: hasPick ? 'var(--accent)' : 'var(--border)',
                color: hasPick ? '#fff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 12px',
                fontWeight: 700,
                fontSize: '12px',
                transition: 'background 0.2s',
              }}
            >
              {saving ? '...' : saved ? '✓ Guardado' : 'Guardar'}
            </button>
          )
        )}
        {match.userPoints !== undefined && <PointsBadge points={match.userPoints} />}
        {match.status !== 'scheduled' && match.userPickHome !== undefined && (
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
            Tu pick: {match.userPickHome}-{match.userPickAway}
          </span>
        )}
      </div>
    </div>
  )
}
