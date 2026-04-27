'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Star, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import JoinByCode from '@/components/prode/JoinByCode'
import ShieldLogo from '@/components/layout/ShieldLogo'
import type es from '@/dictionaries/es.json'

type NavT = typeof es.nav

const PHASE_IDS = ['groups', 'r32', 'r16', 'qf', 'sf', 'final'] as const

interface UserProde {
  slug: string
  name: string
}

interface SidebarProps {
  userProdes?: UserProde[]
  isLoggedIn?: boolean
  isOpen?: boolean
  onClose?: () => void
  lang: string
  t: NavT
}

const linkStyle = (active: boolean): React.CSSProperties => ({
  display: 'block',
  padding: '8px 24px',
  color: active ? 'var(--text-primary)' : 'var(--text-muted)',
  fontSize: '14px',
  fontWeight: active ? 700 : 400,
  transition: 'all 0.3s ease',
  borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent',
  background: active ? 'rgba(116, 172, 223, 0.08)' : 'transparent',
  textDecoration: 'none',
})

function SidebarLink({ href, children, active }: { href: string; children: React.ReactNode; active: boolean }) {
  return (
    <Link href={href} style={linkStyle(active)}
      onMouseEnter={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'rgba(116, 172, 223, 0.08)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)' }}}
      onMouseLeave={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}}
    >
      {children}
    </Link>
  )
}

export default function Sidebar({ userProdes = [], isLoggedIn = false, isOpen = false, onClose, lang, t }: SidebarProps) {
  const [phasesOpen, setPhasesOpen] = useState(true)
  const [prodesOpen, setProdesOpen] = useState(true)
  const pathname = usePathname()

  const lp = (path: string) => `/${lang}${path}`
  const active = (path: string) => pathname === lp(path)
  const activePrefix = (path: string) => pathname.startsWith(lp(path))

  const sectionBtn: React.CSSProperties = {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 16px', background: 'transparent', border: 'none',
    color: 'var(--accent)', fontWeight: 700, fontSize: '11px', letterSpacing: '1px',
    textTransform: 'uppercase', cursor: 'pointer',
  }

  return (
    <aside
      className={`sidebar-drawer${isOpen ? ' sidebar-open' : ''}`}
      style={{
        width: '191px', minWidth: '191px',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        overflowY: 'auto', height: '100%',
      }}
    >
      <button
        className="hamburger-btn"
        onClick={onClose}
        style={{
          position: 'absolute', top: '10px', right: '10px',
          background: 'none', border: 'none', color: 'var(--text-muted)',
          cursor: 'pointer', padding: '4px', alignItems: 'center', zIndex: 1,
        }}
      >
        <X size={18} />
      </button>

      <ShieldLogo onClick={onClose} />

      {/* INICIO */}
      <div>
        <Link
          href={lp('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px',
            color: active('/') ? 'var(--accent)' : 'var(--text-muted)',
            fontWeight: 700, fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase',
            textDecoration: 'none', transition: 'color 0.2s',
            background: active('/') ? 'rgba(116, 172, 223, 0.08)' : 'transparent',
            borderLeft: active('/') ? '3px solid var(--accent)' : '3px solid transparent',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--accent)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = active('/') ? 'var(--accent)' : 'var(--text-muted)' }}
        >
          {t.inicio}
        </Link>
      </div>

      {/* MIS PRONÓSTICOS */}
      <div style={{ borderBottom: '1px solid var(--border)' }}>
        <Link
          href={isLoggedIn ? lp('/mis-pronos') : lp('/login?next=/mis-pronos')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px',
            color: active('/mis-pronos') ? 'var(--accent)' : 'var(--text-muted)',
            fontWeight: 700, fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase',
            textDecoration: 'none', transition: 'color 0.2s',
            background: active('/mis-pronos') ? 'rgba(116, 172, 223, 0.08)' : 'transparent',
            borderLeft: active('/mis-pronos') ? '3px solid var(--accent)' : '3px solid transparent',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--accent)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = active('/mis-pronos') ? 'var(--accent)' : 'var(--text-muted)' }}
        >
          <Star size={12} />
          {t.misPronos}
        </Link>
      </div>

      {/* FASES DEL MUNDIAL */}
      <div>
        <button onClick={() => setPhasesOpen(!phasesOpen)} style={sectionBtn}>
          <span>{t.fasesMundial}</span>
          {phasesOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {phasesOpen && PHASE_IDS.map((id) => (
          <SidebarLink key={id} href={lp(`/fase/${id}`)} active={activePrefix(`/fase/${id}`)}>
            {t.phases[id]}
          </SidebarLink>
        ))}
      </div>

      {/* PRODES PRIVADOS */}
      <div style={{ borderTop: '1px solid var(--border)' }}>
        <button onClick={() => setProdesOpen(!prodesOpen)} style={sectionBtn}>
          <span>{t.prodesPrivados}</span>
          {prodesOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {prodesOpen && (
          <>
            {!isLoggedIn ? (
              <div style={{ padding: '8px 16px 12px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '8px' }}>
                  {t.loginParaProdes}
                </p>
                <Link
                  href={lp('/login')}
                  style={{
                    display: 'block', textAlign: 'center',
                    background: 'var(--accent)', color: '#fff',
                    padding: '6px 12px', borderRadius: '4px',
                    fontSize: '12px', fontWeight: 700, textDecoration: 'none',
                  }}
                >
                  {t.iniciarSesion}
                </Link>
                <Link
                  href={lp('/precios')}
                  style={{
                    display: 'block', padding: '8px 8px 0',
                    color: active('/precios') ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontWeight: 400, fontSize: '12px', textDecoration: 'none', textAlign: 'center',
                  }}
                >
                  {t.precios}
                </Link>
              </div>
            ) : (
              <>
                {userProdes.length === 0 && (
                  <p style={{ padding: '6px 24px 8px', color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic' }}>
                    {t.sinProdes}
                  </p>
                )}
                {userProdes.map((prode) => (
                  <SidebarLink key={prode.slug} href={lp(`/prode/${prode.slug}`)} active={active(`/prode/${prode.slug}`)}>
                    {prode.name}
                  </SidebarLink>
                ))}

                <JoinByCode />

                <Link
                  href={lp('/crear-prode')}
                  style={{
                    display: 'block', padding: '8px 24px',
                    color: active('/crear-prode') ? 'var(--text-primary)' : 'var(--accent)',
                    fontWeight: 700, fontSize: '14px', transition: 'all 0.3s ease', textDecoration: 'none',
                    borderLeft: active('/crear-prode') ? '3px solid var(--accent)' : '3px solid transparent',
                    background: active('/crear-prode') ? 'rgba(116, 172, 223, 0.08)' : 'transparent',
                    borderTop: '1px solid var(--border)', marginTop: '4px',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(116, 172, 223, 0.08)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = active('/crear-prode') ? 'rgba(116, 172, 223, 0.08)' : 'transparent' }}
                >
                  {t.crearProde}
                </Link>

                <Link
                  href={lp('/precios')}
                  style={{
                    display: 'block', padding: '6px 24px',
                    color: active('/precios') ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontWeight: 400, fontSize: '12px', transition: 'all 0.3s ease', textDecoration: 'none',
                    borderLeft: active('/precios') ? '3px solid var(--accent)' : '3px solid transparent',
                    background: active('/precios') ? 'rgba(116, 172, 223, 0.08)' : 'transparent',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(116, 172, 223, 0.08)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = active('/precios') ? 'rgba(116, 172, 223, 0.08)' : 'transparent'; (e.currentTarget as HTMLElement).style.color = active('/precios') ? 'var(--text-primary)' : 'var(--text-muted)' }}
                >
                  {t.precios}
                </Link>
              </>
            )}
          </>
        )}
      </div>

      {/* CONTACTO */}
      <div style={{ borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
        <Link
          href={lp('/contacto')}
          style={{
            display: 'block', padding: '10px 24px',
            color: active('/contacto') ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: 400, fontSize: '12px', transition: 'all 0.3s ease', textDecoration: 'none',
            borderLeft: active('/contacto') ? '3px solid var(--accent)' : '3px solid transparent',
            background: active('/contacto') ? 'rgba(116, 172, 223, 0.08)' : 'transparent',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(116, 172, 223, 0.08)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = active('/contacto') ? 'rgba(116, 172, 223, 0.08)' : 'transparent'; (e.currentTarget as HTMLElement).style.color = active('/contacto') ? 'var(--text-primary)' : 'var(--text-muted)' }}
        >
          {t.contacto}
        </Link>
      </div>
    </aside>
  )
}
