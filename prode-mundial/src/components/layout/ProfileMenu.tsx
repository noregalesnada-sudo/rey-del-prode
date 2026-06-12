'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, LogOut, UserRound } from 'lucide-react'
import { logout } from '@/lib/actions/auth'

interface ProfileMenuProps {
  lang: string
  userName: string
  avatarUrl?: string | null
}

export default function ProfileMenu({ lang, userName, avatarUrl }: ProfileMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const L = lang === 'en'
    ? { profile: 'My profile', logout: 'Sign out' }
    : { profile: 'Mi perfil', logout: 'Cerrar sesión' }
  const initial = (userName || '?').trim()[0]?.toUpperCase() ?? '?'

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const itemStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px', borderRadius: 6,
    fontSize: 13, fontWeight: 700, textDecoration: 'none', color: 'var(--text-primary)',
    width: '100%', background: 'none', border: 0, cursor: 'pointer',
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={userName}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-primary)', padding: 0 }}
      >
        {avatarUrl
          ? <img src={avatarUrl} alt={userName} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', display: 'block', border: '1px solid var(--border-light)' }} />
          : <span style={{ width: 27, height: 27, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent-dark),#2a4a7b)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900 }}>
              {initial}
            </span>}
        <span className="topbar-username" style={{ fontSize: 13, fontWeight: 700, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</span>
        <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0, minWidth: 180,
          background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 9,
          padding: 4, boxShadow: '0 12px 30px rgba(0,0,0,.45)', zIndex: 60,
        }}>
          <Link href={`/${lang}/perfil`} onClick={() => setOpen(false)} style={itemStyle}>
            <UserRound size={16} style={{ color: 'var(--accent)' }} /> {L.profile}
          </Link>
          <form action={logout} style={{ borderTop: '1px solid var(--border)', marginTop: 4, paddingTop: 4 }}>
            <input type="hidden" name="lang" value={lang} />
            <button type="submit" style={{ ...itemStyle, color: 'var(--live)' }}>
              <LogOut size={16} /> {L.logout}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
