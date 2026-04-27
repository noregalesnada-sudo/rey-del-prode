'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type es from '@/dictionaries/es.json'

type LangT = typeof es.lang

interface LanguageSwitcherProps {
  lang: string
  t: LangT
}

export default function LanguageSwitcher({ lang, t }: LanguageSwitcherProps) {
  const pathname = usePathname()
  const pathWithoutLocale = pathname.replace(/^\/(es|en)/, '') || '/'
  const targetLocale = lang === 'es' ? 'en' : 'es'
  const targetPath = `/${targetLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`

  return (
    <Link
      href={targetPath}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '30px',
        height: '22px',
        fontSize: '11px',
        fontWeight: 800,
        letterSpacing: '0.5px',
        color: 'var(--text-muted)',
        border: '1px solid var(--border)',
        borderRadius: '4px',
        textDecoration: 'none',
        transition: 'all 0.2s',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.color = 'var(--text-primary)'
        el.style.borderColor = 'var(--accent)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.color = 'var(--text-muted)'
        el.style.borderColor = 'var(--border)'
      }}
      title={`Switch to ${targetLocale.toUpperCase()}`}
    >
      {t.switchLabel}
    </Link>
  )
}
