'use client'

import { useState, useTransition } from 'react'
import { updateProfile } from '@/lib/actions/profile'
import { useDictionary } from '@/hooks/useDictionary'

interface ProfileFormProps {
  username: string
  firstName: string
  lastName: string
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg-primary)',
  border: '1px solid var(--border-light)',
  borderRadius: '4px',
  padding: '8px 12px',
  color: 'var(--text-primary)',
  fontSize: '14px',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 700,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '5px',
}

export default function ProfileForm({ username, firstName, lastName }: ProfileFormProps) {
  const t = useDictionary()
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await updateProfile(formData)
      if (res?.error) {
        setResult({ type: 'error', msg: res.error })
      } else {
        setResult({ type: 'success', msg: t.profile.saved })
        setTimeout(() => setResult(null), 3000)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div>
          <label style={labelStyle}>{t.profile.firstName}</label>
          <input name="first_name" type="text" defaultValue={firstName} placeholder={t.profile.firstNamePlaceholder} style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')} />
        </div>
        <div>
          <label style={labelStyle}>{t.profile.lastName}</label>
          <input name="last_name" type="text" defaultValue={lastName} placeholder={t.profile.lastNamePlaceholder} style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')} />
        </div>
      </div>

      <div>
        <label style={labelStyle}>{t.profile.username}</label>
        <input name="username" type="text" required defaultValue={username} placeholder={t.profile.usernamePlaceholder} style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')} />
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
          {t.profile.usernameHint}
        </p>
      </div>

      {result && (
        <div style={{
          padding: '8px 14px', borderRadius: '4px', fontSize: '13px', fontWeight: 700,
          background: result.type === 'success' ? 'rgba(39,174,96,0.15)' : 'rgba(231,76,60,0.15)',
          color: result.type === 'success' ? '#27ae60' : 'var(--live)',
          border: `1px solid ${result.type === 'success' ? '#27ae60' : 'var(--live)'}`,
        }}>
          {result.msg}
        </div>
      )}

      <button type="submit" disabled={isPending} style={{
        background: 'var(--accent)', border: 'none', borderRadius: '4px',
        padding: '8px 20px', color: '#fff', fontWeight: 700, fontSize: '13px',
        cursor: isPending ? 'not-allowed' : 'pointer',
        opacity: isPending ? 0.7 : 1, alignSelf: 'flex-start',
      }}>
        {isPending ? t.profile.saving : t.profile.saveChanges}
      </button>
    </form>
  )
}
