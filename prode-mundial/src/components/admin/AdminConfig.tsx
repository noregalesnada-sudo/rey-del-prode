'use client'

import { useState, useTransition } from 'react'
import { updateCompanyConfig } from '@/lib/actions/admin'

export default function AdminConfig({
  companySlug,
  currentName,
  currentPrimary,
  currentSecondary,
  currentLogo,
  currentBanner,
}: {
  companySlug: string
  currentName: string
  currentPrimary: string
  currentSecondary: string
  currentLogo: string
  currentBanner: string
}) {
  const [prodeName, setProdeName] = useState(currentName)
  const [primary, setPrimary] = useState(currentPrimary || '#74ACDF')
  const [secondary, setSecondary] = useState(currentSecondary || '#FFD700')
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function handleSave() {
    setSaved(false)
    setError('')
    startTransition(async () => {
      const result = await updateCompanyConfig(companySlug, { prodeName, primaryColor: primary, secondaryColor: secondary })
      if (result?.error) setError(result.error)
      else setSaved(true)
    })
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
    borderRadius: '4px', padding: '9px 12px', color: 'var(--text-primary)',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px',
  }
  const sectionStyle: React.CSSProperties = {
    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
    borderRadius: '8px', padding: '20px 24px', marginBottom: '16px',
  }

  return (
    <div style={{ maxWidth: '560px' }}>

      {/* Nombre del prode */}
      <div style={sectionStyle}>
        <h3 style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
          Nombre del torneo
        </h3>
        <div>
          <label style={labelStyle}>Nombre visible para los jugadores</label>
          <input
            value={prodeName}
            onChange={(e) => setProdeName(e.target.value)}
            placeholder="Ej: Prode Acudir Mundial 2026"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
          />
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px' }}>
            Si está vacío, se usa el nombre del prode por defecto.
          </p>
        </div>
      </div>

      {/* Colores */}
      <div style={sectionStyle}>
        <h3 style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
          Colores de marca
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Color primario</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="color"
                value={primary}
                onChange={(e) => setPrimary(e.target.value)}
                style={{ width: '44px', height: '36px', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', padding: '2px', background: 'none' }}
              />
              <input
                value={primary}
                onChange={(e) => setPrimary(e.target.value)}
                placeholder="#74ACDF"
                style={{ ...inputStyle, flex: 1 }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
              />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Color secundario</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="color"
                value={secondary}
                onChange={(e) => setSecondary(e.target.value)}
                style={{ width: '44px', height: '36px', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', padding: '2px', background: 'none' }}
              />
              <input
                value={secondary}
                onChange={(e) => setSecondary(e.target.value)}
                placeholder="#FFD700"
                style={{ ...inputStyle, flex: 1 }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div style={{ marginTop: '16px', padding: '14px 18px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-primary)' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Preview</p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: primary }} />
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: secondary }} />
            <span style={{ fontSize: '14px', fontWeight: 700, color: primary, marginLeft: '4px' }}>Acento principal</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: secondary }}>Destacado</span>
          </div>
        </div>
      </div>

      {/* Logo y Banner — próximamente con upload */}
      <div style={{ ...sectionStyle, opacity: 0.6 }}>
        <h3 style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
          Logo y Banner
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Próximamente: subir logo y banner directamente desde aquí.
        </p>
        {currentLogo && (
          <img src={currentLogo} alt="Logo actual" style={{ height: '40px', marginTop: '10px', objectFit: 'contain' }} />
        )}
      </div>

      {/* Guardar */}
      {error && (
        <div style={{ padding: '10px 14px', borderRadius: '4px', fontSize: '13px', fontWeight: 700, background: 'rgba(231,76,60,0.15)', color: 'var(--live)', border: '1px solid var(--live)', marginBottom: '12px' }}>
          {error}
        </div>
      )}
      {saved && (
        <div style={{ padding: '10px 14px', borderRadius: '4px', fontSize: '13px', fontWeight: 700, background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)', marginBottom: '12px' }}>
          Configuración guardada.
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={isPending}
        style={{
          background: 'var(--accent)', color: '#fff', border: 'none',
          borderRadius: '4px', padding: '11px 28px', fontWeight: 700,
          fontSize: '14px', letterSpacing: '0.5px', textTransform: 'uppercase',
          cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.7 : 1,
        }}
      >
        {isPending ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </div>
  )
}
