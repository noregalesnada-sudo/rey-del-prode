'use client'

import { Menu } from 'lucide-react'
import Link from 'next/link'
import LanguageSwitcher from './LanguageSwitcher'
import ProfileMenu from './ProfileMenu'
import type es from '@/dictionaries/es.json'

type TopbarT = typeof es.topbar
type LangT = typeof es.lang

interface TopBarProps {
  userName?: string
  avatarUrl?: string | null
  prodeName?: string
  onMenuToggle?: () => void
  lang: string
  t: TopbarT
  tLang: LangT
}

export default function TopBar({ userName, avatarUrl, prodeName, onMenuToggle, lang, t }: TopBarProps) {
  const lp = (path: string) => `/${lang}${path}`

  function scrollToTop() {
    const main = document.querySelector('.main-content')
    if (main) {
      main.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <header style={{
      background: 'var(--bg-section-header)',
      borderBottom: '1px solid var(--border)',
      padding: '0 16px',
      height: '46px',
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
          style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '4px', alignItems: 'center' }}
        >
          <Menu size={20} />
        </button>

        <button
          onClick={scrollToTop}
          aria-label="Volver arriba"
          style={{
            background: 'none', border: 'none', padding: 0, cursor: 'pointer',
            color: 'var(--text-primary)', fontWeight: 700, fontSize: '13px',
            textTransform: 'uppercase', letterSpacing: '0.5px',
            font: 'inherit', textAlign: 'left',
          }}
        >
          {prodeName ?? t.brand}
        </button>
      </div>

      {userName ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <LanguageSwitcher lang={lang} />
          <ProfileMenu lang={lang} userName={userName} avatarUrl={avatarUrl} />
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LanguageSwitcher lang={lang} />
          <Link
            href={lp('/register')}
            className="topbar-btn-register"
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
            {t.iniciarSesion}
          </Link>
        </div>
      )}
    </header>
  )
}
