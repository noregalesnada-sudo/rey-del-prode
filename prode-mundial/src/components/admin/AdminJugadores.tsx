'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { updateMemberArea, removeMemberFromProde } from '@/lib/actions/admin'

interface Jugador {
  user_id: string
  username: string
  first_name: string
  last_name: string
  email: string
  area: string
  picks: number
  puntos: number
}

const TOTAL_MATCHES = 104

const inputStyle: React.CSSProperties = {
  background: 'var(--bg-primary)',
  border: '1px solid var(--border-light)',
  borderRadius: '4px',
  padding: '7px 11px',
  color: 'var(--text-primary)',
  fontSize: '13px',
  outline: 'none',
}

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
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const [filterNombre, setFilterNombre] = useState('')
  const [filterEmail, setFilterEmail] = useState('')
  const [filterArea, setFilterArea] = useState('')

  function startEdit(j: Jugador) {
    setEditingId(j.user_id)
    setAreaValue(j.area === '—' ? '' : j.area)
  }

  function removeJugador(userId: string) {
    setMenuOpenId(null)
    setConfirmDeleteId(null)
    startTransition(async () => {
      await removeMemberFromProde(prodeId, userId)
      setLocalJugadores((prev) => prev.filter((j) => j.user_id !== userId))
    })
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

  const filtered = localJugadores.filter((j) => {
    const nombre = `${j.first_name} ${j.last_name} ${j.username}`.toLowerCase()
    if (filterNombre && !nombre.includes(filterNombre.toLowerCase())) return false
    if (filterEmail && !j.email.toLowerCase().includes(filterEmail.toLowerCase())) return false
    if (filterArea && !j.area.toLowerCase().includes(filterArea.toLowerCase())) return false
    return true
  })

  const sinPicks = localJugadores.filter((j) => j.picks === 0).length
  const conPicks = localJugadores.length - sinPicks

  // Áreas únicas para el dropdown
  const areas = Array.from(new Set(localJugadores.map((j) => j.area).filter((a) => a !== '—'))).sort()

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
            {/* Fila de filtros */}
            <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '8px 14px' }} />
              <td style={{ padding: '8px 8px' }}>
                <input
                  value={filterNombre}
                  onChange={(e) => setFilterNombre(e.target.value)}
                  placeholder="Buscar jugador..."
                  style={{ ...inputStyle, width: '100%' }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
                />
              </td>
              <td style={{ padding: '8px 8px' }}>
                <input
                  value={filterEmail}
                  onChange={(e) => setFilterEmail(e.target.value)}
                  placeholder="Buscar email..."
                  style={{ ...inputStyle, width: '100%' }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
                />
              </td>
              <td style={{ padding: '8px 8px' }}>
                <select
                  value={filterArea}
                  onChange={(e) => setFilterArea(e.target.value)}
                  style={{ ...inputStyle, width: '100%', cursor: 'pointer' }}
                >
                  <option value="">Todas las áreas</option>
                  {areas.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </td>
              <td style={{ padding: '8px 8px' }} colSpan={2}>
                {(filterNombre || filterEmail || filterArea) && (
                  <button
                    onClick={() => { setFilterNombre(''); setFilterEmail(''); setFilterArea('') }}
                    style={{
                      background: 'none', border: 'none', color: 'var(--text-muted)',
                      fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap',
                    }}
                  >
                    × Limpiar filtros
                  </button>
                )}
              </td>
            </tr>
            {/* Fila de títulos */}
            <tr style={{ background: 'var(--bg-section-header)' }}>
              {['#', 'Jugador', 'Email', 'Gerencia', 'Pronósticos', 'Puntos', ''].map((h, i) => (
                <th key={i} style={{
                  padding: '9px 14px',
                  textAlign: i >= 4 ? 'center' : 'left',
                  fontSize: '11px', color: 'var(--text-muted)',
                  fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
                  width: i === 6 ? '40px' : undefined,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No hay jugadores que coincidan con los filtros.
                </td>
              </tr>
            )}
            {filtered.map((j, i) => (
              <tr key={j.user_id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 14px', fontSize: '13px', color: 'var(--text-muted)', width: '36px' }}>
                  {localJugadores.indexOf(j) + 1}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>
                    {j.first_name} {j.last_name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@{j.username}</div>
                </td>
                <td style={{ padding: '10px 14px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  {j.email}
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
                  <span style={{ fontSize: '15px', fontWeight: 900, color: localJugadores.indexOf(j) === 0 ? '#FFD700' : 'var(--accent)' }}>
                    {j.puntos}
                  </span>
                </td>
                {/* Menú 3 puntos */}
                <td style={{ padding: '10px 8px', textAlign: 'center', position: 'relative' }}>
                  <div ref={menuOpenId === j.user_id ? menuRef : undefined} style={{ display: 'inline-block', position: 'relative' }}>
                    <button
                      onClick={() => setMenuOpenId(menuOpenId === j.user_id ? null : j.user_id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', fontSize: '18px', lineHeight: 1,
                        padding: '2px 6px', borderRadius: '4px',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(116,172,223,0.1)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                      ···
                    </button>

                    {menuOpenId === j.user_id && (
                      <div style={{
                        position: 'absolute', right: 0, top: '100%', zIndex: 100,
                        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                        borderRadius: '6px', minWidth: '180px', boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                        overflow: 'hidden',
                      }}>
                        {confirmDeleteId === j.user_id ? (
                          <div style={{ padding: '12px 14px' }}>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.5 }}>
                              ¿Eliminar a <strong style={{ color: 'var(--text-primary)' }}>{j.first_name} {j.last_name}</strong> del prode?
                            </p>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                onClick={() => removeJugador(j.user_id)}
                                disabled={isPending}
                                style={{
                                  flex: 1, background: 'rgba(231,76,60,0.15)', color: 'var(--live)',
                                  border: '1px solid var(--live)', borderRadius: '4px',
                                  padding: '5px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                                }}
                              >
                                Confirmar
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                style={{
                                  flex: 1, background: 'none', color: 'var(--text-muted)',
                                  border: '1px solid var(--border)', borderRadius: '4px',
                                  padding: '5px', fontSize: '12px', cursor: 'pointer',
                                }}
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(j.user_id)}
                            style={{
                              width: '100%', background: 'none', border: 'none',
                              padding: '10px 14px', textAlign: 'left', cursor: 'pointer',
                              fontSize: '13px', color: 'var(--live)', display: 'flex', alignItems: 'center', gap: '8px',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(231,76,60,0.08)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                          >
                            <span>✕</span> Eliminar del prode
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer con conteo */}
        <div style={{
          padding: '8px 14px', background: 'var(--bg-section-header)',
          borderTop: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)',
        }}>
          Mostrando {filtered.length} de {localJugadores.length} jugadores
        </div>
      </div>
    </div>
  )
}
