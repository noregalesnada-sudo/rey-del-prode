'use client'

import { useState, useTransition } from 'react'
import { Trophy, Edit2, Plus, Trash2, Check } from 'lucide-react'
import { savePrizes } from '@/lib/actions/prizes'

interface Prize {
  position: number
  description: string
}

interface PrizesSectionProps {
  prodeId: string
  prizes: Prize[]
  isAdmin: boolean
  isEnterprise?: boolean
}

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function PrizesSection({ prodeId, prizes: initialPrizes, isAdmin, isEnterprise = false }: PrizesSectionProps) {
  const [editing, setEditing] = useState(false)
  const [prizes, setPrizes] = useState<Prize[]>(
    initialPrizes.length > 0 ? initialPrizes : [{ position: 1, description: '' }]
  )
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  function addPosition() {
    const next = Math.max(...prizes.map((p) => p.position), 0) + 1
    setPrizes([...prizes, { position: next, description: '' }])
  }

  function remove(pos: number) {
    const filtered = prizes.filter((p) => p.position !== pos)
    // Renumerar
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
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    })
  }

  if (initialPrizes.length === 0 && !isAdmin) return null

  return (
    <div style={{ marginBottom: '16px', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        background: 'var(--bg-section-header)', borderRadius: '8px 8px 0 0',
        padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '32px',
      }}>
        <span style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trophy size={14} style={{ color: 'var(--accent)' }} />
          PREMIOS EN JUEGO
        </span>
        {isAdmin && !isEnterprise && (
          <button
            onClick={() => setEditing(!editing)}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700 }}
          >
            <Edit2 size={13} /> {editing ? 'Cancelar' : 'Editar'}
          </button>
        )}
      </div>

      {/* Contenido */}
      <div style={{ padding: '12px 16px' }}>
        {!editing ? (
          // Vista
          initialPrizes.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>
              No hay premios cargados aún. {isAdmin && 'Hacé clic en Editar para agregar.'}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {initialPrizes.map((p) => (
                <div key={p.position} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: p.position <= 3 ? '20px' : '14px', minWidth: '28px', textAlign: 'center' }}>
                    {MEDALS[p.position] ?? `${p.position}°`}
                  </span>
                  <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: p.position === 1 ? 700 : 400 }}>
                    {p.description}
                  </span>
                </div>
              ))}
            </div>
          )
        ) : (
          // Edición
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {prizes.map((p) => (
              <div key={p.position} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ minWidth: '28px', textAlign: 'center', fontSize: '16px' }}>
                  {MEDALS[p.position] ?? `${p.position}°`}
                </span>
                <input
                  type="text"
                  value={p.description}
                  onChange={(e) => handleChange(p.position, e.target.value)}
                  placeholder={`Premio para el puesto ${p.position}`}
                  maxLength={100}
                  style={{
                    flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                    borderRadius: '4px', padding: '6px 10px', color: 'var(--text-primary)',
                    fontSize: '13px', outline: 'none',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
                />
                {prizes.length > 1 && (
                  <button onClick={() => remove(p.position)} style={{ background: 'none', border: 'none', color: 'var(--live)', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}

            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button onClick={addPosition} style={{
                background: 'none', border: '1px solid var(--border-light)', borderRadius: '4px',
                padding: '6px 12px', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                <Plus size={13} /> Agregar puesto
              </button>
              <button onClick={handleSave} disabled={isPending} style={{
                background: 'var(--accent)', border: 'none', borderRadius: '4px',
                padding: '6px 16px', color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px', opacity: isPending ? 0.7 : 1,
              }}>
                <Check size={13} /> {isPending ? 'Guardando...' : 'Guardar premios'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
