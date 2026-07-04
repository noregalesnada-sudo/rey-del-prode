'use client'

import { useState } from 'react'
import { Trophy, Eye, EyeOff } from 'lucide-react'
import { getChampionPicks, type RevealedChampion } from '@/lib/actions/champion'
import { teamFlag, translateTeam } from '@/lib/team-names'
import { useDictionary, useLang } from '@/hooks/useDictionary'

interface ChampionRevealCardProps {
  currentPick: string | null
  prodeId: string
  officialChampion?: string | null
}

export default function ChampionRevealCard({ currentPick, prodeId, officialChampion }: ChampionRevealCardProps) {
  const t = useDictionary()
  const lang = useLang()
  const en = lang === 'en'

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [champions, setChampions] = useState<RevealedChampion[] | null>(null)
  const [query, setQuery] = useState('')

  const revealLabel = en ? 'See champions' : 'Ver campeones'
  const hideLabel = en ? 'Hide' : 'Ocultar'
  const searchPlaceholder = en ? 'Search player…' : 'Buscar jugador…'
  const noChoiceLabel = en ? 'Not chosen' : 'Sin elegir'
  const noResultsLabel = en ? 'No matches' : 'Sin resultados'

  async function handleToggle() {
    if (open) {
      setOpen(false)
      return
    }
    setQuery('')
    setOpen(true)
    if (champions === null && !loading) {
      setLoading(true)
      setError(null)
      const res = await getChampionPicks(prodeId)
      if ('error' in res) setError(res.error)
      else setChampions(res.champions)
      setLoading(false)
    }
  }

  const q = query.trim().toLowerCase()
  const filtered = champions && q ? champions.filter((c) => c.name.toLowerCase().includes(q)) : champions

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(245,197,24,0.07), var(--bg-card))',
      border: '1px solid rgba(245,197,24,0.3)',
      borderRadius: 16,
      padding: '14px 16px',
      marginBottom: 20,
    }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
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
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.4 }}>
            {currentPick ? (
              <span>
                {en ? 'Your pick:' : 'Tu campeón:'}{' '}
                <strong style={{ color: 'var(--text-primary)' }}>
                  {teamFlag(currentPick)} {translateTeam(currentPick, lang)}
                </strong>
              </span>
            ) : (
              t.champion.deadline
            )}
          </div>
        </div>

        <button
          onClick={handleToggle}
          aria-label={revealLabel}
          style={{
            background: open ? 'rgba(245,197,24,0.22)' : 'rgba(245,197,24,0.12)',
            color: '#fad54a',
            border: '1px solid rgba(245,197,24,0.45)',
            borderRadius: 10,
            padding: '9px 14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            fontSize: 12,
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            transition: 'background 0.15s',
          }}
        >
          {open ? <EyeOff size={15} strokeWidth={2.5} /> : <Eye size={15} strokeWidth={2.5} />}
          {open ? hideLabel : revealLabel}
        </button>
      </div>

      {/* Lista */}
      {open && (
        <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          {loading && (
            <div style={{ padding: '10px 4px', fontSize: 12.5, color: 'var(--text-muted)', textAlign: 'center' }}>
              {t.matches.loadingPicks}
            </div>
          )}

          {!loading && error && (
            <div style={{ padding: '10px 4px', fontSize: 12.5, color: 'var(--live, #ef4444)', textAlign: 'center' }}>
              {error}
            </div>
          )}

          {!loading && !error && champions && champions.length > 12 && (
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              style={{ width: '100%', boxSizing: 'border-box', background: 'var(--bg-primary)', border: '1px solid var(--border-light)', borderRadius: 8, padding: '7px 10px', color: 'var(--text-primary)', fontSize: 12.5, outline: 'none', marginBottom: 8 }}
            />
          )}

          {!loading && !error && filtered && (
            filtered.length === 0 ? (
              <div style={{ padding: '10px 4px', fontSize: 12.5, color: 'var(--text-muted)', textAlign: 'center' }}>
                {noResultsLabel}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 340, overflowY: 'auto' }}>
                {filtered.map((c) => {
                  const hit = !!officialChampion && c.team === officialChampion
                  return (
                    <div
                      key={c.userId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 9,
                        padding: '6px 8px',
                        borderRadius: 8,
                        background: hit ? 'rgba(39,174,96,0.12)' : c.isYou ? 'rgba(245,197,24,0.08)' : 'transparent',
                      }}
                    >
                      {c.avatarUrl ? (
                        <img src={c.avatarUrl} alt="" style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <span style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, background: 'var(--border)', color: 'var(--text-muted)', fontSize: 10.5, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', textTransform: 'uppercase' }}>
                          {c.name.charAt(0)}
                        </span>
                      )}
                      <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: c.isYou ? 800 : 600, color: c.isYou ? 'var(--gold-light, #fad54a)' : 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.isYou ? `${c.name} (${en ? 'you' : 'vos'})` : c.name}
                      </span>
                      {c.team ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, fontSize: 12.5, fontWeight: 700, color: hit ? '#7ee0a3' : 'var(--text-primary)' }}>
                          <span style={{ fontSize: 15 }}>{teamFlag(c.team)}</span>
                          {translateTeam(c.team, lang)}
                          {hit && ' ✓'}
                        </span>
                      ) : (
                        <span style={{ flexShrink: 0, fontSize: 12, fontStyle: 'italic', color: 'var(--text-muted)' }}>
                          {noChoiceLabel}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
