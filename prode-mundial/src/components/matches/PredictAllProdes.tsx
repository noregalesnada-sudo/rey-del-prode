'use client'

import { useState } from 'react'
import { Minus, Plus, Save, Users } from 'lucide-react'
import { useDictionary } from '@/hooks/useDictionary'
import { savePickAllProdes } from '@/lib/actions/picks'

export interface AllProdesMatch {
  id: string
  homeTeam: string
  awayTeam: string
  homeFlag?: string
  awayFlag?: string
  matchDate: string
}

const flagUrl = (code?: string) => (code ? `https://flagcdn.com/w40/${code}.png` : undefined)
const pad = (n: number) => String(n).padStart(2, '0')

const roundBtn: React.CSSProperties = {
  width: 34, height: 34, borderRadius: '50%', border: '1.5px solid var(--border-light)',
  background: 'rgba(116,172,223,0.12)', color: '#a8d4f5',
  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
}

function TeamCol({ team, flagCode, value, onBump }: {
  team: string; flagCode?: string; value: string; onBump: (d: number) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <button onClick={() => onBump(-1)} style={roundBtn} aria-label="-"><Minus size={16} /></button>
        <span style={{ minWidth: 24, textAlign: 'center', fontSize: 24, fontWeight: 900, fontVariantNumeric: 'tabular-nums', color: value === '' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
          {value === '' ? '–' : value}
        </span>
        <button onClick={() => onBump(1)} style={roundBtn} aria-label="+"><Plus size={16} /></button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0, maxWidth: '100%' }}>
        {flagCode && <img src={flagUrl(flagCode)} alt={team} style={{ width: 26, height: 19, objectFit: 'cover', borderRadius: 3, flexShrink: 0 }} />}
        <span style={{ fontWeight: 800, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team}</span>
      </div>
    </div>
  )
}

export default function PredictAllProdes({ match, prodeCount, initialHome, initialAway }: {
  match: AllProdesMatch
  prodeCount: number
  initialHome?: number
  initialAway?: number
}) {
  const t = useDictionary()
  const c = t.cargar
  const [home, setHome] = useState<string>(initialHome !== undefined ? String(initialHome) : '')
  const [away, setAway] = useState<string>(initialAway !== undefined ? String(initialAway) : '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [savedCount, setSavedCount] = useState(prodeCount)
  const [error, setError] = useState<string | null>(null)

  const hasPick = home !== '' && away !== ''
  const n = String(prodeCount)

  function bump(side: 'h' | 'a', dir: number) {
    setSaved(false); setError(null)
    const cur = side === 'h' ? home : away
    const v = cur === '' ? '0' : String(Math.max(0, parseInt(cur, 10) + dir))
    if (side === 'h') setHome(v); else setAway(v)
  }

  async function save() {
    if (!hasPick || saving) return
    setSaving(true); setError(null)
    const res = await savePickAllProdes(match.id, Number(home), Number(away))
    setSaving(false)
    if (res?.error) { setError(res.error); return }
    setSavedCount(res?.count ?? prodeCount)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const d = new Date(match.matchDate)
  const when = `${pad(d.getDate())}/${pad(d.getMonth() + 1)} · ${pad(d.getHours())}:${pad(d.getMinutes())}`

  return (
    <div style={{
      background: 'linear-gradient(160deg,#13325f,#0c2546)', border: '1px solid #fad54a66',
      borderRadius: 16, padding: 16, marginBottom: 18, boxShadow: '0 8px 22px rgba(250,213,74,.12)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 4 }}>
        <Users size={20} color="#fad54a" />
        <span style={{ fontSize: 16, fontWeight: 900 }}>{c.allTitle}</span>
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: '0 0 14px' }}>
        {c.allHint.replace('{n}', n)}
      </p>

      <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 8 }}>{when}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'end', maxWidth: 360, margin: '0 auto' }}>
        <TeamCol team={match.homeTeam} flagCode={match.homeFlag} value={home} onBump={(d) => bump('h', d)} />
        <TeamCol team={match.awayTeam} flagCode={match.awayFlag} value={away} onBump={(d) => bump('a', d)} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
        <button onClick={save} disabled={!hasPick || saving}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            minWidth: 220, padding: '11px 18px', borderRadius: 11, border: '1px solid transparent',
            fontSize: 13.5, fontWeight: 800,
            background: saved ? 'rgba(39,174,96,0.18)' : hasPick ? '#fad54a' : 'var(--border)',
            color: saved ? '#7ee0a3' : hasPick ? '#1a1205' : 'var(--text-muted)',
            cursor: hasPick && !saving ? 'pointer' : 'default',
          }}>
          {saving ? '…' : saved ? c.savedAll.replace('{n}', String(savedCount)) : <><Save size={15} /> {c.saveAll}</>}
        </button>
      </div>

      {error && <p style={{ fontSize: 12, color: 'var(--live, #e74c3c)', textAlign: 'center', margin: '10px 0 0' }}>{error}</p>}
    </div>
  )
}
