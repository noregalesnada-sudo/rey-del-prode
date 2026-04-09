'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, Trash2, Loader2 } from 'lucide-react'
import { updateProde, deleteProde } from '@/lib/actions/prodes'

interface ProdeSettingsProps {
  prodeId: string
  currentName: string
  currentDescription: string
}

export default function ProdeSettings({ prodeId, currentName, currentDescription }: ProdeSettingsProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(currentName)
  const [description, setDescription] = useState(currentDescription)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    setError('')
    setSaved(false)
    startTransition(async () => {
      const res = await updateProde(prodeId, name, description)
      if (res?.error) {
        setError(res.error)
      } else {
        setSaved(true)
        setTimeout(() => { setSaved(false); setOpen(false) }, 1200)
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteProde(prodeId)
      if (res?.error) {
        setError(res.error)
      } else {
        router.push('/')
      }
    })
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-light)',
    borderRadius: '4px',
    padding: '9px 12px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'Roboto, Arial, sans-serif',
    boxSizing: 'border-box',
  }

  return (
    <>
      {/* Botón trigger */}
      <button
        onClick={() => { setOpen(true); setConfirmDelete(false); setError(''); setSaved(false) }}
        style={{
          background: 'transparent',
          border: '1px solid var(--border-light)',
          borderRadius: '6px',
          padding: '7px 12px',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          fontWeight: 600,
        }}
      >
        <Settings size={14} />
        Editar prode
      </button>

      {/* Modal */}
      {open && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '28px 24px',
            width: '100%',
            maxWidth: '440px',
          }}>
            <h2 style={{ fontWeight: 900, fontSize: '15px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>
              Configuración del Prode
            </h2>

            {/* Nombre */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Nombre
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
              />
            </div>

            {/* Descripción */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Descripción <span style={{ fontWeight: 400, textTransform: 'none' }}>(opcional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={200}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
              />
            </div>

            {error && <p style={{ color: 'var(--live)', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

            {/* Botones guardar / cancelar */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              <button
                onClick={handleSave}
                disabled={isPending}
                style={{
                  flex: 1,
                  background: 'var(--accent)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  cursor: isPending ? 'default' : 'pointer',
                  opacity: isPending ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                {isPending && !confirmDelete && <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />}
                {saved ? '¡Guardado!' : isPending ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{
                  padding: '10px 16px',
                  background: 'transparent',
                  border: '1px solid var(--border-light)',
                  borderRadius: '4px',
                  color: 'var(--text-muted)',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
            </div>

            {/* Zona peligrosa */}
            <div style={{ borderTop: '1px solid rgba(239,68,68,0.2)', paddingTop: '16px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(239,68,68,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                Zona peligrosa
              </p>

              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'transparent',
                    border: '1px solid rgba(239,68,68,0.4)',
                    borderRadius: '4px',
                    padding: '8px 14px',
                    color: '#ef4444',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={14} />
                  Eliminar prode
                </button>
              ) : (
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', padding: '14px' }}>
                  <p style={{ fontSize: '13px', color: '#ef4444', marginBottom: '12px', lineHeight: 1.5 }}>
                    ¿Seguro? Esta acción es <strong>irreversible</strong>. Se eliminarán el prode, todos los picks y el historial de puntos.
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleDelete}
                      disabled={isPending}
                      style={{
                        background: '#ef4444',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '8px 16px',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: isPending ? 'default' : 'pointer',
                        opacity: isPending ? 0.7 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {isPending && <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />}
                      Sí, eliminar
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border-light)',
                        borderRadius: '4px',
                        padding: '8px 14px',
                        color: 'var(--text-muted)',
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
