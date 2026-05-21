'use client'

import { useState, useTransition, useRef } from 'react'
import { changePassword } from '@/lib/actions/profile'
import { useDictionary } from '@/hooks/useDictionary'

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

export default function ChangePasswordForm() {
  const t = useDictionary()
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await changePassword(formData)
      if (res?.error) {
        setResult({ type: 'error', msg: res.error })
      } else {
        setResult({ type: 'success', msg: t.profile.passwordChanged })
        formRef.current?.reset()
        setTimeout(() => setResult(null), 4000)
      }
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <label style={labelStyle}>{t.profile.newPassword}</label>
        <input
          name="new_password"
          type="password"
          required
          placeholder={t.profile.newPasswordPlaceholder}
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
        />
      </div>

      <div>
        <label style={labelStyle}>{t.profile.confirmPassword}</label>
        <input
          name="confirm_password"
          type="password"
          required
          placeholder={t.profile.confirmPasswordPlaceholder}
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
        />
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
        {isPending ? t.profile.savingPassword : t.profile.savePassword}
      </button>
    </form>
  )
}
