'use client'

import { useState, useEffect, useRef } from 'react'
import { Clock, Lock, Save, Minus, Plus } from 'lucide-react'
import { useDictionary } from '@/hooks/useDictionary'
import { type MatchOdds } from '@/lib/odds-api'
import { type PickDistribution } from '@/lib/pick-distribution'
import PickDistributionBar from './PickDistributionBar'
import MatchPicksReveal from './MatchPicksReveal'

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
  // Resultado a los 90' (tiempo reglamentario) — lo que puntúa en mata-mata. Se muestra como
  // aclaración cuando el partido se definió en alargue/penales y el marcador real difiere.
  regHomeScore?: number | null
  regAwayScore?: number | null
  minute?: number
  // REGULAR | EXTRA_TIME | PENALTY_SHOOTOUT — para avisar "Alargue"/"Penales" en mata-mata.
  matchDuration?: string
  group?: string
  phase: string
  // Pick del usuario actual
  userPickHome?: number
  userPickAway?: number
  userPoints?: number
  // Solo en el fixture (vista global): true cuando el usuario cargó picks distintos entre sus
  // prodes para este partido, así se muestra un aviso en vez de un vacío engañoso.
  pickDivergent?: boolean
  // Si el pick fue guardado específicamente en este prode (no es el default)
  hasProdeOverride?: boolean
  // Pick de "Mis Pronósticos" (fallback)
  defaultPickHome?: number
  defaultPickAway?: number
  // Minutos restantes para cierre
  minutesUntilStart?: number
  odds?: MatchOdds
  // Distribución L/E/V del prode (solo cuando cerraron los pronósticos y no finalizó)
  distribution?: PickDistribution
}

interface MatchCardProps {
  match: Match
  canEdit: boolean
  prodeId?: string
  onPickSave?: (matchId: string, home: number, away: number) => void
  onPickClear?: (matchId: string) => void
  onPickChange?: (matchId: string, home: string, away: string) => void
  hideDate?: boolean
  showOdds?: boolean
}

// Cuotas ocultas por feedback (2026-06-15). Poner en true para reactivar; el fetch sigue activo.
const ODDS_ENABLED = false

function PointsBadge({ points }: { points: number }) {
  const color = points === 3 ? '#27ae60' : points === 2 ? '#f39c12' : points === 1 ? 'var(--accent)' : 'var(--text-muted)'
  return (
    <span style={{ background: color, color: '#fff', borderRadius: '5px', padding: '2px 8px', fontSize: '11px', fontWeight: 800 }}>
      {points} pts
    </span>
  )
}

const flagUrl = (code?: string) => (code ? `https://flagcdn.com/w40/${code}.png` : undefined)

const roundBtn: React.CSSProperties = {
  width: 34, height: 34, borderRadius: '50%', border: '1.5px solid var(--border-light)',
  background: 'rgba(116,172,223,0.12)', color: '#a8d4f5',
  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
}

function Stepper({ value, onBump, disabled }: { value: string; onBump: (dir: number) => void; disabled: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <button onClick={() => onBump(-1)} disabled={disabled} style={roundBtn} aria-label="-"><Minus size={16} /></button>
      <span style={{ minWidth: 24, textAlign: 'center', fontSize: 24, fontWeight: 900, fontVariantNumeric: 'tabular-nums', color: value === '' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
        {value === '' ? '–' : value}
      </span>
      <button onClick={() => onBump(1)} disabled={disabled} style={roundBtn} aria-label="+"><Plus size={16} /></button>
    </div>
  )
}

function TeamCol({ team, flagCode, editable, stepperValue, onBump, disabled, result, pick, penalty }: {
  team: string; flagCode?: string; editable: boolean
  stepperValue: string; onBump: (d: number) => void; disabled: boolean
  result: number | null; pick?: number; penalty?: number | null
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      {editable ? (
        <Stepper value={stepperValue} onBump={onBump} disabled={disabled} />
      ) : result !== null ? (
        <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 3, lineHeight: 1 }}>
          <span style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-1px' }}>{result}</span>
          {penalty != null && <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-muted)' }}>({penalty})</span>}
        </span>
      ) : pick !== undefined ? (
        <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-muted)', lineHeight: 1 }}>{pick}</span>
      ) : (
        <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-muted)', lineHeight: 1 }}>–</span>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0, maxWidth: '100%' }}>
        {flagCode && <img src={flagUrl(flagCode)} alt={team} style={{ width: 26, height: 19, objectFit: 'cover', borderRadius: 3, flexShrink: 0 }} />}
        <span style={{ fontWeight: 800, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team}</span>
      </div>
    </div>
  )
}

export default function MatchCard({ match, canEdit, prodeId, onPickSave, onPickClear, onPickChange, hideDate, showOdds }: MatchCardProps) {
  const t = useDictionary()
  const [pickHome, setPickHome] = useState<string>(match.userPickHome !== undefined ? String(match.userPickHome) : '')
  const [pickAway, setPickAway] = useState<string>(match.userPickAway !== undefined ? String(match.userPickAway) : '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  // Baseline = valor efectivo actual (override del prode o heredado de Mis Pronósticos).
  const [baseHome, setBaseHome] = useState<string>(match.userPickHome !== undefined ? String(match.userPickHome) : '')
  const [baseAway, setBaseAway] = useState<string>(match.userPickAway !== undefined ? String(match.userPickAway) : '')
  const cardRef = useRef<HTMLDivElement>(null)
  const [highlight, setHighlight] = useState(false)

  // Deep-link: si la URL apunta a este partido (#m-id), scrollea y lo resalta un momento.
  useEffect(() => {
    if (typeof window === 'undefined' || window.location.hash !== `#m-${match.id}`) return
    const tid = setTimeout(() => {
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setHighlight(true)
      setTimeout(() => setHighlight(false), 2200)
    }, 250)
    return () => clearTimeout(tid)
  }, [match.id])

  const minutesUntilStart = match.minutesUntilStart ?? Infinity
  const isLocked = !canEdit || match.status !== 'scheduled' || minutesUntilStart < 15
  const timeLocked = canEdit && match.status === 'scheduled' && minutesUntilStart < 15
  const showReveal = !!prodeId && (match.status !== 'scheduled' || minutesUntilStart < 15)

  const hasPick = pickHome !== '' && pickAway !== ''
  const isDirty = pickHome !== baseHome || pickAway !== baseAway

  const editing = !isLocked && match.status === 'scheduled'
  const hasPickValues = match.userPickHome !== undefined && match.userPickAway !== undefined

  function bump(side: 'h' | 'a', dir: number) {
    if (isLocked) return
    // Sin valor cargado: el primer toque (− o +) arranca en 0.
    const cur = side === 'h' ? pickHome : pickAway
    const v = cur === '' ? '0' : String(Math.max(0, parseInt(cur, 10) + dir))
    if (side === 'h') { setPickHome(v); setSaved(false); onPickChange?.(match.id, v, pickAway) }
    else { setPickAway(v); setSaved(false); onPickChange?.(match.id, pickHome, v) }
  }

  async function handleSave() {
    if (isLocked || !isDirty || saving) return
    setSaving(true)
    if (hasPick) {
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

  const d = new Date(match.matchDate)
  const matchDay = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
  const matchTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

  // En mata-mata, si el partido pasó a alargue/penales avisamos en el header. El marcador
  // que se ve es el real/en vivo, pero se puntúa el resultado de los 90' (reg_*).
  const inExtra =
    (match.status === 'live' || match.status === 'finished') &&
    !!match.matchDuration && match.matchDuration !== 'REGULAR'
  // En penales, el marcador grande muestra el resultado de los 90' y la tanda va entre
  // paréntesis (ej. "1 (4)"). El score real (match.*Score) trae el marcador de la tanda.
  const isPens = inExtra && match.matchDuration === 'PENALTY_SHOOTOUT'
  const extraLabel = inExtra
    ? (match.matchDuration === 'PENALTY_SHOOTOUT' ? t.matches.penalties : t.matches.extraTime)
    : null

  // Resultado a los 90' (lo que puntúa). Si está disponible, la leyenda muestra el número
  // (ej. "90′: 1-1 · se puntúa este resultado") para despejar dudas cuando el marcador real
  // (con alargue/penales) difiere del que dio puntos.
  const reg90 =
    match.regHomeScore != null && match.regAwayScore != null
      ? `${match.regHomeScore}-${match.regAwayScore}`
      : null
  const scored90Text = reg90
    ? t.matches.scored90Detail.replace('{score}', reg90)
    : t.matches.scored90

  const showResultFooter =
    (match.status === 'live' || match.status === 'finished') &&
    (hasPickValues || match.userPoints !== undefined || inExtra || match.pickDivergent === true)

  // Aviso del fixture cuando cargaste picks distintos entre prodes: verde para transmitir "guardado".
  const divergentNote = (
    <span style={{ fontSize: 11, color: '#27ae60', fontWeight: 700 }}>{t.matches.pickDivergent}</span>
  )

  return (
    <div
      ref={cardRef}
      id={`m-${match.id}`}
      className="match-card-new"
      style={{
        borderBottom: '1px solid var(--border)',
        padding: '12px 14px',
        scrollMarginTop: '64px',
        background: highlight ? 'rgba(116,172,223,0.14)' : editing && hasPick ? 'rgba(116, 172, 223, 0.04)' : 'transparent',
        boxShadow: highlight ? 'inset 0 0 0 2px var(--accent)' : 'none',
        transition: 'background 0.3s, box-shadow 0.3s',
      }}
    >
      <div style={{ maxWidth: 540, margin: '0 auto' }}>
      {/* Header: estado/fecha + ojito */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, minHeight: 22 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>
          {match.status === 'live' ? (
            <span style={{ color: 'var(--live)', fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {extraLabel ? extraLabel.toUpperCase() : match.minute ? `${match.minute}'` : t.matches.live}
            </span>
          ) : match.status === 'finished' ? (
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t.matches.final}{extraLabel ? ` · ${extraLabel}` : ''}
            </span>
          ) : timeLocked ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Lock size={13} /> {t.matches.locked}</span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {!hideDate && <span>{matchDay}</span>}<Clock size={13} /> <b style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{matchTime}</b>
            </span>
          )}
        </span>
        {showReveal && prodeId && (
          <MatchPicksReveal matchId={match.id} prodeId={prodeId} homeTeam={match.homeTeam} awayTeam={match.awayTeam} />
        )}
      </div>

      {/* Resultado / steppers arriba; banderas + nombre abajo */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'end', maxWidth: 360, margin: '2px auto 0' }}>
        <TeamCol
          team={match.homeTeam} flagCode={match.homeFlag} editable={editing}
          stepperValue={pickHome} onBump={(dir) => bump('h', dir)} disabled={isLocked}
          result={match.status !== 'scheduled' ? (isPens ? (match.regHomeScore ?? match.homeScore ?? null) : (match.homeScore ?? null)) : null}
          penalty={isPens ? (match.homeScore ?? null) : null}
          pick={!editing && hasPickValues ? match.userPickHome : undefined}
        />
        <TeamCol
          team={match.awayTeam} flagCode={match.awayFlag} editable={editing}
          stepperValue={pickAway} onBump={(dir) => bump('a', dir)} disabled={isLocked}
          result={match.status !== 'scheduled' ? (isPens ? (match.regAwayScore ?? match.awayScore ?? null) : (match.awayScore ?? null)) : null}
          penalty={isPens ? (match.awayScore ?? null) : null}
          pick={!editing && hasPickValues ? match.userPickAway : undefined}
        />
      </div>

      {/* Cuotas (consenso de casas) — solo en partidos no finalizados y donde se pide */}
      {ODDS_ENABLED && showOdds && match.odds && match.status !== 'finished' && (
        <div style={{ maxWidth: 360, margin: '12px auto 0' }}>
          <div style={{ textAlign: 'center', fontSize: 9.5, fontWeight: 800, letterSpacing: 0.8, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 5 }}>{t.matches.odds}</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { label: t.matches.oddsHome, value: match.odds.home },
              { label: t.matches.oddsDraw, value: match.odds.draw },
              { label: t.matches.oddsAway, value: match.odds.away },
            ].map((o, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 4px', borderRadius: 8, border: '1px solid var(--border)', background: 'rgba(116,172,223,0.04)' }}>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.3 }}>{o.label}</span>
                <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{o.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Qué pronosticaron (distribución L/E/V) — al cerrar pronósticos y mientras no finalice */}
      {match.distribution && match.distribution.total > 0 && match.status !== 'finished' && (
        <div style={{ maxWidth: 360, margin: '12px auto 0' }}>
          <PickDistributionBar
            dist={match.distribution}
            userPick={
              match.userPickHome !== undefined && match.userPickAway !== undefined
                ? (match.userPickHome > match.userPickAway ? 'home' : match.userPickHome < match.userPickAway ? 'away' : 'draw')
                : null
            }
            labels={{
              title: t.matches.pickDistribution,
              home: t.matches.oddsHome,
              draw: t.matches.oddsDraw,
              away: t.matches.oddsAway,
              players: t.matches.distPlayers,
            }}
          />
        </div>
      )}

      {/* Footer */}
      {editing ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
          <button onClick={handleSave} disabled={!hasPick || !isDirty || saving} title={t.matches.save}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              minWidth: 140, padding: '9px 18px', borderRadius: 10, border: '1px solid transparent',
              fontSize: 13, fontWeight: 800,
              background: saved ? 'rgba(39,174,96,0.18)' : (hasPick && isDirty) ? 'var(--accent)' : 'var(--border)',
              color: saved ? '#7ee0a3' : (hasPick && isDirty) ? '#fff' : 'var(--text-muted)',
              cursor: (hasPick && isDirty) ? 'pointer' : 'default',
            }}>
            {saving ? '…' : saved ? <>✓ {t.matches.saved}</> : <><Save size={15} /> {t.matches.save}</>}
          </button>
        </div>
      ) : showResultFooter ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
          {inExtra && !isPens && <span style={{ fontSize: 10.5, color: '#f39c12', fontWeight: 700, marginRight: 'auto' }}>⏱ {scored90Text}</span>}
          {match.pickDivergent
            ? divergentNote
            : hasPickValues && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.matches.yourPick}: {match.userPickHome}-{match.userPickAway}</span>}
          {match.status === 'finished' && match.userPoints !== undefined && <PointsBadge points={match.userPoints} />}
        </div>
      ) : (match.status === 'scheduled' && (hasPickValues || match.pickDivergent)) ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: 10 }}>
          {match.pickDivergent
            ? divergentNote
            : <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700 }}>{t.matches.yourPick}: {match.userPickHome}-{match.userPickAway}</span>}
        </div>
      ) : null}
      </div>
    </div>
  )
}
