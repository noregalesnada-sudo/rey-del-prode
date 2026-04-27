'use client'

import { Bell, User, LogOut, Menu } from 'lucide-react'
import Link from 'next/link'
import { logout } from '@/lib/actions/auth'
import LanguageSwitcher from './LanguageSwitcher'
import type es from '@/dictionaries/es.json'

type TopbarT = typeof es.topbar
type LangT = typeof es.lang

interface TopBarProps {
  userName?: string
  prodeName?: string
  onMenuToggle?: () => void
  lang: string
  t: TopbarT
  tLang: LangT
}

export default function TopBar({ userName, prodeName, onMenuToggle, lang, t, tLang }: TopBarProps) {
  const lp = (path: string) => `/${lang}${path}`

  return (
    <header style={{
      background: 'var(--bg-section-header)',
      borderBottom: '1px solid var(--border)',
      padding: '0 16px',
      height: '44px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          className="hamburger-btn"
          onClick={onMenuToggle}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '4px',
            alignItems: 'center',
          }}
        >
          <Menu size={20} />
        </button>

        <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {prodeName ?? t.brand}
        </span>
      </div>

      {userName ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <LanguageSwitcher lang={lang} t={tLang} />
          <Bell size={16} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
          <Link href={lp('/perfil')} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontSize: '13px', textDecoration: 'none' }}>
            <User size={15} style={{ color: 'var(--accent)' }} />
            <span>{userName}</span>
          </Link>
          <form action={logout}>
            <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <LogOut size={14} />
            </button>
          </form>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LanguageSwitcher lang={lang} t={tLang} />
          <Link
            href={lp('/register')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'transparent', color: 'var(--text-primary)',
              padding: '5px 14px', borderRadius: '4px',
              fontSize: '12px', fontWeight: 700, textDecoration: 'none',
              letterSpacing: '0.3px', border: '1px solid #2563eb',
            }}
          >
            {t.registrarse}
          </Link>
          <Link
            href={lp('/login')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'var(--accent)', color: '#fff',
              padding: '5px 14px', borderRadius: '4px',
              fontSize: '12px', fontWeight: 700, textDecoration: 'none',
              letterSpacing: '0.3px', border: '1px solid transparent',
            }}
          >
            <User size={13} />
            {t.iniciarSesion}
          </Link>
        </div>
      )}
    </header>
  )
}
