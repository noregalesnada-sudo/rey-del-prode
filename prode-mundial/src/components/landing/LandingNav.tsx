'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const NAV_SECTIONS_ES = [
  { label: 'Funciones',     href: '#features' },
  { label: 'Cómo funciona', href: '#how' },
  { label: 'Precios',       href: '#precios' },
  { label: 'Empresas',      href: '#empresas' },
  { label: 'FAQ',           href: '#faq' },
]

const NAV_SECTIONS_EN = [
  { label: 'Features',     href: '#features' },
  { label: 'How it works', href: '#how' },
  { label: 'Pricing',      href: '#precios' },
  { label: 'Companies',    href: '#empresas' },
  { label: 'FAQ',          href: '#faq' },
]

const TR = {
  es: { login: 'Iniciar sesión', register: 'Crear prode gratis', switchLabel: 'Ver en English' },
  en: { login: 'Log in',         register: 'Create free pool',   switchLabel: 'Ver en Español' },
}

const HEADER_OFFSET = 108 // ticker 32px + nav 68px + 8px holgura

function getScrollY(): number {
  return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0
}

function easeInOutQuart(t: number): number {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2
}

function smoothScrollTo(targetY: number, duration = 920) {
  const startY = getScrollY()
  const distance = targetY - startY
  const startTime = performance.now()

  function step(now: number) {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    window.scrollTo(0, startY + distance * easeInOutQuart(progress))
    if (progress < 1) requestAnimationFrame(step)
  }

  requestAnimationFrame(step)
}

function scrollToSection(hash: string) {
  if (hash === '#top' || hash === '') {
    smoothScrollTo(0)
    return
  }
  const el = document.querySelector(hash)
  if (!el) return
  const top = el.getBoundingClientRect().top + getScrollY() - HEADER_OFFSET
  smoothScrollTo(Math.max(0, top))
}

export default function LandingNav({ lang, user }: { lang: string; user?: { email?: string; username?: string } | null }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const lp = (p: string) => `/${lang}${p}`
  const pathname = usePathname()
  const otherLang = lang === 'es' ? 'en' : 'es'
  const langSwitchUrl = pathname ? pathname.replace(`/${lang}`, `/${otherLang}`) : `/${otherLang}`
  const NAV_SECTIONS = lang === 'en' ? NAV_SECTIONS_EN : NAV_SECTIONS_ES
  const tr = lang === 'en' ? TR.en : TR.es

  useEffect(() => {
    const onScroll = () => {
      setScrolled(getScrollY() > 80)

      // Ordenar por posición real en el DOM para evitar falsos activos
      // cuando el orden del nav no coincide con el orden de las secciones en la página
      const sorted = NAV_SECTIONS_ES
        .map(s => ({ id: s.href.slice(1), el: document.getElementById(s.href.slice(1)) }))
        .filter(({ el }) => el !== null)
        .sort((a, b) => (a.el!.getBoundingClientRect().top + getScrollY()) - (b.el!.getBoundingClientRect().top + getScrollY()))

      let current = ''
      for (const { id, el } of sorted) {
        if (el && el.getBoundingClientRect().top <= HEADER_OFFSET + 40) {
          current = id
        }
      }
      setActiveSection(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault()
    setMenuOpen(false)
    // Pequeño delay en mobile para que el menu se cierre antes de hacer scroll
    setTimeout(() => scrollToSection(hash), menuOpen ? 60 : 0)
  }, [menuOpen])

  const handleLogoClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setMenuOpen(false)
    smoothScrollTo(0)
  }, [])

  const navBg = scrolled ? 'rgba(5,13,26,0.95)' : 'rgba(5,13,26,0.55)'
  const navBorder = scrolled ? 'rgba(245,197,24,0.22)' : 'rgba(245,197,24,0.08)'

  return (
    <>
      <nav style={{
        position: 'fixed', top: 32, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(32px, 5vw, 72px)',
        height: 68,
        background: navBg,
        backdropFilter: 'blur(18px) saturate(180%)',
        borderBottom: `1px solid ${navBorder}`,
        transition: 'background 0.4s ease, border-color 0.4s ease',
      }}>
        {/* Logo → scroll al hero */}
        <a href="#top" onClick={handleLogoClick}
          style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#fff', cursor: 'pointer' }}>
          <Image src="/escudo.png" alt="Rey del Prode" width={32} height={32} style={{ borderRadius: 6 }} />
          <div>
            <div style={{ fontFamily: 'var(--font-bebas, var(--font-barlow))', fontSize: 18, letterSpacing: '2.5px', lineHeight: 1 }}>
              Rey del Prode
            </div>
            <div style={{ fontSize: 9, color: '#f5c518', letterSpacing: '3px', marginTop: 1 }}>
              MUNDIAL 2026
            </div>
          </div>
        </a>

        {/* Desktop links */}
        <ul className="ld-nav-links" style={{ alignItems: 'center', gap: 32, listStyle: 'none', margin: 0, padding: 0 }}>
          {NAV_SECTIONS.map(s => {
            const id = s.href.slice(1)
            const isActive = activeSection === id
            return (
              <li key={s.href} style={{ position: 'relative' }}>
                <a
                  href={s.href}
                  onClick={e => handleNavClick(e, s.href)}
                  style={{
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                    fontSize: 13, fontWeight: isActive ? 600 : 500,
                    textDecoration: 'none', letterSpacing: '0.3px',
                    transition: 'color 0.2s',
                    paddingBottom: 4,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = isActive ? '#fff' : 'rgba(255,255,255,0.6)')}
                >
                  {s.label}
                </a>
                {/* Indicador de sección activa */}
                <span style={{
                  position: 'absolute', bottom: -22, left: 0, right: 0,
                  height: 2, borderRadius: 2,
                  background: '#f5c518',
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                  transition: 'opacity 0.3s ease, transform 0.3s ease',
                  transformOrigin: 'center',
                }} />
              </li>
            )
          })}
        </ul>

        {/* Desktop CTAs */}
        <div className="ld-nav-ctas" style={{ alignItems: 'center', gap: 10 }}>
          <Link href={langSwitchUrl} prefetch={false} style={{
            padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700,
            color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)', textDecoration: 'none',
            letterSpacing: '1px',
          }}>
            {otherLang.toUpperCase()}
          </Link>
          {user ? (
            <>
              <Link href={lp('/perfil')} prefetch={false} style={{
                padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)', textDecoration: 'none',
              }}>
                {user.username || user.email?.split('@')[0] || '?'}
              </Link>
              <Link href={lp('/mis-pronos')} prefetch={false} style={{
                padding: '8px 18px', borderRadius: 6, fontSize: 13, fontWeight: 700,
                color: '#050d1a', background: '#f5c518', textDecoration: 'none',
                boxShadow: '0 2px 14px rgba(245,197,24,0.35)',
              }}>
                {lang === 'en' ? 'My predictions' : 'Mis pronósticos'}
              </Link>
            </>
          ) : (
            <>
              <Link href={lp('/login')} prefetch={false} style={{
                padding: '8px 18px', borderRadius: 6, fontSize: 13, fontWeight: 600,
                color: 'rgba(255,255,255,0.85)', background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.14)', textDecoration: 'none',
                transition: 'background 0.2s, border-color 0.2s',
              }}>
                {tr.login}
              </Link>
              <Link href={lp('/register')} prefetch={false} style={{
                padding: '8px 18px', borderRadius: 6, fontSize: 13, fontWeight: 700,
                color: '#050d1a', background: '#f5c518', textDecoration: 'none',
                boxShadow: '0 2px 14px rgba(245,197,24,0.35)',
              }}>
                {tr.register}
              </Link>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button className="ld-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label={lang === 'en' ? 'Open menu' : 'Abrir menú'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, flexDirection: 'column', gap: 5, alignItems: 'center' }}>
          <span style={{
            display: 'block', width: 22, height: 2, borderRadius: 2,
            background: menuOpen ? '#f5c518' : '#fff',
            transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
            transition: 'background 0.2s, transform 0.25s ease',
          }} />
          <span style={{
            display: 'block', width: 22, height: 2, borderRadius: 2,
            background: menuOpen ? '#f5c518' : '#fff',
            opacity: menuOpen ? 0 : 1,
            transition: 'background 0.2s, opacity 0.2s',
          }} />
          <span style={{
            display: 'block', width: 22, height: 2, borderRadius: 2,
            background: menuOpen ? '#f5c518' : '#fff',
            transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
            transition: 'background 0.2s, transform 0.25s ease',
          }} />
        </button>
      </nav>

      {/* Mobile menu con transición */}
      <div style={{
        position: 'fixed', top: 100, left: 0, right: 0, zIndex: 99,
        background: 'rgba(5,13,26,0.98)', backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(245,197,24,0.12)',
        padding: menuOpen ? '20px 24px 28px' : '0 24px',
        display: 'flex', flexDirection: 'column', gap: 14,
        maxHeight: menuOpen ? 500 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.38s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s ease',
        pointerEvents: menuOpen ? 'auto' : 'none',
      }}>
        {NAV_SECTIONS.map(s => (
          <a key={s.href} href={s.href}
            onClick={e => handleNavClick(e, s.href)}
            style={{
              color: 'rgba(255,255,255,0.85)', fontSize: 17, fontWeight: 500,
              textDecoration: 'none', padding: '6px 0',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              opacity: menuOpen ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}>
            {s.label}
          </a>
        ))}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {user ? (
            <Link href={lp('/mis-pronos')} prefetch={false} onClick={() => setMenuOpen(false)} style={{
              padding: 12, borderRadius: 6, fontSize: 14, fontWeight: 700,
              color: '#050d1a', background: '#f5c518', textDecoration: 'none', textAlign: 'center',
            }}>
              {lang === 'en' ? 'My predictions' : 'Mis pronósticos'}
            </Link>
          ) : (
            <>
              <Link href={lp('/login')} prefetch={false} onClick={() => setMenuOpen(false)} style={{
                padding: 12, borderRadius: 6, fontSize: 14, fontWeight: 600,
                color: '#fff', background: 'rgba(255,255,255,0.07)', textDecoration: 'none', textAlign: 'center',
              }}>
                {tr.login}
              </Link>
              <Link href={lp('/register')} prefetch={false} onClick={() => setMenuOpen(false)} style={{
                padding: 12, borderRadius: 6, fontSize: 14, fontWeight: 700,
                color: '#050d1a', background: '#f5c518', textDecoration: 'none', textAlign: 'center',
              }}>
                {tr.register}
              </Link>
            </>
          )}
          <Link href={langSwitchUrl} prefetch={false} onClick={() => setMenuOpen(false)} style={{
            padding: 10, borderRadius: 6, fontSize: 13, fontWeight: 600,
            color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)',
            textDecoration: 'none', textAlign: 'center',
          }}>
            {tr.switchLabel}
          </Link>
        </div>
      </div>
    </>
  )
}
