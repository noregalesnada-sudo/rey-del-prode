'use client'

import { useState, useTransition, useRef } from 'react'
import { importWhitelist, updateAccessMode, approveEnterpriseRequest, rejectEnterpriseRequest } from '@/lib/actions/admin'

interface WhitelistEntry {
  email: string
  area: string | null
  used: boolean
}

interface PendingMember {
  user_id: string
  username: string
  first_name: string
  last_name: string
  email: string
}

type AccessMode = 'whitelist' | 'invite_link'

const inputStyle: React.CSSProperties = {
  background: 'var(--bg-primary)',
  border: '1px solid var(--border-light)',
  borderRadius: '4px',
  padding: '7px 11px',
  color: 'var(--text-primary)',
  fontSize: '13px',
  outline: 'none',
}

const modeLabels: Record<AccessMode, string> = {
  whitelist: 'Solo whitelist CSV',
  invite_link: 'Link o código de invitación',
}

export default function AdminWhitelist({
  whitelist,
  companySlug,
  accessMode: initialAccessMode,
  pendingMembers: initialPending,
  prodeId,
  inviteUrl,
  inviteCode,
}: {
  whitelist: WhitelistEntry[]
  companySlug: string
  accessMode: AccessMode
  pendingMembers: PendingMember[]
  prodeId: string
  inviteUrl: string
  inviteCode: string
}) {
  const [accessMode, setAccessMode] = useState<AccessMode>(initialAccessMode)
  const [entries, setEntries] = useState(whitelist)
  const [pending, setPending] = useState(initialPending)

  const [modePending, startModeTransition] = useTransition()
  const [isPending, startTransition] = useTransition()
  const [approvePending, startApproveTransition] = useTransition()

  const [result, setResult] = useState<{ inserted: number } | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [filterEstado, setFilterEstado] = useState<'todos' | 'pendiente' | 'registrado'>('todos')
  const [filterArea, setFilterArea] = useState('')

  const areas = Array.from(new Set(entries.map((e) => e.area).filter(Boolean) as string[])).sort()

  const filteredEntries = entries.filter((e) => {
    if (filterEstado === 'pendiente' && e.used) return false
    if (filterEstado === 'registrado' && !e.used) return false
    if (filterArea && e.area !== filterArea) return false
    return true
  })

  function copyEmails() {
    const emails = filteredEntries.map((e) => e.email).join(', ')
    navigator.clipboard.writeText(emails).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  function copyInviteLink() {
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2500)
    })
  }

  function copyInviteCode() {
    navigator.clipboard.writeText(inviteCode).then(() => {
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2500)
    })
  }

  function handleModeChange(mode: AccessMode) {
    startModeTransition(async () => {
      const res = await updateAccessMode(companySlug, mode)
      if (!res?.error) setAccessMode(mode)
    })
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setResult(null)
    startTransition(async () => {
      const csvText = await file.text()
      const res = await importWhitelist(companySlug, csvText)
      if ('error' in res) {
        setError(res.error ?? 'Error al importar')
        return
      }
      setResult({ inserted: res.imported ?? 0 })
      window.location.reload()
    })
  }

  function handleApprove(userId: string) {
    startApproveTransition(async () => {
      const res = await approveEnterpriseRequest(prodeId, userId, companySlug)
      if (!res?.error) {
        setPending((prev) => prev.filter((m) => m.user_id !== userId))
      }
    })
  }

  function handleReject(userId: string) {
    startApproveTransition(async () => {
      const res = await rejectEnterpriseRequest(prodeId, userId, companySlug)
      if (!res?.error) {
        setPending((prev) => prev.filter((m) => m.user_id !== userId))
      }
    })
  }

  const showWhitelist = accessMode === 'whitelist'
  const showInviteLink = accessMode === 'invite_link'

  const usados = entries.filter((e) => e.used).length
  const libres = entries.length - usados

  return (
    <div>
      {/* Selector de modo de acceso */}
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        borderRadius: '8px', padding: '20px 24px', marginBottom: '24px',
      }}>
        <h3 style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>
          Modo de acceso
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.6 }}>
          Elegí cómo se unen los jugadores a este prode. Los modos pueden convivir.
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['whitelist', 'invite_link'] as AccessMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => handleModeChange(mode)}
              disabled={modePending || accessMode === mode}
              style={{
                padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700,
                cursor: accessMode === mode ? 'default' : 'pointer',
                border: accessMode === mode ? '2px solid var(--accent)' : '2px solid var(--border)',
                background: accessMode === mode ? 'rgba(116,172,223,0.12)' : 'var(--bg-primary)',
                color: accessMode === mode ? 'var(--accent)' : 'var(--text-muted)',
                opacity: modePending ? 0.6 : 1,
                transition: 'all 0.15s',
              }}
            >
              {modeLabels[mode]}
            </button>
          ))}
        </div>
        {modePending && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Guardando...</p>
        )}
      </div>

      {/* === SECCIÓN LINK DE INVITACIÓN === */}
      {showInviteLink && (
        <div style={{ marginBottom: '24px' }}>
          {/* Link a compartir */}
          <div style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: '8px', padding: '20px 24px', marginBottom: '16px',
          }}>
            <h3 style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
              Link de invitación
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.6 }}>
              Compartí este link con tu equipo. Cualquiera que lo use enviará una solicitud que vos tenés que aprobar.
            </p>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <code style={{
                flex: 1, minWidth: '200px', background: 'var(--bg-primary)',
                border: '1px solid var(--border)', borderRadius: '4px',
                padding: '8px 12px', fontSize: '12px', color: 'var(--text-muted)',
                wordBreak: 'break-all',
              }}>
                {inviteUrl}
              </code>
              <button
                onClick={copyInviteLink}
                style={{
                  background: linkCopied ? 'rgba(74,222,128,0.15)' : 'var(--accent)',
                  border: linkCopied ? '1px solid rgba(74,222,128,0.4)' : 'none',
                  color: linkCopied ? '#4ade80' : '#fff',
                  borderRadius: '4px', padding: '8px 16px',
                  fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.2s', whiteSpace: 'nowrap',
                }}
              >
                {linkCopied ? '✓ Copiado' : 'Copiar link'}
              </button>
            </div>
          </div>

          {/* Código de acceso */}
          <div style={{
            background: 'var(--bg-secondary)', border: '2px solid var(--accent)',
            borderRadius: '8px', padding: '20px 24px', marginBottom: '16px',
          }}>
            <h3 style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', color: 'var(--accent)' }}>
              Código de acceso
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.6 }}>
              Compartí este código con tu equipo. Los usuarios lo ingresan en <strong>"Unirse con código"</strong> desde el menú lateral y su solicitud queda pendiente de tu aprobación.
            </p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{
                background: 'var(--bg-primary)', border: '2px solid var(--accent)',
                borderRadius: '8px', padding: '14px 28px',
                fontFamily: 'monospace', fontWeight: 900,
                fontSize: '36px', letterSpacing: '10px',
                color: 'var(--accent)', textTransform: 'uppercase',
                userSelect: 'all',
              }}>
                {inviteCode}
              </div>
              <button
                onClick={copyInviteCode}
                style={{
                  background: codeCopied ? 'rgba(74,222,128,0.15)' : 'var(--accent)',
                  border: codeCopied ? '1px solid rgba(74,222,128,0.4)' : 'none',
                  color: codeCopied ? '#4ade80' : '#fff',
                  borderRadius: '6px', padding: '12px 20px',
                  fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.2s', whiteSpace: 'nowrap',
                  letterSpacing: '0.5px', textTransform: 'uppercase',
                }}
              >
                {codeCopied ? '✓ Copiado' : 'Copiar código'}
              </button>
            </div>
          </div>

          {/* Tabla de solicitudes pendientes */}
          <div style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: '8px', overflow: 'hidden',
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Solicitudes pendientes
                </h3>
                {pending.length > 0 && (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
                    {pending.length} solicitud{pending.length !== 1 ? 'es' : ''} esperando aprobación
                  </p>
                )}
              </div>
              {pending.length > 0 && (
                <span style={{
                  background: 'rgba(255,215,0,0.15)', color: '#FFD700',
                  border: '1px solid rgba(255,215,0,0.3)',
                  borderRadius: '20px', padding: '2px 10px',
                  fontSize: '12px', fontWeight: 700,
                }}>
                  {pending.length} pendiente{pending.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {pending.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                No hay solicitudes pendientes.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-section-header)' }}>
                    {['Jugador', 'Email', 'Acciones'].map((h) => (
                      <th key={h} style={{
                        padding: '9px 14px', textAlign: 'left',
                        fontSize: '11px', color: 'var(--text-muted)',
                        fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pending.map((m) => (
                    <tr key={m.user_id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: 700, fontSize: '13px' }}>
                          {m.first_name || m.last_name ? `${m.first_name} ${m.last_name}`.trim() : `@${m.username}`}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>@{m.username}</div>
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: '13px', color: 'var(--text-muted)' }}>
                        {m.email}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleApprove(m.user_id)}
                            disabled={approvePending}
                            style={{
                              background: 'rgba(74,222,128,0.1)', color: '#4ade80',
                              border: '1px solid rgba(74,222,128,0.3)',
                              borderRadius: '4px', padding: '5px 12px',
                              fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                              opacity: approvePending ? 0.6 : 1,
                            }}
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleReject(m.user_id)}
                            disabled={approvePending}
                            style={{
                              background: 'rgba(231,76,60,0.1)', color: 'var(--live)',
                              border: '1px solid rgba(231,76,60,0.3)',
                              borderRadius: '4px', padding: '5px 12px',
                              fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                              opacity: approvePending ? 0.6 : 1,
                            }}
                          >
                            Rechazar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* === SECCIÓN WHITELIST CSV === */}
      {showWhitelist && (
        <div>
          {/* Stats */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {[
              { label: 'Total en whitelist', value: entries.length },
              { label: 'Registrados', value: usados },
              { label: 'Pendientes', value: libres },
            ].map((s) => (
              <div key={s.label} style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '14px 20px', minWidth: '140px',
              }}>
                <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--accent)' }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Importar CSV */}
          <div style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: '8px', padding: '20px 24px', marginBottom: '24px',
          }}>
            <h3 style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
              Importar CSV
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.6 }}>
              El CSV debe tener columnas <strong>email</strong> y opcionalmente <strong>area</strong>.<br />
              Los mails existentes se actualizan, los nuevos se agregan.
            </p>
            <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} style={{ display: 'none' }} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={isPending}
              style={{
                background: 'var(--accent)', color: '#fff', border: 'none',
                borderRadius: '4px', padding: '9px 18px', fontWeight: 700,
                fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px',
                cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.7 : 1,
              }}
            >
              {isPending ? 'Importando...' : 'Subir CSV'}
            </button>
            {result && (
              <div style={{ marginTop: '12px', fontSize: '13px', color: '#4ade80', fontWeight: 600 }}>
                Importado: {result.inserted} registros.
              </div>
            )}
            {error && (
              <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--live)', fontWeight: 600 }}>
                {error}
              </div>
            )}
          </div>

          {/* Tabla whitelist */}
          <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 8px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                        {filteredEntries.length} mails
                      </span>
                      <button
                        onClick={copyEmails}
                        title="Copiar todos los mails filtrados"
                        style={{
                          background: copied ? 'rgba(74,222,128,0.15)' : 'rgba(116,172,223,0.1)',
                          border: `1px solid ${copied ? 'rgba(74,222,128,0.4)' : 'rgba(116,172,223,0.3)'}`,
                          color: copied ? '#4ade80' : 'var(--accent)',
                          borderRadius: '4px', padding: '4px 10px',
                          fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                          transition: 'all 0.2s', whiteSpace: 'nowrap',
                        }}
                      >
                        {copied ? '✓ Copiado' : 'Copiar mails'}
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '8px 8px' }}>
                    <select
                      value={filterArea}
                      onChange={(e) => setFilterArea(e.target.value)}
                      style={{ ...inputStyle, width: '100%', cursor: 'pointer' }}
                    >
                      <option value="">Todas las gerencias</option>
                      {areas.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '8px 8px' }}>
                    <select
                      value={filterEstado}
                      onChange={(e) => setFilterEstado(e.target.value as any)}
                      style={{ ...inputStyle, width: '100%', cursor: 'pointer' }}
                    >
                      <option value="todos">Todos</option>
                      <option value="pendiente">Pendientes</option>
                      <option value="registrado">Registrados</option>
                    </select>
                  </td>
                </tr>
                <tr style={{ background: 'var(--bg-section-header)' }}>
                  {['Email', 'Gerencia', 'Estado'].map((h) => (
                    <th key={h} style={{
                      padding: '9px 14px', textAlign: 'left',
                      fontSize: '11px', color: 'var(--text-muted)',
                      fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredEntries.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                      No hay registros que coincidan con los filtros.
                    </td>
                  </tr>
                )}
                {filteredEntries.map((entry) => (
                  <tr key={entry.email} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '9px 14px', fontSize: '13px' }}>{entry.email}</td>
                    <td style={{ padding: '9px 14px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      {entry.area ?? '—'}
                    </td>
                    <td style={{ padding: '9px 14px' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.5px', padding: '2px 8px', borderRadius: '20px',
                        background: entry.used ? 'rgba(74,222,128,0.1)' : 'rgba(116,172,223,0.1)',
                        color: entry.used ? '#4ade80' : 'var(--accent)',
                        border: `1px solid ${entry.used ? 'rgba(74,222,128,0.3)' : 'rgba(116,172,223,0.3)'}`,
                      }}>
                        {entry.used ? 'Registrado' : 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{
              padding: '8px 14px', background: 'var(--bg-section-header)',
              borderTop: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)',
            }}>
              Mostrando {filteredEntries.length} de {entries.length} registros
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
