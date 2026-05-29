'use client'

import { useState, useTransition, useRef } from 'react'
import { updateCompanyConfig, uploadCompanyAsset, updateAreasEnabled } from '@/lib/actions/admin'
import { savePrizes } from '@/lib/actions/prizes'
import { Plus, Trash2, Check } from 'lucide-react'

interface Prize { position: number; description: string }

interface ConfigLabels {
  tournamentName: string
  nameLabel: string
  namePlaceholder: string
  nameHint: string
  description: string
  descOptional: string
  descPlaceholder: string
  descriptionEs: string
  descriptionEn: string
  descPlaceholderEn: string
  brandColors: string
  primaryColor: string
  secondaryColor: string
  preview: string
  primaryAccent: string
  highlight: string
  companyLogo: string
  noLogo: string
  uploadLogo: string
  changeLogo: string
  uploading: string
  logoHint: string
  logoUpdated: string
  groupBanner: string
  clickBanner: string
  changeBanner: string
  bannerHint: string
  regionalRanking: string
  regionalDesc: string
  enabled: string
  disabled: string
  prizes: string
  prizePlaceholder: string
  addPosition: string
  saving: string
  saved: string
  savePrizes: string
  configSaved: string
  saveChanges: string
}

const defaultLabels: ConfigLabels = {
  tournamentName: 'Nombre del torneo',
  nameLabel: 'Nombre visible para los jugadores',
  namePlaceholder: 'Ej: Prode Empresa Mundial 2026',
  nameHint: 'Si está vacío, se usa el nombre del prode por defecto.',
  description: 'Descripción',
  descOptional: '(opcional)',
  descPlaceholder: 'Ej: El prode oficial del Mundial 2026.',
  descriptionEs: 'Descripción 🇦🇷 Español',
  descriptionEn: 'Description 🇺🇸 English',
  descPlaceholderEn: 'E.g. The official World Cup 2026 prediction game.',
  brandColors: 'Colores de marca',
  primaryColor: 'Color primario',
  secondaryColor: 'Color secundario',
  preview: 'Preview',
  primaryAccent: 'Acento principal',
  highlight: 'Destacado',
  companyLogo: 'Logo de empresa',
  noLogo: 'Sin logo',
  uploadLogo: 'Subir logo',
  changeLogo: 'Cambiar logo',
  uploading: 'Subiendo...',
  logoHint: 'Formato: PNG con fondo transparente · máx 10MB',
  logoUpdated: 'Logo actualizado',
  groupBanner: 'Banner del prode',
  clickBanner: 'Click para subir banner',
  changeBanner: 'Cambiar banner',
  bannerHint: 'Formato: JPG o PNG · máx 10MB · Proporción ideal: 3:1',
  regionalRanking: 'Ranking por área / subgrupo',
  regionalDesc: 'Si lo activás, se muestra un ranking de áreas y un ranking privado por área en el prode. Requiere asignar área a cada jugador desde el tab Jugadores.',
  enabled: 'Activado',
  disabled: 'Desactivado',
  prizes: 'Premios en juego',
  prizePlaceholder: 'Premio para el puesto {n}',
  addPosition: 'Agregar puesto',
  saving: 'Guardando...',
  saved: '¡Guardado!',
  savePrizes: 'Guardar premios',
  configSaved: 'Configuración guardada.',
  saveChanges: 'Guardar cambios',
}

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function AdminConfig({
  companySlug,
  currentName,
  currentDescriptionEs,
  currentDescriptionEn,
  currentPrimary,
  currentSecondary,
  currentLogo,
  currentBanner,
  prodeId,
  initialPrizes,
  areasEnabled: initialAreasEnabled = true,
  labels = defaultLabels,
}: {
  companySlug: string
  currentName: string
  currentDescriptionEs: string
  currentDescriptionEn: string
  currentPrimary: string
  currentSecondary: string
  currentLogo: string
  currentBanner: string
  prodeId: string
  initialPrizes: Prize[]
  areasEnabled?: boolean
  labels?: ConfigLabels
}) {
  const [prodeName, setProdeName] = useState(currentName)
  const [prodeDescriptionEs, setProdeDescriptionEs] = useState(currentDescriptionEs)
  const [prodeDescriptionEn, setProdeDescriptionEn] = useState(currentDescriptionEn)
  const [primary, setPrimary] = useState(currentPrimary || '#74ACDF')
  const [secondary, setSecondary] = useState(currentSecondary || '#FFD700')
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [prizes, setPrizes] = useState<Prize[]>(
    initialPrizes.length > 0 ? initialPrizes : [{ position: 1, description: '' }]
  )
  const [prizesPending, startPrizesTransition] = useTransition()
  const [prizesSaved, setPrizesSaved] = useState(false)

  function addPrize() {
    const next = Math.max(...prizes.map((p) => p.position), 0) + 1
    setPrizes([...prizes, { position: next, description: '' }])
  }
  function removePrize(pos: number) {
    const filtered = prizes.filter((p) => p.position !== pos)
    setPrizes(filtered.map((p, i) => ({ ...p, position: i + 1 })))
  }
  function handlePrizeChange(pos: number, value: string) {
    setPrizes(prizes.map((p) => p.position === pos ? { ...p, description: value } : p))
  }
  function handleSavePrizes() {
    startPrizesTransition(async () => {
      const res = await savePrizes(prodeId, prizes)
      if (!res?.error) {
        setPrizesSaved(true)
        setTimeout(() => setPrizesSaved(false), 2000)
      }
    })
  }

  const [areasEnabled, setAreasEnabled] = useState(initialAreasEnabled)
  const [areasPending, startAreasTransition] = useTransition()

  function handleAreasToggle() {
    const next = !areasEnabled
    startAreasTransition(async () => {
      const res = await updateAreasEnabled(companySlug, next)
      if (!res?.error) setAreasEnabled(next)
    })
  }

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
      const result = await updateCompanyConfig(companySlug, { prodeName, primaryColor: primary, secondaryColor: secondary, prodeDescriptionEs, prodeDescriptionEn })
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

      {/* Tournament name */}
      <div style={sectionStyle}>
        <h3 style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
          {labels.tournamentName}
        </h3>
        <div>
          <label style={labelStyle}>{labels.nameLabel}</label>
          <input
            value={prodeName}
            onChange={(e) => setProdeName(e.target.value)}
            placeholder={labels.namePlaceholder}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
          />
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px' }}>
            {labels.nameHint}
          </p>
        </div>
        <div style={{ marginTop: '14px' }}>
          <label style={labelStyle}>{labels.descriptionEs} <span style={{ fontWeight: 400, textTransform: 'none' }}>{labels.descOptional}</span></label>
          <textarea
            value={prodeDescriptionEs}
            onChange={(e) => setProdeDescriptionEs(e.target.value)}
            placeholder={labels.descPlaceholder}
            maxLength={200}
            rows={2}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
          />
        </div>
        <div style={{ marginTop: '10px' }}>
          <label style={labelStyle}>{labels.descriptionEn} <span style={{ fontWeight: 400, textTransform: 'none' }}>{labels.descOptional}</span></label>
          <textarea
            value={prodeDescriptionEn}
            onChange={(e) => setProdeDescriptionEn(e.target.value)}
            placeholder={labels.descPlaceholderEn}
            maxLength={200}
            rows={2}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
          />
        </div>
      </div>

      {/* Brand colors */}
      <div style={sectionStyle}>
        <h3 style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
          {labels.brandColors}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>{labels.primaryColor}</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)}
                style={{ width: '44px', height: '36px', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', padding: '2px', background: 'none' }} />
              <input value={primary} onChange={(e) => setPrimary(e.target.value)} placeholder="#74ACDF"
                style={{ ...inputStyle, flex: 1 }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>{labels.secondaryColor}</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="color" value={secondary} onChange={(e) => setSecondary(e.target.value)}
                style={{ width: '44px', height: '36px', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', padding: '2px', background: 'none' }} />
              <input value={secondary} onChange={(e) => setSecondary(e.target.value)} placeholder="#FFD700"
                style={{ ...inputStyle, flex: 1 }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')} />
            </div>
          </div>
        </div>
        <div style={{ marginTop: '16px', padding: '14px 18px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-primary)' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{labels.preview}</p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: primary }} />
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: secondary }} />
            <span style={{ fontSize: '14px', fontWeight: 700, color: primary, marginLeft: '4px' }}>{labels.primaryAccent}</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: secondary }}>{labels.highlight}</span>
          </div>
        </div>
      </div>

      {/* Company logo */}
      <div style={sectionStyle}>
        <h3 style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>
          {labels.companyLogo}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{
            width: '100px', height: '70px', borderRadius: '6px', overflow: 'hidden',
            border: '1px solid var(--border)', background: 'var(--bg-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {logoUrl
              ? <img src={logoUrl} alt="Logo" style={{ maxWidth: '90px', maxHeight: '60px', objectFit: 'contain' }} />
              : <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{labels.noLogo}</span>
            }
          </div>
          <div>
            <input ref={logoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAssetUpload('logo')} />
            <button onClick={() => logoRef.current?.click()} disabled={logoUploading} style={{
              background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '4px',
              padding: '8px 16px', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase',
              letterSpacing: '0.5px', cursor: logoUploading ? 'not-allowed' : 'pointer', opacity: logoUploading ? 0.7 : 1,
            }}>
              {logoUploading ? labels.uploading : logoUrl ? labels.changeLogo : labels.uploadLogo}
            </button>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.6 }}>
              {labels.logoHint}
            </p>
            {logoError && <p style={{ fontSize: '12px', color: 'var(--live)', marginTop: '4px' }}>{logoError}</p>}
            {logoUrl && !logoUploading && !logoError && <p style={{ fontSize: '12px', color: '#4ade80', marginTop: '4px' }}>{labels.logoUpdated}</p>}
          </div>
        </div>
      </div>

      {/* Group banner */}
      <div style={sectionStyle}>
        <h3 style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>
          {labels.groupBanner}
        </h3>
        <div onClick={() => bannerRef.current?.click()} style={{
          width: '100%', height: '130px', borderRadius: '6px', overflow: 'hidden',
          border: bannerUrl ? 'none' : '2px dashed rgba(116,172,223,0.25)',
          background: bannerUrl ? 'transparent' : 'rgba(116,172,223,0.04)',
          cursor: 'pointer', position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {bannerUrl
            ? <img src={bannerUrl} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
            : <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{labels.clickBanner}</span>
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
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>{labels.changeBanner}</span>
            </div>
          )}
        </div>
        <input ref={bannerRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAssetUpload('banner')} />
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.6 }}>
          {labels.bannerHint}
        </p>
        {bannerError && <p style={{ fontSize: '12px', color: 'var(--live)', marginTop: '4px' }}>{bannerError}</p>}
        {bannerUploading && <p style={{ fontSize: '12px', color: 'var(--accent)', marginTop: '4px' }}>{labels.uploading}</p>}
      </div>

      {/* Regional ranking toggle */}
      <div style={sectionStyle}>
        <h3 style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
          {labels.regionalRanking}
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.6 }}>
          {labels.regionalDesc}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={handleAreasToggle} disabled={areasPending} style={{
            position: 'relative', width: '44px', height: '24px',
            borderRadius: '12px', border: 'none', cursor: areasPending ? 'not-allowed' : 'pointer',
            background: areasEnabled ? 'var(--accent)' : 'rgba(116,172,223,0.2)',
            transition: 'background 0.2s', opacity: areasPending ? 0.6 : 1, flexShrink: 0,
          }}>
            <span style={{
              position: 'absolute', top: '3px',
              left: areasEnabled ? '23px' : '3px',
              width: '18px', height: '18px', borderRadius: '50%',
              background: areasEnabled ? '#fff' : 'rgba(116,172,223,0.6)',
              transition: 'left 0.2s',
            }} />
          </button>
          <span style={{ fontSize: '13px', color: areasEnabled ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600 }}>
            {areasEnabled ? labels.enabled : labels.disabled}
          </span>
        </div>
      </div>

      {/* Prizes */}
      <div style={sectionStyle}>
        <h3 style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
          {labels.prizes}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {prizes.map((p) => (
            <div key={p.position} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ minWidth: '28px', textAlign: 'center', fontSize: '16px' }}>
                {MEDALS[p.position] ?? `${p.position}°`}
              </span>
              <input
                type="text"
                value={p.description}
                onChange={(e) => handlePrizeChange(p.position, e.target.value)}
                placeholder={labels.prizePlaceholder.replace('{n}', String(p.position))}
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
                <button onClick={() => removePrize(p.position)} style={{ background: 'none', border: 'none', color: 'var(--live)', cursor: 'pointer' }}>
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button onClick={addPrize} style={{
              background: 'none', border: '1px solid var(--border-light)', borderRadius: '4px',
              padding: '6px 12px', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              <Plus size={13} /> {labels.addPosition}
            </button>
            <button onClick={handleSavePrizes} disabled={prizesPending} style={{
              background: 'var(--accent)', border: 'none', borderRadius: '4px',
              padding: '6px 16px', color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '4px', opacity: prizesPending ? 0.7 : 1,
            }}>
              <Check size={13} /> {prizesPending ? labels.saving : prizesSaved ? labels.saved : labels.savePrizes}
            </button>
          </div>
        </div>
      </div>

      {/* Save */}
      {error && (
        <div style={{ padding: '10px 14px', borderRadius: '4px', fontSize: '13px', fontWeight: 700, background: 'rgba(231,76,60,0.15)', color: 'var(--live)', border: '1px solid var(--live)', marginBottom: '12px' }}>
          {error}
        </div>
      )}
      {saved && (
        <div style={{ padding: '10px 14px', borderRadius: '4px', fontSize: '13px', fontWeight: 700, background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)', marginBottom: '12px' }}>
          {labels.configSaved}
        </div>
      )}
      <button onClick={handleSave} disabled={isPending} style={{
        background: 'var(--accent)', color: '#fff', border: 'none',
        borderRadius: '4px', padding: '11px 28px', fontWeight: 700,
        fontSize: '14px', letterSpacing: '0.5px', textTransform: 'uppercase',
        cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.7 : 1,
      }}>
        {isPending ? labels.saving : labels.saveChanges}
      </button>
    </div>
  )
}
