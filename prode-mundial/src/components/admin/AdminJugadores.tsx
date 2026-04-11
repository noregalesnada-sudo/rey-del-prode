'use client'

import { useState, useTransition } from 'react'
import { updateMemberArea } from '@/lib/actions/admin'

interface Jugador {
  user_id: string
  username: string
  first_name: string
  last_name: string
  area: string
  picks: number
  puntos: number
}

const TOTAL_MATCHES = 104

export default function AdminJugadores({
  jugadores,
  prodeId,
  companySlug,
}: {
  jugadores: Jugador[]
  prodeId: string
  companySlug: string
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [areaValue, setAreaValue] = useState('')
  const [isPending, startTransition] = useTransition()
  const [localJugadores, setLocalJugadores] = useState(jugadores)

  function startEdit(j: Jugador) {
    setEditingId(j.user_id)
    setAreaValue(j.area === '—' ? '' : j.area)
  }

  function saveArea(userId: string) {
    startTransition(async () => {
      await updateMemberArea(prodeId, userId, areaValue)
      setLocalJugadores((prev) =>
        prev.map((j) => j.user_id === userId ? { ...j, area: areaValue || '—' } : j)
      )
      setEditingId(null)
    })
  }

  const sinPicks = localJugadores.filter((j) => j.picks === 0).length
  const conPicks = localJugadores.length - sinPicks

  return (
    <div>
      {/* Stats rápidas */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { label: 'Total jugadores', value: localJugadores.length },
          { label: 'Con pronósticos', value: conPicks },
          { label: 'Sin pronósticos', value: sinPicks },
        ].map((s) => (
          <div key={s.label} style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '14px 20px',
            minWidth: '140px',
          }}>
            <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--accent)' }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-section-header)' }}>
              {['#', 'Jugador', 'Gerencia', 'Pronósticos', 'Puntos'].map((h, i) => (
                <th key={h} style={{
                  padding: '9px 14px',
                  textAlign: i >= 3 ? 'center' : 'left',
                  fontSize: '11px', color: 'var(--text-muted)',
                  fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {localJugadores.map((j, i) => (
              <tr key={j.user_id} style={{ borderTop: '1px solid var(--border)', background: 'transparent' }}>
                <td style={{ padding: '10px 14px', fontSize: '13px', color: 'var(--text-muted)', width: '36px' }}>
                  {i + 1}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>
                    {j.first_name} {j.last_name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@{j.username}</div>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  {editingId === j.user_id ? (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <input
                        value={areaValue}
                        onChange={(e) => setAreaValue(e.target.value)}
                        style={{
                          background: 'var(--bg-primary)', border: '1px solid var(--accent)',
                          borderRadius: '4px', padding: '4px 8px', color: 'var(--text-primary)',
                          fontSize: '13px', outline: 'none', width: '130px',
                        }}
                        autoFocus
                        onKeyDown={(e) => { if (e.key === 'Enter') saveArea(j.user_id); if (e.key === 'Escape') setEditingId(null) }}
                      />
                      <button onClick={() => saveArea(j.user_id)} disabled={isPending} style={{
                        background: 'var(--accent)', color: '#fff', border: 'none',
                        borderRadius: '4px', padding: '4px 10px', fontSize: '12px',
                        fontWeight: 700, cursor: 'pointer',
                      }}>OK</button>
                      <button onClick={() => setEditingId(null)} style={{
                        background: 'none', color: 'var(--text-muted)', border: 'none',
                        fontSize: '18px', cursor: 'pointer', lineHeight: 1,
                      }}>×</button>
                    </div>
                  ) : (
                    <div
                      onClick={() => startEdit(j)}
                      style={{ cursor: 'pointer', fontSize: '13px', color: j.area === '—' ? 'var(--text-muted)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}
                      title="Click para editar"
                    >
                      {j.area}
                      <span style={{ fontSize: '11px', color: 'var(--accent)', opacity: 0.7 }}>✎</span>
                    </div>
                  )}
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                  <span style={{ fontSize: '13px', color: j.picks === 0 ? 'var(--live)' : 'var(--text-muted)' }}>
                    {j.picks}/{TOTAL_MATCHES}
                  </span>
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                  <span style={{ fontSize: '15px', fontWeight: 900, color: i === 0 ? '#FFD700' : 'var(--accent)' }}>
                    {j.puntos}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
