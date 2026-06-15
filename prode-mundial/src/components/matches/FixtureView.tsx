'use client'

import { useEffect, useMemo, useState } from 'react'
import MatchSection from '@/components/matches/MatchSection'
import { type Match } from '@/components/matches/MatchCard'
import { useDictionary } from '@/hooks/useDictionary'

const PHASES = ['groups', 'r32', 'r16', 'qf', 'sf', 'final'] as const
type Phase = (typeof PHASES)[number]
const ICON: Record<Phase, string> = { groups: '🏆', r32: '⚽', r16: '⚽', qf: '⚽', sf: '⚽', final: '🏅' }

type Mode = 'phase' | 'day'

// Clave de día estable en hora local "YYYY-MM-DD" (consistente con el divisor de MatchSection)
function localDayKey(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface FixtureViewProps {
  matches: Match[]
  initialPhase?: string
}

export default function FixtureView({ matches, initialPhase }: FixtureViewProps) {
  const t = useDictionary()
  const weekdays = (t as { fixture: { weekdays: string[] } }).fixture.weekdays
  const fx = (t as { fixture: { byPhase: string; byDay: string; today: string; noMatchesDay: string } }).fixture

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
  const [mode, setMode] = useState<Mode>('phase')

  const days = useMemo(() => {
    const map = new Map<string, { key: string; date: Date; dd: string; wd: number }>()
    for (const m of matches) {
      const key = localDayKey(m.matchDate)
      if (!map.has(key)) {
        const d = new Date(m.matchDate)
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
    const n = new Date()
    setTodayKey(`${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`)
  }, [])

  const defaultDay = useMemo(() => {
    if (!days.length) return null
    if (todayKey) return (days.find((d) => d.key >= todayKey) ?? days[0]).key
    return days[0].key
  }, [days, todayKey])

  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const activeDay = selectedDay ?? defaultDay

  const dayMatches = useMemo(
    () => matches.filter((m) => localDayKey(m.matchDate) === activeDay)
      .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime()),
    [matches, activeDay],
  )
  const activeDayInfo = days.find((d) => d.key === activeDay)
  const dayTitle = activeDayInfo
    ? activeDay === todayKey
      ? `${fx.today} · ${weekdays[activeDayInfo.wd]} ${activeDayInfo.dd}`
      : `${weekdays[activeDayInfo.wd]} ${activeDayInfo.dd}`
    : ''

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
          {([['phase', fx.byPhase, '🏆'], ['day', fx.byDay, '📅']] as const).map(([m, label, icon]) => {
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
      ) : (
        <>
          {/* Selector de días */}
          <div className="chips-row" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '2px 4px 14px' }}>
            {days.map((d) => {
              const on = d.key === activeDay
              const isToday = d.key === todayKey
              return (
                <button
                  key={d.key}
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

          {dayMatches.length > 0
            ? <MatchSection title={dayTitle} icon="📅" matches={dayMatches} canEdit={false} hideDate />
            : <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontSize: 14 }}>{fx.noMatchesDay}</div>}
        </>
      )}
    </div>
  )
}
