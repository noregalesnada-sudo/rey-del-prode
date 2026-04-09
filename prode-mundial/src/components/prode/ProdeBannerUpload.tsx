'use client'

import { useRef, useState, useTransition } from 'react'
import { uploadProdeBanner } from '@/lib/actions/banner'
import { Camera, Loader2 } from 'lucide-react'

interface ProdeBannerUploadProps {
  prodeId: string
  currentUrl?: string | null
}

export default function ProdeBannerUpload({ prodeId, currentUrl }: ProdeBannerUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setSaved(false)
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await uploadProdeBanner(formData, prodeId)
      if (res?.error) {
        setError(res.error)
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
      {/* Área del banner */}
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          position: 'relative',
          width: '100%',
          height: '160px',
          borderRadius: '8px',
          overflow: 'hidden',
          cursor: 'pointer',
          background: preview ? 'transparent' : 'rgba(116,172,223,0.06)',
          border: preview ? 'none' : '2px dashed rgba(116,172,223,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt="Banner del prode"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <Camera size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <p style={{ fontSize: '13px', margin: 0 }}>Subir banner del prode</p>
            <p style={{ fontSize: '11px', margin: '4px 0 0', opacity: 0.6 }}>JPG, PNG · recomendado 1200×400px · máx 5MB</p>
          </div>
        )}

        {/* Overlay hover */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          opacity: 0,
          transition: 'opacity 0.2s',
        }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
        >
          <Camera size={18} style={{ color: '#fff' }} />
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>
            {preview ? 'Cambiar banner' : 'Subir banner'}
          </span>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        name="banner"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Botones y mensajes */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
        <button
          type="submit"
          disabled={isPending || !preview || preview === currentUrl}
          style={{
            background: 'var(--accent)',
            border: 'none',
            borderRadius: '4px',
            padding: '7px 16px',
            color: '#fff',
            fontWeight: 700,
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            cursor: isPending || !preview || preview === currentUrl ? 'default' : 'pointer',
            opacity: isPending || !preview || preview === currentUrl ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {isPending && <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />}
          {isPending ? 'Subiendo...' : saved ? '¡Guardado!' : 'Guardar banner'}
        </button>
        {error && <p style={{ color: 'var(--live)', fontSize: '12px', margin: 0 }}>{error}</p>}
        {saved && <p style={{ color: '#4ade80', fontSize: '12px', margin: 0 }}>Banner actualizado</p>}
      </div>
    </form>
  )
}
