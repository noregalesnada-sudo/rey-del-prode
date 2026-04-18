'use client'

import { useState, useTransition, useRef } from 'react'
import { importWhitelist } from '@/lib/actions/admin'

interface WhitelistEntry {
  email: string
  area: string | null
  used: boolean
}

export default function AdminWhitelist({
  whitelist,
  companySlug,
}: {
  whitelist: WhitelistEntry[]
  companySlug: string
}) {
  const [entries, setEntries] = useState(whitelist)
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ inserted: number; updated: number } | null>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const [filterEstado, setFilterEstado] = useState<'todos' | 'pendiente' | 'registrado'>('todos')
  const [filterArea, setFilterArea] = useState('')
  const [copied, setCopied] = useState(false)

  const areas = Array.from(new Set(entries.map((e) => e.area).filter(Boolean) as string[])).sort()

  const filtered = entries.filter((e) => {
    if (filterEstado === 'pendiente' && e.used) return false
    if (filterEstado === 'registrado' && !e.used) return false
    if (filterArea && e.area !== filterArea) return false
    return true
  })

  function copyEmails() {
    const emails = filtered.map((e) => e.email).join(', ')
    navigator.clipboard.writeText(emails).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
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

      setResult({ inserted: res.imported ?? 0, updated: 0 })
      window.location.reload()
    })
  }

  const usados = entries.filter((e) => e.used).length
  const libres = entries.length - usados

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-light)',
    borderRadius: '4px',
    padding: '7px 11px',
    color: 'var(--text-primary)',
    fontSize: '13px',
    outline: 'none',
  }

  return (
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
            Importado: {result.inserted} nuevos, {result.updated} actualizados.
          </div>
        )}
        {error && (
          <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--live)', fontWeight: 600 }}>
            {error}
          </div>
        )}
      </div>

      {/* Tabla con filtros */}
      <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            {/* Fila de filtros */}
            <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '8px 8px' }}>
                {/* Email con botón copiar */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                    {filtered.length} mails
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
            {/* Títulos */}
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
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No hay registros que coincidan con los filtros.
                </td>
              </tr>
            )}
            {filtered.map((entry) => (
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
          Mostrando {filtered.length} de {entries.length} registros
        </div>
      </div>
    </div>
  )
}
