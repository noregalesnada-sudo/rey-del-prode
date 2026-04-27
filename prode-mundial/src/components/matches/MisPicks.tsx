'use client'

import { useState, useTransition } from 'react'
import { Save, Lock } from 'lucide-react'
import { saveAllDefaultPicks } from '@/lib/actions/default-picks'
import { useDictionary } from '@/hooks/useDictionary'

interface PickMatch {
  id: string
  homeTeam: string
  awayTeam: string
  homeFlag?: string
  awayFlag?: string
  matchDate: string
  status: 'scheduled' | 'live' | 'finished'
  group?: string
  phase: string
  defaultPickHome?: number
  defaultPickAway?: number
}

interface GroupedMatches {
  [group: string]: PickMatch[]
}

interface MisPicksProps {
  matches: PickMatch[]
}

function isLocked(matchDate: string, status: string): boolean {
  if (status !== 'scheduled') return true
  const minutes = (new Date(matchDate).getTime() - Date.now()) / 60000
  return minutes < 15
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

export default function MisPicks({ matches }: MisPicksProps) {
  const t = useDictionary()
  const [picks, setPicks] = useState<Record<string, { home: string; away: string }>>(() => {
    const init: Record<string, { home: string; away: string }> = {}
    matches.forEach((m) => {
      init[m.id] = {
        home: m.defaultPickHome !== undefined ? String(m.defaultPickHome) : '',
        away: m.defaultPickAway !== undefined ? String(m.defaultPickAway) : '',
      }
    })
    return init
  })

  // Picks realmente guardados en DB
  const [savedPicks, setSavedPicks] = useState<Set<string>>(() => {
    const s = new Set<string>()
    matches.forEach((m) => {
      if (m.defaultPickHome !== undefined && m.defaultPickAway !== undefined) s.add(m.id)
    })
    return s
  })

  // Partidos que se están guardando ahora
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set())

  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // Agrupar por grupo (fase de grupos) o fase
  const grouped: GroupedMatches = {}
  matches.forEach((m) => {
    const key = m.phase === 'groups' && m.group ? `${t.fase.group} ${m.group}` :
                m.phase === 'r32' || (m.phase === 'groups' && !m.group) ? t.nav.phases.r32 :
                m.phase === 'r16' ? t.nav.phases.r16 :
                m.phase === 'qf' ? t.nav.phases.qf :
                m.phase === 'sf' ? t.nav.phases.sf : t.nav.phases.final
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(m)
  })

  function handleChange(matchId: string, side: 'home' | 'away', value: string) {
    const num = value.replace(/[^0-9]/g, '')
    setPicks((prev) => ({ ...prev, [matchId]: { ...prev[matchId], [side]: num } }))
    // Marcar como no guardado al editar
    setSavedPicks((prev) => { const n = new Set(prev); n.delete(matchId); return n })
  }

  async function handleAutoSave(matchId: string) {
    const pick = picks[matchId]
    if (!pick || pick.home === '' || pick.away === '') return
    setSavingIds((prev) => new Set(prev).add(matchId))
    const res = await saveAllDefaultPicks([{ matchId, home: Number(pick.home), away: Number(pick.away) }])
    setSavingIds((prev) => { const n = new Set(prev); n.delete(matchId); return n })
    if (!res?.error) setSavedPicks((prev) => new Set(prev).add(matchId))
  }

  function handleSaveAll() {
    const toSave = Object.entries(picks)
      .filter(([, v]) => v.home !== '' && v.away !== '')
      .map(([matchId, v]) => ({ matchId, home: Number(v.home), away: Number(v.away) }))

    if (toSave.length === 0) {
      setResult({ type: 'error', msg: t.misPicks.noPicksError })
      return
    }

    startTransition(async () => {
      const res = await saveAllDefaultPicks(toSave)
      if (res?.error) {
        setResult({ type: 'error', msg: res.error })
      } else {
        setSavedPicks(new Set(toSave.map((p) => p.matchId)))
        setResult({ type: 'success', msg: t.misPicks.savedMessage.replace('{n}', String(res.saved)) })
        setTimeout(() => setResult(null), 4000)
      }
    })
  }

  const totalFilled = Object.values(picks).filter((v) => v.home !== '' && v.away !== '').length

  return (
    <div>
      {/* Header con botón guardar todo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '0 4px' }}>
        <div>
          <h2 style={{ fontWeight: 900, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
            {t.misPicks.title}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
            {t.misPicks.progress.replace('{filled}', String(totalFilled)).replace('{total}', String(matches.filter(m => !isLocked(m.matchDate, m.status)).length))}
          </p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={isPending || totalFilled === 0}
          style={{
            background: totalFilled > 0 ? 'var(--accent)' : 'var(--border)',
            color: totalFilled > 0 ? '#fff' : 'var(--text-muted)',
            border: 'none', borderRadius: '4px', padding: '8px 20px',
            fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center',
            gap: '6px', cursor: totalFilled > 0 ? 'pointer' : 'not-allowed',
            opacity: isPending ? 0.7 : 1,
          }}
        >
          {isPending ? '...' : <><Save size={14} /> {t.misPicks.saveAll}</>}
        </button>
      </div>

      {result && (
        <div style={{
          padding: '10px 16px', borderRadius: '4px', marginBottom: '16px', fontSize: '13px', fontWeight: 700,
          background: result.type === 'success' ? 'rgba(39, 174, 96, 0.15)' : 'rgba(231, 76, 60, 0.15)',
          color: result.type === 'success' ? '#27ae60' : 'var(--live)',
          border: `1px solid ${result.type === 'success' ? '#27ae60' : 'var(--live)'}`,
        }}>
          {result.msg}
        </div>
      )}

      {/* Partidos agrupados */}
      {Object.entries(grouped).map(([groupName, groupMatches]) => (
        <div key={groupName} style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', marginBottom: '4px' }}>
          {/* Header grupo */}
          <div style={{
            background: 'var(--bg-section-header)', borderRadius: '8px 8px 0 0',
            padding: '8px 12px', height: '32px', display: 'flex', alignItems: 'center',
          }}>
            <span style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
              {groupName}
            </span>
          </div>

          {/* Partidos */}
          {groupMatches.map((match) => {
            const locked = isLocked(match.matchDate, match.status)
            const pick = picks[match.id] ?? { home: '', away: '' }
            const hasPick = pick.home !== '' && pick.away !== ''

            return (
              <div
                key={match.id}
                style={{
                  borderTop: '1px solid var(--border)',
                  padding: '8px 16px',
                  display: 'grid',
                  gridTemplateColumns: '70px 1fr auto 1fr 80px',
                  alignItems: 'center',
                  gap: '8px',
                  background: hasPick ? 'rgba(116, 172, 223, 0.04)' : 'transparent',
                }}
              >
                {/* Fecha */}
                <div style={{ color: 'var(--text-muted)', fontSize: '11px', textAlign: 'center' }}>
                  {locked && match.status !== 'scheduled'
                    ? <span style={{ color: 'var(--text-muted)' }}>{t.matches.final}</span>
                    : locked
                    ? <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}><Lock size={10} /> {t.matches.locked}</span>
                    : formatDate(match.matchDate)
                  }
                </div>

                {/* Local */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', fontWeight: 700, fontSize: '13px' }}>
                  {match.homeTeam}
                  {match.homeFlag && <img src={`https://flagcdn.com/20x15/${match.homeFlag}.png`} width={20} height={15} alt={match.homeTeam} style={{ display: 'inline-block', flexShrink: 0 }} />}
                </div>

                {/* Inputs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    type="number" min={0} max={20}
                    value={pick.home}
                    onChange={(e) => handleChange(match.id, 'home', e.target.value)}
                    onBlur={() => handleAutoSave(match.id)}
                    disabled={locked}
                    style={{
                      width: '34px', textAlign: 'center', fontWeight: 700, fontSize: '15px', padding: '3px 0',
                      background: locked ? 'rgba(255,255,255,0.05)' : 'rgba(116, 172, 223, 0.15)',
                      border: `1px solid ${savedPicks.has(match.id) ? 'var(--accent)' : locked ? 'var(--border)' : 'var(--border-light)'}`,
                      borderRadius: '4px', color: 'var(--text-primary)', outline: 'none',
                    }}
                  />
                  <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>-</span>
                  <input
                    type="number" min={0} max={20}
                    value={pick.away}
                    onChange={(e) => handleChange(match.id, 'away', e.target.value)}
                    onBlur={() => handleAutoSave(match.id)}
                    disabled={locked}
                    style={{
                      width: '34px', textAlign: 'center', fontWeight: 700, fontSize: '15px', padding: '3px 0',
                      background: locked ? 'rgba(255,255,255,0.05)' : 'rgba(116, 172, 223, 0.15)',
                      border: `1px solid ${savedPicks.has(match.id) ? 'var(--accent)' : locked ? 'var(--border)' : 'var(--border-light)'}`,
                      borderRadius: '4px', color: 'var(--text-primary)', outline: 'none',
                    }}
                  />
                </div>

                {/* Visitante */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '13px' }}>
                  {match.awayFlag && <img src={`https://flagcdn.com/20x15/${match.awayFlag}.png`} width={20} height={15} alt={match.awayTeam} style={{ display: 'inline-block', flexShrink: 0 }} />}
                  {match.awayTeam}
                </div>

                {/* Estado pick */}
                <div style={{ textAlign: 'right' }}>
                  {savingIds.has(match.id) ? (
                    <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>...</span>
                  ) : savedPicks.has(match.id) && !locked ? (
                    <span style={{ color: 'var(--accent)', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
                      {t.matches.saved}
                    </span>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
