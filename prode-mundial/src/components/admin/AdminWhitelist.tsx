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

interface WhitelistLabels {
  accessMode: string
  accessModeDesc: string
  csvOnly: string
  inviteLink: string
  saving: string
  inviteLinkTitle: string
  inviteLinkDesc: string
  copyLink: string
  copied: string
  codeCopied: string
  accessCodeTitle: string
  accessCodeDesc: string
  copyCode: string
  pendingTitle: string
  pendingCount: string
  pendingBadge: string
  pendingBadgePlural: string
  noPending: string
  approve: string
  reject: string
  colPlayer: string
  colEmail: string
  colActions: string
  totalWhitelist: string
  registered: string
  pending: string
  importCsvTitle: string
  importCsvDesc: string
  uploadBtn: string
  importing: string
  allAreas: string
  allStatus: string
  pendingStatus: string
  registeredStatus: string
  colStatus: string
  statusRegistered: string
  statusPending: string
  showing: string
  of: string
  records: string
  noResults: string
}

const defaultWhitelistLabels: WhitelistLabels = {
  accessMode: 'Modo de acceso',
  accessModeDesc: 'Elegí cómo se unen los jugadores a este prode. Los modos pueden convivir.',
  csvOnly: 'Solo whitelist CSV',
  inviteLink: 'Link o código de invitación',
  saving: 'Guardando...',
  inviteLinkTitle: 'Link de invitación',
  inviteLinkDesc: 'Compartí este link con tu equipo. Cualquiera que lo use enviará una solicitud que vos tenés que aprobar.',
  copyLink: 'Copiar link',
  copied: '✓ Copiado',
  codeCopied: '✓ Copiado',
  accessCodeTitle: 'Código de acceso',
  accessCodeDesc: 'Compartí este código con tu equipo. Los usuarios lo ingresan en "Unirse con código" desde el menú lateral.',
  copyCode: 'Copiar código',
  pendingTitle: 'Solicitudes pendientes',
  pendingCount: 'solicitudes esperando aprobación',
  pendingBadge: 'pendiente',
  pendingBadgePlural: 'pendientes',
  noPending: 'No hay solicitudes pendientes.',
  approve: 'Aprobar',
  reject: 'Rechazar',
  colPlayer: 'Jugador',
  colEmail: 'Email',
  colActions: 'Acciones',
  totalWhitelist: 'Total en whitelist',
  registered: 'Registrados',
  pending: 'Pendientes',
  importCsvTitle: 'Importar CSV',
  importCsvDesc: 'El CSV debe tener columnas email y opcionalmente area. Los mails existentes se actualizan, los nuevos se agregan.',
  uploadBtn: 'Subir CSV',
  importing: 'Importando...',
  allAreas: 'Todas las',
  allStatus: 'Todos',
  pendingStatus: 'Pendientes',
  registeredStatus: 'Registrados',
  colStatus: 'Estado',
  statusRegistered: 'Registrado',
  statusPending: 'Pendiente',
  showing: 'Mostrando',
  of: 'de',
  records: 'registros',
  noResults: 'No hay registros que coincidan con los filtros.',
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

const getModeLabels = (l: WhitelistLabels): Record<AccessMode, string> => ({
  whitelist: l.csvOnly,
  invite_link: l.inviteLink,
})

export default function AdminWhitelist({
  whitelist,
  companySlug,
  accessMode: initialAccessMode,
  pendingMembers: initialPending,
  prodeId,
  inviteUrl,
  inviteCode,
  areaLabel = 'Gerencia',
  labels = defaultWhitelistLabels,
}: {
  whitelist: WhitelistEntry[]
  companySlug: string
  accessMode: AccessMode
  pendingMembers: PendingMember[]
  prodeId: string
  inviteUrl: string
  inviteCode: string
  areaLabel?: string
  labels?: WhitelistLabels
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
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 100

  const areas = Array.from(new Set(entries.map((e) => e.area).filter(Boolean) as string[])).sort()

  const filteredEntries = entries.filter((e) => {
    if (filterEstado === 'pendiente' && e.used) return false
    if (filterEstado === 'registrado' && !e.used) return false
    if (filterArea && e.area !== filterArea) return false
    return true
  })

  const totalPages = Math.ceil(filteredEntries.length / PAGE_SIZE)
  const pagedEntries = filteredEntries.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  function handleFilterChange(fn: () => void) {
    fn()
    setPage(0)
  }

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

  const modeLabels = getModeLabels(labels)
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
          {labels.accessMode}
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.6 }}>
          {labels.accessModeDesc}
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
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>{labels.saving}</p>
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
              {labels.inviteLinkTitle}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.6 }}>
              {labels.inviteLinkDesc}
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
                {linkCopied ? labels.copied : labels.copyLink}
              </button>
            </div>
          </div>

          {/* Código de acceso */}
          <div style={{
            background: 'var(--bg-secondary)', border: '2px solid var(--accent)',
            borderRadius: '8px', padding: '20px 24px', marginBottom: '16px',
          }}>
            <h3 style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', color: 'var(--accent)' }}>
              {labels.accessCodeTitle}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.6 }}>
              {labels.accessCodeDesc}
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
                {codeCopied ? labels.codeCopied : labels.copyCode}
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
                  {labels.pendingTitle}
                </h3>
                {pending.length > 0 && (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
                    {pending.length} {labels.pendingCount}
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
                  {pending.length} {pending.length !== 1 ? labels.pendingBadgePlural : labels.pendingBadge}
                </span>
              )}
            </div>

            {pending.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                {labels.noPending}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-section-header)' }}>
                    {[labels.colPlayer, labels.colEmail, labels.colActions].map((h) => (
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
                            {labels.approve}
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
                            {labels.reject}
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
              { label: labels.totalWhitelist, value: entries.length },
              { label: labels.registered, value: usados },
              { label: labels.pending, value: libres },
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
              {labels.importCsvTitle}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.6 }}>
              {labels.importCsvDesc}
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
              {isPending ? labels.importing : labels.uploadBtn}
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
                      onChange={(e) => handleFilterChange(() => setFilterArea(e.target.value))}
                      style={{ ...inputStyle, width: '100%', cursor: 'pointer' }}
                    >
                      <option value="">{labels.allAreas} {areaLabel.toLowerCase()}s</option>
                      {areas.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '8px 8px' }}>
                    <select
                      value={filterEstado}
                      onChange={(e) => handleFilterChange(() => setFilterEstado(e.target.value as any))}
                      style={{ ...inputStyle, width: '100%', cursor: 'pointer' }}
                    >
                      <option value="todos">{labels.allStatus}</option>
                      <option value="pendiente">{labels.pendingStatus}</option>
                      <option value="registrado">{labels.registeredStatus}</option>
                    </select>
                  </td>
                </tr>
                <tr style={{ background: 'var(--bg-section-header)' }}>
                  {['Email', areaLabel, labels.colStatus].map((h) => (
                    <th key={h} style={{
                      padding: '9px 14px', textAlign: 'left',
                      fontSize: '11px', color: 'var(--text-muted)',
                      fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedEntries.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                      {labels.noResults}
                    </td>
                  </tr>
                )}
                {pagedEntries.map((entry) => (
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
                        {entry.used ? labels.statusRegistered : labels.statusPending}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{
              padding: '8px 14px', background: 'var(--bg-section-header)',
              borderTop: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap',
            }}>
              <span>
                {labels.showing} {page * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE + PAGE_SIZE, filteredEntries.length)} {labels.of} {filteredEntries.length} {labels.records}
              </span>
              {totalPages > 1 && (
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    style={{
                      background: 'var(--bg-primary)', border: '1px solid var(--border)',
                      color: page === 0 ? 'var(--text-muted)' : 'var(--accent)',
                      borderRadius: '4px', padding: '3px 10px', fontSize: '12px',
                      cursor: page === 0 ? 'default' : 'pointer', fontWeight: 700,
                      opacity: page === 0 ? 0.4 : 1,
                    }}
                  >‹</button>
                  {Array.from({ length: totalPages }, (_, i) => i).map(i => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      style={{
                        background: i === page ? 'var(--accent)' : 'var(--bg-primary)',
                        border: '1px solid var(--border)',
                        color: i === page ? '#fff' : 'var(--text-muted)',
                        borderRadius: '4px', padding: '3px 8px', fontSize: '12px',
                        cursor: 'pointer', fontWeight: 700, minWidth: '28px',
                      }}
                    >{i + 1}</button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page === totalPages - 1}
                    style={{
                      background: 'var(--bg-primary)', border: '1px solid var(--border)',
                      color: page === totalPages - 1 ? 'var(--text-muted)' : 'var(--accent)',
                      borderRadius: '4px', padding: '3px 10px', fontSize: '12px',
                      cursor: page === totalPages - 1 ? 'default' : 'pointer', fontWeight: 700,
                      opacity: page === totalPages - 1 ? 0.4 : 1,
                    }}
                  >›</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
