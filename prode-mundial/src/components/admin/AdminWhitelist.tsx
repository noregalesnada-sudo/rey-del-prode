'use client'

import { useState, useTransition, useRef } from 'react'

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

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setResult(null)

    startTransition(async () => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('company_slug', companySlug)

      const res = await fetch('/api/empresa/whitelist', { method: 'POST', body: formData })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Error al importar')
        return
      }

      setResult({ inserted: json.inserted ?? 0, updated: json.updated ?? 0 })

      // Recargar página para reflejar cambios
      window.location.reload()
    })
  }

  const usados = entries.filter((e) => e.used).length
  const libres = entries.length - usados

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

        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={handleFile}
          style={{ display: 'none' }}
        />
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

      {/* Tabla whitelist */}
      <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-section-header)' }}>
              {['Email', 'Gerencia', 'Estado'].map((h, i) => (
                <th key={h} style={{
                  padding: '9px 14px', textAlign: 'left',
                  fontSize: '11px', color: 'var(--text-muted)',
                  fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
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
      </div>
    </div>
  )
}
