'use client'

import { useState, useTransition } from 'react'
import { Trophy, Edit2, Plus, Trash2, Check } from 'lucide-react'
import { savePrizes } from '@/lib/actions/prizes'

interface Prize {
  position: number
  description: string
}

interface Labels {
  title: string
  edit: string
  cancel: string
  empty: string
  emptyAdmin: string
  placeholder: string
  addPosition: string
  saving: string
  save: string
}

interface PrizesSectionProps {
  prodeId: string
  prizes: Prize[]
  isAdmin: boolean
  isEnterprise?: boolean
  labels: Labels
}

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function PrizesSection({ prodeId, prizes: initialPrizes, isAdmin, isEnterprise = false, labels }: PrizesSectionProps) {
  const [editing, setEditing] = useState(false)
  const [prizes, setPrizes] = useState<Prize[]>(
    initialPrizes.length > 0 ? initialPrizes : [{ position: 1, description: '' }]
  )
  const [isPending, startTransition] = useTransition()

  function addPosition() {
    const next = Math.max(...prizes.map((p) => p.position), 0) + 1
    setPrizes([...prizes, { position: next, description: '' }])
  }

  function remove(pos: number) {
    const filtered = prizes.filter((p) => p.position !== pos)
    setPrizes(filtered.map((p, i) => ({ ...p, position: i + 1 })))
  }

  function handleChange(pos: number, value: string) {
    setPrizes(prizes.map((p) => p.position === pos ? { ...p, description: value } : p))
  }

  function handleSave() {
    startTransition(async () => {
      const res = await savePrizes(prodeId, prizes)
      if (!res?.error) {
        setEditing(false)
      }
    })
  }

  if (initialPrizes.length === 0 && !isAdmin) return null

  return (
    <div style={{ marginBottom: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '14px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: editing || initialPrizes.length > 0 ? 12 : 0 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--gold-light, #fad54a)' }}>
          <Trophy size={15} color="#fad54a" />
          {labels.title}
        </span>
        {isAdmin && !isEnterprise && (
          <button
            onClick={() => setEditing(!editing)}
            style={{ background: 'none', border: 'none', color: 'var(--accent-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 800 }}
          >
            <Edit2 size={13} /> {editing ? labels.cancel : labels.edit}
          </button>
        )}
      </div>

      {/* Contenido */}
      {!editing ? (
        initialPrizes.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>
            {labels.empty} {isAdmin && labels.emptyAdmin}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {initialPrizes.map((p, i) => (
              <div key={p.position} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontSize: p.position <= 3 ? '20px' : '14px', minWidth: '30px', textAlign: 'center', fontWeight: 800, color: 'var(--text-muted)' }}>
                  {MEDALS[p.position] ?? `${p.position}°`}
                </span>
                <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: p.position === 1 ? 800 : 600, lineHeight: 1.4 }}>
                  {p.description}
                </span>
              </div>
            ))}
          </div>
        )
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {prizes.map((p) => (
            <div key={p.position} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ minWidth: '30px', textAlign: 'center', fontSize: '18px' }}>
                {MEDALS[p.position] ?? `${p.position}°`}
              </span>
              <input
                type="text"
                value={p.description}
                onChange={(e) => handleChange(p.position, e.target.value)}
                placeholder={labels.placeholder.replace('{n}', String(p.position))}
                maxLength={100}
                style={{
                  flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                  borderRadius: '8px', padding: '8px 12px', color: 'var(--text-primary)',
                  fontSize: '13px', outline: 'none',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
              />
              {prizes.length > 1 && (
                <button onClick={() => remove(p.position)} style={{ background: 'none', border: 'none', color: 'var(--live)', cursor: 'pointer', display: 'flex' }}>
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button onClick={addPosition} style={{
              background: 'none', border: '1px solid var(--border-light)', borderRadius: '10px',
              padding: '8px 14px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '5px',
            }}>
              <Plus size={13} /> {labels.addPosition}
            </button>
            <button onClick={handleSave} disabled={isPending} style={{
              background: 'linear-gradient(135deg,#fad54a,#c9a010)', border: 'none', borderRadius: '10px',
              padding: '8px 18px', color: '#3a2c00', fontWeight: 900, fontSize: '13px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '5px', opacity: isPending ? 0.7 : 1,
            }}>
              <Check size={14} /> {isPending ? labels.saving : labels.save}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
