'use client'

import { useState, useTransition } from 'react'
import { Trophy } from 'lucide-react'
import { saveChampionPick } from '@/lib/actions/champion'
import { WC2026_TEAMS } from '@/lib/wc2026-teams'
import { useDictionary } from '@/hooks/useDictionary'

interface ChampionPickSelectorProps {
  currentPick: string | null
  prodeId?: string
  officialChampion?: string | null
  teams?: string[]
}

export default function ChampionPickSelector({
  currentPick,
  prodeId,
  officialChampion,
  teams,
}: ChampionPickSelectorProps) {
  const t = useDictionary()
  const [selected, setSelected] = useState(currentPick ?? '')
  const [saved, setSaved] = useState(!!currentPick)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Deadline: 15 min antes del primer partido (11 jun 2026 16:00 ART = 19:00 UTC)
  const deadline = new Date('2026-06-11T16:00:00-03:00').getTime() - 15 * 60 * 1000
  const locked = Date.now() >= deadline || !!officialChampion

  const hit = officialChampion && currentPick === officialChampion

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelected(e.target.value)
    setSaved(false)
    setError(null)
  }

  function handleSave() {
    if (!selected) return
    startTransition(async () => {
      const res = await saveChampionPick(selected, prodeId)
      if (res?.error) {
        setError(res.error)
      } else {
        setSaved(true)
      }
    })
  }

  return (
    <div style={{
      background: hit
        ? 'linear-gradient(135deg, rgba(39,174,96,0.08), var(--bg-card))'
        : 'linear-gradient(135deg, rgba(245,197,24,0.07), var(--bg-card))',
      border: `1px solid ${hit ? 'rgba(39,174,96,0.4)' : 'rgba(245,197,24,0.3)'}`,
      borderRadius: 16,
      padding: '14px 16px',
      marginBottom: 16,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 12,
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--gold-light, #fad54a)' }}>
            <Trophy size={15} color="#fad54a" />
            {t.champion.title}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 999,
            background: 'rgba(245,197,24,0.14)', border: '1px solid rgba(245,197,24,0.35)', color: '#fad54a',
          }}>
            +10 pts
          </span>
          {hit && (
            <span style={{
              fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 999,
              background: 'rgba(39,174,96,0.15)', border: '1px solid rgba(39,174,96,0.4)', color: '#7ee0a3',
            }}>
              {t.champion.youGotIt}
            </span>
          )}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.4 }}>
          {locked && !officialChampion
            ? t.champion.deadline
            : officialChampion
            ? t.champion.officialChampion.replace('{team}', officialChampion)
            : t.champion.hint}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {locked ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 14px', borderRadius: 12, fontSize: 14, fontWeight: 800,
            background: 'rgba(245,197,24,0.10)', border: '1px solid rgba(245,197,24,0.3)',
            color: currentPick ? 'var(--text-primary)' : 'var(--text-muted)',
          }}>
            {currentPick ? <>👑 {currentPick}</> : t.champion.noChoice}
          </div>
        ) : (
          <>
            <select
              value={selected}
              onChange={handleChange}
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-light)',
                borderRadius: 10, padding: '9px 12px',
                fontSize: 13, fontWeight: 700, color: 'var(--text-primary)',
                outline: 'none', minWidth: 160, cursor: 'pointer',
              }}
            >
              <option value="">{t.champion.choosePlaceholder}</option>
              {(teams ?? WC2026_TEAMS).map((team) => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
            <button
              onClick={handleSave}
              disabled={!selected || isPending || saved}
              style={{
                padding: '9px 16px', borderRadius: 10,
                fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px',
                border: 'none', cursor: (!selected || isPending || saved) ? 'not-allowed' : 'pointer',
                background: saved ? 'rgba(39,174,96,0.15)' : 'linear-gradient(135deg,#fad54a,#c9a010)',
                color: saved ? '#7ee0a3' : '#3a2c00',
                transition: 'background 0.15s',
              }}
            >
              {isPending ? '...' : saved ? t.champion.saved : t.champion.save}
            </button>
          </>
        )}
      </div>

      {error && (
        <div style={{ width: '100%', fontSize: 12, color: '#ef4444' }}>{error}</div>
      )}
    </div>
  )
}
