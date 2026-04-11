'use client'

import { useState, useTransition, useRef } from 'react'
import { updateCompanyConfig, uploadCompanyAsset } from '@/lib/actions/admin'

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

  const [logoUrl, setLogoUrl] = useState(currentLogo)
  const [bannerUrl, setBannerUrl] = useState(currentBanner)
  const [logoUploading, setLogoUploading] = useState(false)
  const [bannerUploading, setBannerUploading] = useState(false)
  const [logoError, setLogoError] = useState('')
  const [bannerError, setBannerError] = useState('')
  const logoRef = useRef<HTMLInputElement>(null)
  const bannerRef = useRef<HTMLInputElement>(null)

  function handleAssetUpload(type: 'logo' | 'banner') {
    return async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      if (type === 'logo') { setLogoError(''); setLogoUploading(true) }
      else { setBannerError(''); setBannerUploading(true) }

      const formData = new FormData()
      formData.append('file', file)
      const result = await uploadCompanyAsset(formData, companySlug, type)

      if (type === 'logo') {
        setLogoUploading(false)
        if (result?.error) setLogoError(result.error)
        else if (result?.url) setLogoUrl(result.url)
      } else {
        setBannerUploading(false)
        if (result?.error) setBannerError(result.error)
        else if (result?.url) setBannerUrl(result.url)
      }
    }
  }

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

      {/* Logo */}
      <div style={sectionStyle}>
        <h3 style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>
          Logo de empresa
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{
            width: '100px', height: '70px', borderRadius: '6px', overflow: 'hidden',
            border: '1px solid var(--border)', background: 'var(--bg-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {logoUrl
              ? <img src={logoUrl} alt="Logo" style={{ maxWidth: '90px', maxHeight: '60px', objectFit: 'contain' }} />
              : <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Sin logo</span>
            }
          </div>
          <div>
            <input ref={logoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAssetUpload('logo')} />
            <button
              onClick={() => logoRef.current?.click()}
              disabled={logoUploading}
              style={{
                background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '4px',
                padding: '8px 16px', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase',
                letterSpacing: '0.5px', cursor: logoUploading ? 'not-allowed' : 'pointer',
                opacity: logoUploading ? 0.7 : 1,
              }}
            >
              {logoUploading ? 'Subiendo...' : logoUrl ? 'Cambiar logo' : 'Subir logo'}
            </button>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.6 }}>
              Formato: PNG con fondo transparente<br />
              Proporción ideal: cuadrada (1:1) o apaisada (2:1)<br />
              Tamaño recomendado: 300×300px o 400×200px · máx 5MB
            </p>
            {logoError && <p style={{ fontSize: '12px', color: 'var(--live)', marginTop: '4px' }}>{logoError}</p>}
            {logoUrl && !logoUploading && !logoError && <p style={{ fontSize: '12px', color: '#4ade80', marginTop: '4px' }}>Logo actualizado</p>}
          </div>
        </div>
      </div>

      {/* Banner */}
      <div style={sectionStyle}>
        <h3 style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>
          Banner del prode
        </h3>
        <div
          onClick={() => bannerRef.current?.click()}
          style={{
            width: '100%', height: '130px', borderRadius: '6px', overflow: 'hidden',
            border: bannerUrl ? 'none' : '2px dashed rgba(116,172,223,0.25)',
            background: bannerUrl ? 'transparent' : 'rgba(116,172,223,0.04)',
            cursor: 'pointer', position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {bannerUrl
            ? <img src={bannerUrl} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
            : <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Click para subir banner</span>
          }
          {bannerUrl && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0, transition: 'opacity 0.2s',
            }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
            >
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>Cambiar banner</span>
            </div>
          )}
        </div>
        <input ref={bannerRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAssetUpload('banner')} />
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.6 }}>
          Formato: JPG o PNG · máx 5MB<br />
          Proporción ideal: 3:1 (ej: 1200×400px) — se recorta por el centro<br />
          Evitá texto importante en los bordes, puede quedar cortado en mobile
        </p>
        {bannerError && <p style={{ fontSize: '12px', color: 'var(--live)', marginTop: '4px' }}>{bannerError}</p>}
        {bannerUploading && <p style={{ fontSize: '12px', color: 'var(--accent)', marginTop: '4px' }}>Subiendo...</p>}
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
