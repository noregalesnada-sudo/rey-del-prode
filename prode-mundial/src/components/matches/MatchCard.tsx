'use client'

import { useState } from 'react'
import { Clock, Lock, X, Save } from 'lucide-react'
import { useDictionary } from '@/hooks/useDictionary'

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
  // Si el pick fue guardado específicamente en este prode (no es el default)
  hasProdeOverride?: boolean
  // Pick de "Mis Pronósticos" (fallback)
  defaultPickHome?: number
  defaultPickAway?: number
  // Minutos restantes para cierre
  minutesUntilStart?: number
}

interface MatchCardProps {
  match: Match
  canEdit: boolean
  onPickSave?: (matchId: string, home: number, away: number) => void
  onPickClear?: (matchId: string) => void
  onPickChange?: (matchId: string, home: string, away: string) => void
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

export default function MatchCard({ match, canEdit, onPickSave, onPickClear, onPickChange }: MatchCardProps) {
  const t = useDictionary()
  const [pickHome, setPickHome] = useState<string>(
    match.userPickHome !== undefined ? String(match.userPickHome) : ''
  )
  const [pickAway, setPickAway] = useState<string>(
    match.userPickAway !== undefined ? String(match.userPickAway) : ''
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [isOverridden, setIsOverridden] = useState(match.hasProdeOverride ?? false)
  const [clearHover, setClearHover] = useState(false)

  const isLocked = !canEdit || match.status !== 'scheduled'
  const hasPick = pickHome !== '' && pickAway !== ''

  async function handleSave() {
    if (!hasPick || isLocked) return
    setSaving(true)
    await onPickSave?.(match.id, Number(pickHome), Number(pickAway))
    setSaving(false)
    setSaved(true)
    setIsOverridden(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleClear() {
    if (!isOverridden || isLocked) return
    setClearing(true)
    await onPickClear?.(match.id)
    setClearing(false)
    setIsOverridden(false)
    const newHome = match.defaultPickHome !== undefined ? String(match.defaultPickHome) : ''
    const newAway = match.defaultPickAway !== undefined ? String(match.defaultPickAway) : ''
    setPickHome(newHome)
    setPickAway(newAway)
    onPickChange?.(match.id, newHome, newAway)
  }

  const d = new Date(match.matchDate)
  const matchDay = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`
  const matchTime = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`

  return (
    <div
      className="match-row"
      style={{
        borderBottom: '1px solid var(--border)',
        padding: '10px 16px',
        background: 'transparent',
        display: 'grid',
        gridTemplateColumns: '80px 1fr 88px 1fr 120px',
        alignItems: 'center',
        gap: '8px',
        minHeight: '52px',
      }}
    >
      {/* Estado / Hora */}
      <div className="match-date" style={{ textAlign: 'center' }}>
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
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{t.matches.final}</span>
        )}
        {match.status === 'scheduled' && (
          <div style={{ color: 'var(--text-muted)', fontSize: '11px', textAlign: 'center', lineHeight: 1.4 }}>
            <div>{matchDay}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
              <Clock size={10} />
              {matchTime}
            </div>
          </div>
        )}
      </div>

      {/* Equipo Local */}
      <div
        className="match-team match-team-home"
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
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{match.homeTeam}</span>
        {match.homeFlag && (
          <img
            src={`https://flagcdn.com/20x15/${match.homeFlag}.png`}
            alt={match.homeTeam}
            style={{ width: 20, height: 15, flexShrink: 0, objectFit: 'cover' }}
          />
        )}
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
              type="text"
              inputMode="numeric"
              value={pickHome}
              onChange={(e) => { const d = e.target.value.replace(/[^0-9]/g, ''); const v = d === '' ? '' : String(parseInt(d, 10)); setPickHome(v); onPickChange?.(match.id, v, pickAway) }}
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
              type="text"
              inputMode="numeric"
              value={pickAway}
              onChange={(e) => { const d = e.target.value.replace(/[^0-9]/g, ''); const v = d === '' ? '' : String(parseInt(d, 10)); setPickAway(v); onPickChange?.(match.id, pickHome, v) }}
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
        className="match-team match-team-away"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontWeight: 700,
          fontSize: '14px',
          color: 'var(--text-primary)',
        }}
      >
        {match.awayFlag && (
          <img
            src={`https://flagcdn.com/20x15/${match.awayFlag}.png`}
            alt={match.awayTeam}
            style={{ width: 20, height: 15, flexShrink: 0, objectFit: 'cover' }}
          />
        )}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{match.awayTeam}</span>
      </div>

      {/* Acciones / Puntos */}
      <div className="match-actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
        {match.status === 'scheduled' && (
          isLocked ? (
            match.userPickHome !== undefined ? (
              <span style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 700 }}>
                Pick: {match.userPickHome}-{match.userPickAway}
              </span>
            ) : (
              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                <Lock size={12} /> {t.matches.noPick}
              </span>
            )
          ) : (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {isOverridden && (
                <button
                  onClick={handleClear}
                  disabled={clearing}
                  title="Vuelve al pick de Mis Pronósticos"
                  onMouseEnter={() => setClearHover(true)}
                  onMouseLeave={() => setClearHover(false)}
                  style={{
                    background: clearHover ? 'rgba(231,76,60,0.15)' : 'transparent',
                    color: clearHover ? '#e74c3c' : 'var(--text-muted)',
                    border: `1px solid ${clearHover ? '#e74c3c' : 'var(--border)'}`,
                    borderRadius: '4px',
                    padding: '4px 6px',
                    cursor: clearing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    opacity: clearing ? 0.5 : 1,
                    transition: 'background 0.15s, color 0.15s, border-color 0.15s',
                  }}
                >
                  <X size={12} />
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={!hasPick || saving}
                title={t.matches.save}
                style={{
                  background: saved ? '#27ae60' : isOverridden ? 'rgba(39,174,96,0.15)' : hasPick ? 'var(--accent)' : 'var(--border)',
                  color: saved ? '#fff' : isOverridden ? '#27ae60' : hasPick ? '#fff' : 'var(--text-muted)',
                  border: `1px solid ${saved ? '#27ae60' : isOverridden ? '#27ae60' : 'transparent'}`,
                  borderRadius: '4px',
                  padding: '5px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: hasPick ? 'pointer' : 'default',
                  transition: 'background 0.2s, color 0.2s',
                }}
              >
                {saving ? <span style={{ fontSize: 11, fontWeight: 700 }}>...</span> : <Save size={13} />}
              </button>
            </div>
          )
        )}
        {match.userPoints !== undefined && <PointsBadge points={match.userPoints} />}
        {match.status !== 'scheduled' && match.userPickHome !== undefined && (
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
            {t.matches.yourPick}: {match.userPickHome}-{match.userPickAway}
          </span>
        )}
      </div>
    </div>
  )
}
