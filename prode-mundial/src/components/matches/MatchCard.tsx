'use client'

import { useState } from 'react'
import { Clock, Lock, RotateCcw, Save } from 'lucide-react'
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
  hideDate?: boolean
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

export default function MatchCard({ match, canEdit, onPickSave, onPickClear, onPickChange, hideDate }: MatchCardProps) {
  const t = useDictionary()
  const [pickHome, setPickHome] = useState<string>(
    match.userPickHome !== undefined ? String(match.userPickHome) : ''
  )
  const [pickAway, setPickAway] = useState<string>(
    match.userPickAway !== undefined ? String(match.userPickAway) : ''
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [clearHover, setClearHover] = useState(false)
  // Baseline = valor efectivo actual (override del prode o heredado de Mis Pronósticos).
  // Solo se habilita "guardar" cuando el input difiere del baseline (hay algo nuevo que persistir).
  const [baseHome, setBaseHome] = useState<string>(match.userPickHome !== undefined ? String(match.userPickHome) : '')
  const [baseAway, setBaseAway] = useState<string>(match.userPickAway !== undefined ? String(match.userPickAway) : '')

  // minutesUntilStart viene calculado del server (y se refresca con RealtimeRefresh);
  // evita Date.now() impuro en render. Si no viene, no bloquea por tiempo.
  const minutesUntilStart = match.minutesUntilStart ?? Infinity
  const isLocked = !canEdit || match.status !== 'scheduled' || minutesUntilStart < 15
  // Prode editable cuyo partido ya cerró (<15 min): se muestra bloqueado, sin botones.
  const timeLocked = canEdit && match.status === 'scheduled' && minutesUntilStart < 15

  const hasDefault = match.defaultPickHome !== undefined && match.defaultPickAway !== undefined
  const defHome = hasDefault ? String(match.defaultPickHome) : ''
  const defAway = hasDefault ? String(match.defaultPickAway) : ''

  const hasPick = pickHome !== '' && pickAway !== ''
  const isDirty = pickHome !== baseHome || pickAway !== baseAway
  const valueIsDefault = hasDefault && pickHome === defHome && pickAway === defAway
  // ↺ visible solo si hay un valor distinto a tu Mis Pronósticos para revertir
  const showRevert = !isLocked && hasDefault && hasPick && !valueIsDefault

  // Guardado manual unificado: si el valor quedó vacío o igual a Mis Pronósticos → borra el
  // override (revertir); si es un valor propio distinto → guarda el override.
  async function handleSave() {
    if (isLocked || !isDirty || saving) return
    setSaving(true)
    if (hasPick && !valueIsDefault) {
      await onPickSave?.(match.id, Number(pickHome), Number(pickAway))
    } else {
      await onPickClear?.(match.id)
    }
    setSaving(false)
    setSaved(true)
    setBaseHome(pickHome)
    setBaseAway(pickAway)
    setTimeout(() => setSaved(false), 2000)
  }

  // ↺ ahora solo stagea: pone el pronóstico de Mis Pronósticos en el casillero.
  // No persiste hasta tocar 💾 (o "Guardar todo"). Empareja con el guardado manual.
  function handleRevert() {
    if (isLocked || !hasDefault) return
    setPickHome(defHome)
    setPickAway(defAway)
    onPickChange?.(match.id, defHome, defAway)
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
        // Partido scheduled bloqueado (<15 min): fondo neutro tenue (se nota el cierre).
        // Si no, sombreado sutil cuando hay pick cargado (como en Mis Pronósticos).
        background: (isLocked && match.status === 'scheduled')
          ? 'rgba(255,255,255,0.025)'
          : hasPick ? 'rgba(116, 172, 223, 0.04)' : 'transparent',
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
            {!hideDate && <div>{matchDay}</div>}
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
        ) : timeLocked ? (
          // Bloqueado (<15 min): pick cargado estático (o "vs" si no hay), sin inputs
          hasPick ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '18px', color: 'var(--text-muted)' }}>
              <span>{pickHome}</span>
              <span style={{ fontSize: '13px' }}>-</span>
              <span>{pickAway}</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontWeight: 700, fontSize: '14px' }}>
              vs
            </div>
          )
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
                // Borde neutro (no var(--accent)): no toma el color del prode enterprise.
                border: `1px solid ${isLocked ? 'var(--border)' : 'var(--border-light)'}`,
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
                // Borde neutro (no var(--accent)): no toma el color del prode enterprise.
                border: `1px solid ${isLocked ? 'var(--border)' : 'var(--border-light)'}`,
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
        {match.status === 'scheduled' ? (
          timeLocked ? (
            // Cerró la edición (<15 min): sin botones, candado visible.
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700 }}>
              <Lock size={12} /> {t.matches.locked}
            </span>
          ) : isLocked ? (
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
              {showRevert && (
                <button
                  onClick={handleRevert}
                  title="Volver a Mis Pronósticos"
                  onMouseEnter={() => setClearHover(true)}
                  onMouseLeave={() => setClearHover(false)}
                  style={{
                    // Color fijo del sitio (#74ACDF). No usar var(--accent): los prodes
                    // enterprise lo pisan con su color custom y la flecha cambiaría de color.
                    background: clearHover ? 'rgba(116,172,223,0.15)' : 'transparent',
                    color: clearHover ? '#74ACDF' : 'var(--text-muted)',
                    border: `1px solid ${clearHover ? '#74ACDF' : 'var(--border)'}`,
                    borderRadius: '4px',
                    padding: '4px 6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'background 0.15s, color 0.15s, border-color 0.15s',
                  }}
                >
                  <RotateCcw size={12} />
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={!hasPick || !isDirty || saving}
                title={t.matches.save}
                style={{
                  // Celeste fijo del sitio (#74ACDF, no var(--accent) para que no lo pise el
                  // color del prode enterprise). Solo activo cuando hay un cambio para guardar;
                  // si el valor vino heredado de Mis Pronósticos y no se editó, queda gris.
                  background: saved ? '#27ae60' : (hasPick && isDirty) ? '#74ACDF' : 'var(--border)',
                  color: saved ? '#fff' : (hasPick && isDirty) ? '#fff' : 'var(--text-muted)',
                  border: `1px solid ${saved ? '#27ae60' : 'transparent'}`,
                  borderRadius: '4px',
                  padding: '5px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: (hasPick && isDirty) ? 'pointer' : 'default',
                  transition: 'background 0.2s, color 0.2s',
                }}
              >
                {saving ? <span style={{ fontSize: 11, fontWeight: 700 }}>...</span> : <Save size={13} />}
              </button>
            </div>
          )
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
            {match.userPoints !== undefined && <PointsBadge points={match.userPoints} />}
            {match.userPickHome !== undefined && (
              <span style={{ color: 'var(--text-muted)', fontSize: '11px', whiteSpace: 'nowrap' }}>
                {t.matches.yourPick}: {match.userPickHome}-{match.userPickAway}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
