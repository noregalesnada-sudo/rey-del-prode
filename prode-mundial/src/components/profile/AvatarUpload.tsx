'use client'

import { useRef, useState, useTransition } from 'react'
import { uploadAvatar } from '@/lib/actions/avatar'
import { Camera, Loader2 } from 'lucide-react'

interface AvatarUploadProps {
  currentUrl?: string | null
  username: string
}

export default function AvatarUpload({ currentUrl, username }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null)
  const [compressedFile, setCompressedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const initials = username.slice(0, 2).toUpperCase()

  function compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const objectUrl = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(objectUrl)
        const MAX = 1200
        let { width, height } = img
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width); width = MAX }
          else { width = Math.round(width * MAX / height); height = MAX }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (!blob) { reject(new Error('No se pudo comprimir')); return }
            resolve(new File([blob], 'avatar.jpg', { type: 'image/jpeg' }))
          },
          'image/jpeg',
          0.85
        )
      }
      img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('No se pudo leer la imagen')) }
      img.src = objectUrl
    })
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 20 * 1024 * 1024) {
      setError('La foto es demasiado grande (máx. 20 MB).')
      e.target.value = ''
      return
    }

    setError(null)
    setSaved(false)

    compressImage(file)
      .then((compressed) => {
        setCompressedFile(compressed)
        setPreview(URL.createObjectURL(compressed))
      })
      .catch(() => setError('No se pudo procesar la imagen. Probá con otra foto.'))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!compressedFile) return
    const formData = new FormData()
    formData.append('avatar', compressedFile)
    startTransition(async () => {
      const res = await uploadAvatar(formData)
      if (res?.error) {
        setError(res.error)
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        {/* Avatar preview */}
        <div
          style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}
          onClick={() => inputRef.current?.click()}
        >
          {preview ? (
            <img
              src={preview}
              alt={username}
              style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent)', display: 'block' }}
            />
          ) : (
            <div style={{
              width: 80, height: 80, borderRadius: '50%', background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 700, color: '#fff', border: '3px solid var(--accent)',
            }}>
              {initials}
            </div>
          )}
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            background: 'var(--bg-section-header)', border: '2px solid var(--border)',
            borderRadius: '50%', width: 26, height: 26,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Camera size={13} style={{ color: 'var(--accent)' }} />
          </div>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input
            ref={inputRef}
            type="file"
            name="avatar"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            style={{
              background: 'none', border: '1px solid var(--border-light)',
              borderRadius: '4px', padding: '6px 14px',
              color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer',
            }}
          >
            Elegir foto
          </button>
          <button
            type="submit"
            disabled={isPending || !compressedFile}
            style={{
              background: 'var(--accent)', border: 'none', borderRadius: '4px',
              padding: '6px 14px', color: '#fff', fontWeight: 700, fontSize: '13px',
              cursor: isPending || !compressedFile ? 'default' : 'pointer',
              opacity: isPending || !compressedFile ? 0.5 : 1,
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            {isPending && <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />}
            {isPending ? 'Subiendo...' : saved ? '¡Guardado!' : 'Guardar foto'}
          </button>
          {error && <p style={{ color: 'var(--live)', fontSize: '12px', margin: 0 }}>{error}</p>}
          <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: 0 }}>
            Cualquier foto · se comprime automáticamente
          </p>
        </div>
      </div>
    </form>
  )
}
