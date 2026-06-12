'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface LanguageSwitcherProps {
  lang: string
}

const LOCALES = [
  { code: 'es', label: 'ES', flag: 'ar', name: 'Español' },
  { code: 'en', label: 'EN', flag: 'us', name: 'English' },
] as const

const flagSrc = (f: string) => `https://flagcdn.com/w20/${f}.png`

export default function LanguageSwitcher({ lang }: LanguageSwitcherProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const rest = pathname.replace(/^\/(es|en)/, '') || '/'
  const current = LOCALES.find((l) => l.code === lang) ?? LOCALES[0]

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Idioma / Language"
        style={{
          display: 'flex', alignItems: 'center', gap: 6, height: 28, padding: '0 9px',
          border: '1px solid var(--border)', borderRadius: 7, background: 'transparent',
          color: 'var(--text-muted)', fontSize: 11, fontWeight: 800, letterSpacing: '.5px', cursor: 'pointer',
        }}
      >
        <img src={flagSrc(current.flag)} alt={current.name} style={{ width: 18, height: 13, objectFit: 'cover', borderRadius: 2, display: 'block' }} />
        <span>{current.label}</span>
        <ChevronDown size={13} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0, minWidth: 150,
          background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 9,
          padding: 4, boxShadow: '0 12px 30px rgba(0,0,0,.45)', zIndex: 60,
        }}>
          {LOCALES.map((l) => {
            const isCur = l.code === lang
            return (
              <Link
                key={l.code}
                href={`/${l.code}${rest === '/' ? '' : rest}`}
                onClick={() => setOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', borderRadius: 6,
                  fontSize: 13, fontWeight: 700, textDecoration: 'none',
                  color: isCur ? 'var(--text-primary)' : 'var(--text-muted)',
                  background: isCur ? 'rgba(116,172,223,.10)' : 'transparent',
                }}
              >
                <img src={flagSrc(l.flag)} alt={l.name} style={{ width: 20, height: 15, objectFit: 'cover', borderRadius: 3, display: 'block' }} />
                <span>{l.name}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
