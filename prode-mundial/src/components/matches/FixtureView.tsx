'use client'

import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react'
import MatchSection from '@/components/matches/MatchSection'
import BracketView from '@/components/matches/BracketView'
import { type Match } from '@/components/matches/MatchCard'
import { useDictionary } from '@/hooks/useDictionary'

const PHASES = ['groups', 'r32', 'r16', 'qf', 'sf', 'final'] as const
type Phase = (typeof PHASES)[number]
const ICON: Record<Phase, string> = { groups: '🏆', r32: '⚽', r16: '⚽', qf: '⚽', sf: '⚽', final: '🏅' }

type Mode = 'phase' | 'day' | 'bracket' | 'table'

export interface GroupStanding {
  group: string
  rows: Array<{
    position: number
    team: string
    flag: string
    played: number
    won: number
    draw: number
    lost: number
    gf: number
    ga: number
    gd: number
    points: number
  }>
}

// Un partido antes de las 6am cuenta para la jornada del día anterior (trasnoche): uno a las
// 00/01hs entra en el día de la noche previa en vez de aparecer recién mañana. Igual que el prode.
const MATCHDAY_CUTOFF_HOUR = 6
function matchdayDate(dateStr: string | Date): Date {
  return new Date(new Date(dateStr).getTime() - MATCHDAY_CUTOFF_HOUR * 3_600_000)
}
const isLateNight = (dateStr: string) => new Date(dateStr).getHours() < MATCHDAY_CUTOFF_HOUR

// Clave de día estable en hora local "YYYY-MM-DD" (consistente con el divisor de MatchSection)
function localDayKey(dateStr: string): string {
  const d = matchdayDate(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface FixtureViewProps {
  matches: Match[]
  initialPhase?: string
  standings?: GroupStanding[]
}

export default function FixtureView({ matches, initialPhase, standings = [] }: FixtureViewProps) {
  const t = useDictionary()
  const weekdays = (t as { fixture: { weekdays: string[] } }).fixture.weekdays
  const fx = (t as { fixture: {
    byPhase: string; byDay: string; today: string; trasnoche: string; noMatchesDay: string; table: string
    played: string; goals: string; goalDiff: string; points: string; won: string; draw: string; lost: string
    qualifiesDirect: string; qualifiesPossible: string; bracket: string
  } }).fixture

  // --- Modo "Por fase" (comportamiento original) ---
  const available = PHASES.filter((p) => matches.some((m) => m.phase === p))
  const valid = (p?: string): p is Phase => !!p && (PHASES as readonly string[]).includes(p)
  const [phase, setPhase] = useState<Phase>(valid(initialPhase) ? initialPhase : available[0] ?? 'groups')

  const phaseMatches = matches.filter((m) => m.phase === phase)
  const phaseLabel = (t.nav.phases as Record<string, string>)[phase]
  const groups = phase === 'groups'
    ? ([...new Set(phaseMatches.map((m) => m.group).filter(Boolean))].sort() as string[])
    : []

  // --- Modo "Por día" ---
  // Siempre entramos parados en "Por día" (en Hoy), aunque la URL traiga ?phase=.
  // El ?phase= solo pre-selecciona el chip de fase por si el usuario togglea a "Por fase".
  const [mode, setMode] = useState<Mode>('day')

  const days = useMemo(() => {
    const map = new Map<string, { key: string; date: Date; dd: string; wd: number }>()
    for (const m of matches) {
      const key = localDayKey(m.matchDate)
      if (!map.has(key)) {
        const d = matchdayDate(m.matchDate)
        map.set(key, {
          key,
          date: d,
          dd: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
          wd: d.getDay(),
        })
      }
    }
    return [...map.values()].sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [matches])

  // "Hoy" sólo se resuelve en el cliente para evitar mismatches de hidratación
  const [todayKey, setTodayKey] = useState<string | null>(null)
  useEffect(() => {
    const n = matchdayDate(new Date())
    setTodayKey(`${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`)
  }, [])

  const defaultDay = useMemo(() => {
    if (!days.length) return null
    if (todayKey) return (days.find((d) => d.key >= todayKey) ?? days[0]).key
    return days[0].key
  }, [days, todayKey])

  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const activeDay = selectedDay ?? defaultDay

  // Centrar el chip del día activo en el scroll horizontal (al abrir "Hoy" queda al medio, no pegado a la derecha)
  const daysRowRef = useRef<HTMLDivElement>(null)
  const activeChipRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (mode !== 'day') return
    const row = daysRowRef.current
    const chip = activeChipRef.current
    if (!row || !chip) return
    const delta = (chip.getBoundingClientRect().left - row.getBoundingClientRect().left)
      - (row.clientWidth - chip.clientWidth) / 2
    row.scrollLeft += delta
  }, [activeDay, mode])

  const dayMatches = useMemo(
    () => matches.filter((m) => localDayKey(m.matchDate) === activeDay)
      .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime()),
    [matches, activeDay],
  )
  // Dentro de la jornada, los partidos de madrugada (<6am) van bajo un divisor "Trasnoche" aparte
  const dayMain = dayMatches.filter((m) => !isLateNight(m.matchDate))
  const dayLate = dayMatches.filter((m) => isLateNight(m.matchDate))
  const lateTitle = dayLate.length
    ? `${fx.trasnoche} · ${String(new Date(dayLate[0].matchDate).getDate()).padStart(2, '0')}/${String(new Date(dayLate[0].matchDate).getMonth() + 1).padStart(2, '0')}`
    : ''
  const activeDayInfo = days.find((d) => d.key === activeDay)
  const dayTitle = activeDayInfo
    ? activeDay === todayKey
      ? `${fx.today} · ${weekdays[activeDayInfo.wd]} ${activeDayInfo.dd}`
      : `${weekdays[activeDayInfo.wd]} ${activeDayInfo.dd}`
    : ''

  // Resultado en vivo por equipo (desde su perspectiva), para mostrarlo en la tabla
  const liveByTeam = useMemo(() => {
    const map = new Map<string, string>()
    for (const m of matches) {
      if (m.status !== 'live') continue
      const h = m.homeScore ?? 0
      const a = m.awayScore ?? 0
      map.set(m.homeTeam, `${h}-${a}`)
      map.set(m.awayTeam, `${a}-${h}`)
    }
    return map
  }, [matches])

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ fontWeight: 900, fontSize: 16, textTransform: 'uppercase', letterSpacing: 1, margin: '0 4px 14px' }}>
        {t.nav.fasesMundial}
      </h1>

      {/* Toggle Por fase / Por día */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '0 4px 14px' }}>
        <div
          style={{
            display: 'inline-flex', position: 'relative', padding: 4, gap: 4,
            background: 'color-mix(in srgb, var(--text-muted) 10%, transparent)',
            border: '1px solid var(--border)', borderRadius: 999,
          }}
        >
          {(() => {
            const modes: Array<[Mode, string, string]> = [
              ['phase', fx.byPhase, '🏆'],
              ['day', fx.byDay, '📅'],
            ]
            if (available.some((p) => p !== 'groups')) modes.push(['bracket', fx.bracket, '⚔️'])
            if (standings.length > 0) modes.push(['table', fx.table, '📊'])
            return modes
          })().map(([m, label, icon]) => {
            const on = mode === m
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  padding: '7px 18px', borderRadius: 999, fontSize: 13, fontWeight: 800, cursor: 'pointer',
                  border: 'none', whiteSpace: 'nowrap', transition: 'background .18s, color .18s, box-shadow .18s',
                  background: on ? 'var(--accent)' : 'transparent',
                  color: on ? '#fff' : 'var(--text-muted)',
                  boxShadow: on ? '0 2px 8px color-mix(in srgb, var(--accent) 45%, transparent)' : 'none',
                }}
              >
                {icon} {label}
              </button>
            )
          })}
        </div>
      </div>

      {mode === 'phase' ? (
        <>
          {/* Filtro de fase */}
          <div className="chips-row" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '2px 4px 14px' }}>
            {available.map((p) => {
              const on = p === phase
              return (
                <button
                  key={p}
                  onClick={() => setPhase(p)}
                  style={{
                    flex: '0 0 auto', padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 800, cursor: 'pointer',
                    border: on ? '1px solid var(--accent)' : '1px solid var(--border)',
                    background: on ? 'var(--accent)' : 'transparent',
                    color: on ? '#fff' : 'var(--text-muted)', whiteSpace: 'nowrap',
                  }}
                >
                  {ICON[p]} {(t.nav.phases as Record<string, string>)[p]}
                </button>
              )
            })}
          </div>

          {phase === 'groups'
            ? groups.map((g) => (
                <MatchSection key={g} title={`${t.fase.group} ${g}`} matches={phaseMatches.filter((m) => m.group === g)} canEdit={false} />
              ))
            : phaseMatches.length > 0
              ? <MatchSection title={phaseLabel} icon={ICON[phase]} matches={phaseMatches} canEdit={false} />
              : <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontSize: 14 }}>{t.fase.pendingMatches}</div>}
        </>
      ) : mode === 'day' ? (
        <>
          {/* Selector de días */}
          <div ref={daysRowRef} className="chips-row" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '2px 4px 14px' }}>
            {days.map((d) => {
              const on = d.key === activeDay
              const isToday = d.key === todayKey
              return (
                <button
                  key={d.key}
                  ref={on ? activeChipRef : undefined}
                  onClick={() => setSelectedDay(d.key)}
                  style={{
                    flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                    minWidth: 56, padding: '7px 12px', borderRadius: 14, cursor: 'pointer',
                    border: on ? '1px solid var(--accent)' : isToday ? '1px solid color-mix(in srgb, var(--accent) 55%, transparent)' : '1px solid var(--border)',
                    background: on ? 'var(--accent)' : 'transparent',
                    color: on ? '#fff' : 'var(--text-muted)', whiteSpace: 'nowrap',
                    boxShadow: on ? '0 2px 8px color-mix(in srgb, var(--accent) 45%, transparent)' : 'none',
                  }}
                >
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.6, opacity: on ? 0.9 : 0.75 }}>
                    {isToday ? fx.today : weekdays[d.wd]}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: on ? '#fff' : 'var(--text-primary)' }}>{d.dd}</span>
                </button>
              )
            })}
          </div>

          {dayMatches.length > 0 ? (
            <>
              {dayMain.length > 0 && <MatchSection title={dayTitle} icon="📅" matches={dayMain} canEdit={false} hideDate showOdds />}
              {dayLate.length > 0 && <MatchSection title={lateTitle} icon="🌙" matches={dayLate} canEdit={false} hideDate showOdds />}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontSize: 14 }}>{fx.noMatchesDay}</div>
          )}
        </>
      ) : mode === 'bracket' ? (
        <BracketView matches={matches} />
      ) : (
        <StandingsTables
          standings={standings}
          groupLabel={t.fase.group}
          live={liveByTeam}
          liveLabel={t.matches.live}
          labels={{
            pts: fx.points, played: fx.played, goals: fx.goals, gd: fx.goalDiff,
            won: fx.won, draw: fx.draw, lost: fx.lost,
            qDirect: fx.qualifiesDirect, qPossible: fx.qualifiesPossible,
          }}
        />
      )}
    </div>
  )
}

const flagUrl = (code?: string) => (code ? `https://flagcdn.com/w40/${code}.png` : undefined)

const QUALIFY_GREEN = '#27ae60'
const QUALIFY_BLUE = '#3498db'

// Formato Mundial 2026 (12 grupos de 4): 1° y 2° clasifican directo a 16avos;
// 3° es "posible clasificado" (avanzan los 8 mejores terceros de los 12 grupos).
function qualColor(position: number): string | null {
  if (position <= 2) return QUALIFY_GREEN
  if (position === 3) return QUALIFY_BLUE
  return null
}

interface StandingsLabels {
  pts: string; played: string; goals: string; gd: string
  won: string; draw: string; lost: string
  qDirect: string; qPossible: string
}

function StandingsTables({
  standings,
  groupLabel,
  live,
  liveLabel,
  labels,
}: {
  standings: GroupStanding[]
  groupLabel: string
  live: Map<string, string>
  liveLabel: string
  labels: StandingsLabels
}) {
  const th: CSSProperties = { padding: '6px 6px', fontSize: 10, fontWeight: 800, letterSpacing: 0.3, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }
  const td: CSSProperties = { padding: '7px 6px', fontSize: 13, textAlign: 'center', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {standings.map((g) => {
        const groupLive = g.rows.some((r) => live.has(r.team))
        return (
          <div key={g.group} style={{ border: '1px solid var(--section-border)', borderRadius: 8, overflow: 'hidden' }}>
            {/* Encabezado del grupo */}
            <div style={{ background: 'var(--bg-section-header)', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.3, color: 'var(--text-primary)' }}>{groupLabel} {g.group}</span>
              {groupLive && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--live)', fontWeight: 900, fontSize: 11 }}>
                  <span className="live-dot" aria-hidden />{liveLabel}
                </span>
              )}
            </div>

            {/* Tabla (scroll horizontal en pantallas angostas) */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 360, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ ...th, width: 22 }}>#</th>
                    <th style={{ ...th, textAlign: 'left', minWidth: 120 }}>{' '}</th>
                    <th style={{ ...th, color: 'var(--text-primary)' }}>{labels.pts}</th>
                    <th style={th}>{labels.played}</th>
                    <th style={th}>{labels.goals}</th>
                    <th style={th}>{labels.gd}</th>
                    <th style={th}>{labels.won}</th>
                    <th style={th}>{labels.draw}</th>
                    <th style={th}>{labels.lost}</th>
                  </tr>
                </thead>
                <tbody>
                  {g.rows.map((r) => {
                    const color = qualColor(r.position)
                    const liveScore = live.get(r.team)
                    return (
                      <tr key={r.team + r.position} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={{ ...td, position: 'relative', fontWeight: 800, color: color ?? 'var(--text-muted)' }}>
                          {color && <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: color }} />}
                          {r.position}
                        </td>
                        <td style={{ ...td, textAlign: 'left' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                            {flagUrl(r.flag) && <img src={flagUrl(r.flag)} alt="" style={{ width: 20, height: 15, objectFit: 'cover', borderRadius: 2, flex: '0 0 auto' }} />}
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.team}</span>
                            {liveScore && (
                              <span style={{ flex: '0 0 auto', display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--live-bg)', color: 'var(--live)', fontWeight: 900, fontSize: 11, padding: '1px 7px', borderRadius: 6 }}>
                                <span className="live-dot" aria-hidden style={{ width: 6, height: 6 }} />{liveScore}
                              </span>
                            )}
                          </span>
                        </td>
                        <td style={{ ...td, color: 'var(--text-primary)', fontWeight: 900 }}>{r.points}</td>
                        <td style={td}>{r.played}</td>
                        <td style={td}>{r.gf}:{r.ga}</td>
                        <td style={td}>{r.gd > 0 ? `+${r.gd}` : r.gd}</td>
                        <td style={td}>{r.won}</td>
                        <td style={td}>{r.draw}</td>
                        <td style={td}>{r.lost}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}

      {/* Leyenda de colores */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: '4px 12px 2px', fontSize: 11, color: 'var(--text-muted)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: QUALIFY_GREEN }} />{labels.qDirect}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: QUALIFY_BLUE }} />{labels.qPossible}
        </span>
      </div>
    </div>
  )
}
