'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { updateMemberArea, removeMemberFromProde, updateMemberRole } from '@/lib/actions/admin'

interface Jugador {
  user_id: string
  username: string
  first_name: string
  last_name: string
  email: string
  area: string
  picks: number
  puntos: number
  role: string
  spectator: boolean
}

interface PlayerLabels {
  totalPlayers: string
  withPredictions: string
  withoutPredictions: string
  searchPlayer: string
  searchEmail: string
  allAreas: string
  allPredictions?: string
  clearFilters: string
  colPlayer: string
  colEmail: string
  colPredictions: string
  colPoints: string
  selected: string
  selectedPlural: string
  copyEmails: string
  copied: string
  deselectAll: string
  noResults: string
  showing: string
  of: string
  playersCount: string
  makeAdmin: string
  removeAdmin: string
  removeFromGroup: string
  confirmRemovePre: string
  confirmRemovePost: string
  confirm: string
  cancel: string
  clickToEdit: string
}

const defaultLabels: PlayerLabels = {
  totalPlayers: 'Total jugadores',
  withPredictions: 'Con pronósticos',
  withoutPredictions: 'Sin pronósticos',
  searchPlayer: 'Buscar jugador...',
  searchEmail: 'Buscar email...',
  allAreas: 'Todas las',
  allPredictions: 'Todos',
  clearFilters: '× Limpiar filtros',
  colPlayer: 'Jugador',
  colEmail: 'Email',
  colPredictions: 'Pronósticos',
  colPoints: 'Puntos',
  selected: 'jugador seleccionado',
  selectedPlural: 'jugadores seleccionados',
  copyEmails: 'Copiar mails',
  copied: '✓ Copiado',
  deselectAll: '× Deseleccionar todo',
  noResults: 'No hay jugadores que coincidan con los filtros.',
  showing: 'Mostrando',
  of: 'de',
  playersCount: 'jugadores',
  makeAdmin: '↑ Hacer admin',
  removeAdmin: '↓ Quitar admin',
  removeFromGroup: '✕ Eliminar del prode',
  confirmRemovePre: '¿Eliminar a',
  confirmRemovePost: 'del prode?',
  confirm: 'Confirmar',
  cancel: 'Cancelar',
  clickToEdit: 'Click para editar',
}

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
  totalMatches,
  areasEnabled = true,
  areaLabel = 'Gerencia',
  labels = defaultLabels,
}: {
  jugadores: Jugador[]
  prodeId: string
  companySlug: string
  totalMatches: number
  areasEnabled?: boolean
  areaLabel?: string
  labels?: PlayerLabels
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
  const [filterPicks, setFilterPicks] = useState<'' | 'con' | 'sin'>('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map((j) => j.user_id)))
    }
  }

  function copySelectedEmails() {
    const emails = filtered
      .filter((j) => selected.has(j.user_id) && j.email !== '—')
      .map((j) => j.email)
      .join(', ')
    navigator.clipboard.writeText(emails).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  function startEdit(j: Jugador) {
    setEditingId(j.user_id)
    setAreaValue(j.area === '—' ? '' : j.area)
  }

  function removeJugador(userId: string) {
    setMenuOpenId(null)
    setConfirmDeleteId(null)
    startTransition(async () => {
      await removeMemberFromProde(prodeId, userId, companySlug)
      setLocalJugadores((prev) => prev.filter((j) => j.user_id !== userId))
    })
  }

  function toggleRole(userId: string, currentRole: string) {
    setMenuOpenId(null)
    const newRole = currentRole === 'admin' ? 'player' : 'admin'
    startTransition(async () => {
      await updateMemberRole(prodeId, userId, newRole, companySlug)
      setLocalJugadores((prev) => prev.map((j) => j.user_id === userId ? { ...j, role: newRole } : j))
    })
  }

  function saveArea(userId: string) {
    startTransition(async () => {
      await updateMemberArea(prodeId, userId, areaValue, companySlug)
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
    if (filterPicks === 'con' && j.picks === 0) return false
    if (filterPicks === 'sin' && j.picks > 0) return false
    return true
  })

  const players = localJugadores.filter((j) => !j.spectator)
  const sinPicks = players.filter((j) => j.picks === 0).length
  const conPicks = players.length - sinPicks

  const areas = Array.from(new Set(localJugadores.map((j) => j.area).filter((a) => a !== '—'))).sort()

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { label: labels.totalPlayers, value: players.length },
          { label: labels.withPredictions, value: conPicks },
          { label: labels.withoutPredictions, value: sinPicks },
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

      {/* Barra de selección */}
      {selected.size > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
          background: 'rgba(116,172,223,0.08)', border: '1px solid rgba(116,172,223,0.25)',
          borderRadius: '8px', padding: '10px 16px', marginBottom: '12px',
        }}>
          <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700 }}>
            {selected.size} {selected.size !== 1 ? labels.selectedPlural : labels.selected}
          </span>
          <button
            onClick={copySelectedEmails}
            style={{
              background: copied ? 'rgba(74,222,128,0.15)' : 'rgba(116,172,223,0.1)',
              border: `1px solid ${copied ? 'rgba(74,222,128,0.4)' : 'rgba(116,172,223,0.3)'}`,
              color: copied ? '#4ade80' : 'var(--accent)',
              borderRadius: '4px', padding: '5px 12px',
              fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {copied ? labels.copied : labels.copyEmails}
          </button>
          <button
            onClick={() => setSelected(new Set())}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer' }}
          >
            {labels.deselectAll}
          </button>
        </div>
      )}

      {/* Tabla */}
      <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
          <thead>
            <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '8px 14px', width: '36px' }}>
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && selected.size === filtered.length}
                  onChange={toggleAll}
                  style={{ accentColor: 'var(--accent)', cursor: 'pointer', width: '15px', height: '15px' }}
                />
              </td>
              <td style={{ padding: '8px 14px' }} />
              <td style={{ padding: '8px 8px' }}>
                <input
                  value={filterNombre}
                  onChange={(e) => setFilterNombre(e.target.value)}
                  placeholder={labels.searchPlayer}
                  style={{ ...inputStyle, width: '100%' }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
                />
              </td>
              <td style={{ padding: '8px 8px' }}>
                <input
                  value={filterEmail}
                  onChange={(e) => setFilterEmail(e.target.value)}
                  placeholder={labels.searchEmail}
                  style={{ ...inputStyle, width: '100%' }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
                />
              </td>
              {areasEnabled && (
                <td style={{ padding: '8px 8px' }}>
                  <select
                    value={filterArea}
                    onChange={(e) => setFilterArea(e.target.value)}
                    style={{ ...inputStyle, width: '100%', cursor: 'pointer' }}
                  >
                    <option value="">{labels.allAreas} {areaLabel.toLowerCase()}s</option>
                    {areas.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </td>
              )}
              <td style={{ padding: '8px 8px' }}>
                <select
                  value={filterPicks}
                  onChange={(e) => setFilterPicks(e.target.value as '' | 'con' | 'sin')}
                  style={{ ...inputStyle, width: '100%', minWidth: '120px', cursor: 'pointer' }}
                >
                  <option value="">{labels.allPredictions ?? defaultLabels.allPredictions}</option>
                  <option value="con">{labels.withPredictions}</option>
                  <option value="sin">{labels.withoutPredictions}</option>
                </select>
              </td>
              <td style={{ padding: '8px 8px' }} colSpan={2}>
                {(filterNombre || filterEmail || filterArea || filterPicks) && (
                  <button
                    onClick={() => { setFilterNombre(''); setFilterEmail(''); setFilterArea(''); setFilterPicks('') }}
                    style={{
                      background: 'none', border: 'none', color: 'var(--text-muted)',
                      fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap',
                    }}
                  >
                    {labels.clearFilters}
                  </button>
                )}
              </td>
            </tr>
            <tr style={{ background: 'var(--bg-section-header)' }}>
              <th style={{ width: '36px', padding: '9px 14px' }} />
              {['#', labels.colPlayer, labels.colEmail, ...(areasEnabled ? [areaLabel] : []), labels.colPredictions, labels.colPoints, ''].map((h, i) => (
                <th key={i} style={{
                  padding: '9px 14px',
                  textAlign: i >= (areasEnabled ? 4 : 3) ? 'center' : 'left',
                  fontSize: '11px', color: 'var(--text-muted)',
                  fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
                  width: h === '' ? '40px' : undefined,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={areasEnabled ? 8 : 7} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  {labels.noResults}
                </td>
              </tr>
            )}
            {filtered.map((j, i) => (
              <tr key={j.user_id} style={{
                borderTop: '1px solid var(--border)',
                background: selected.has(j.user_id) ? 'rgba(116,172,223,0.05)' : 'transparent',
              }}>
                <td style={{ padding: '10px 14px', width: '36px' }}>
                  <input
                    type="checkbox"
                    checked={selected.has(j.user_id)}
                    onChange={() => toggleSelect(j.user_id)}
                    style={{ accentColor: 'var(--accent)', cursor: 'pointer', width: '15px', height: '15px' }}
                  />
                </td>
                <td style={{ padding: '10px 14px', fontSize: '13px', color: 'var(--text-muted)', width: '36px' }}>
                  {localJugadores.indexOf(j) + 1}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {j.first_name} {j.last_name}
                    {j.role === 'admin' && (
                      <span style={{
                        fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px',
                        padding: '1px 5px', borderRadius: '10px',
                        background: 'rgba(116,172,223,0.15)', color: 'var(--accent)',
                        border: '1px solid rgba(116,172,223,0.3)',
                      }}>Admin</span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@{j.username}</div>
                </td>
                <td style={{ padding: '10px 14px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  {j.email}
                </td>
                {areasEnabled && (
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
                        title={labels.clickToEdit}
                      >
                        {j.area}
                        <span style={{ fontSize: '11px', color: 'var(--accent)', opacity: 0.7 }}>✎</span>
                      </div>
                    )}
                  </td>
                )}
                <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                  <span style={{ fontSize: '13px', color: j.picks === 0 ? 'var(--live)' : 'var(--text-muted)' }}>
                    {j.picks}/{totalMatches}
                  </span>
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                  <span style={{ fontSize: '15px', fontWeight: 900, color: localJugadores.indexOf(j) === 0 ? '#FFD700' : 'var(--accent)' }}>
                    {j.puntos}
                  </span>
                </td>
                <td style={{ padding: '10px 8px', textAlign: 'center', position: 'relative' }}>
                  <div ref={menuOpenId === j.user_id ? menuRef : undefined} style={{ display: 'inline-block', position: 'relative' }}>
                    <button
                      onClick={() => setMenuOpenId(menuOpenId === j.user_id ? null : j.user_id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', fontSize: '18px', lineHeight: 1,
                        padding: '2px 6px', borderRadius: '4px', transition: 'background 0.15s',
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
                        {confirmDeleteId !== j.user_id && (
                          <button
                            onClick={() => toggleRole(j.user_id, j.role)}
                            style={{
                              width: '100%', background: 'none', border: 'none',
                              padding: '10px 14px', textAlign: 'left', cursor: 'pointer',
                              fontSize: '13px', color: j.role === 'admin' ? 'var(--text-muted)' : 'var(--accent)',
                              display: 'flex', alignItems: 'center', gap: '8px',
                              borderBottom: '1px solid var(--border)',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(116,172,223,0.08)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                          >
                            {j.role === 'admin' ? labels.removeAdmin : labels.makeAdmin}
                          </button>
                        )}
                        {confirmDeleteId === j.user_id ? (
                          <div style={{ padding: '12px 14px' }}>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.5 }}>
                              {labels.confirmRemovePre} <strong style={{ color: 'var(--text-primary)' }}>{j.first_name} {j.last_name}</strong> {labels.confirmRemovePost}
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
                                {labels.confirm}
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                style={{
                                  flex: 1, background: 'none', color: 'var(--text-muted)',
                                  border: '1px solid var(--border)', borderRadius: '4px',
                                  padding: '5px', fontSize: '12px', cursor: 'pointer',
                                }}
                              >
                                {labels.cancel}
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
                            <span>✕</span> {labels.removeFromGroup}
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
        </div>
        <div style={{
          padding: '8px 14px', background: 'var(--bg-section-header)',
          borderTop: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)',
        }}>
          {labels.showing} {filtered.length} {labels.of} {localJugadores.length} {labels.playersCount}
        </div>
      </div>
    </div>
  )
}
