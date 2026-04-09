'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Trophy, Globe, Star } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const phases = [
  { id: 'groups', label: 'Fase de Grupos' },
  { id: 'r16',    label: 'Octavos de Final' },
  { id: 'qf',     label: 'Cuartos de Final' },
  { id: 'sf',     label: 'Semifinales' },
  { id: 'final',  label: 'Final' },
]

const groups = ['A','B','C','D','E','F','G','H','I','J','K','L']

interface UserProde {
  slug: string
  name: string
}

interface SidebarProps {
  userProdes?: UserProde[]
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

const sectionLabel = (label: string, icon?: React.ReactNode): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', gap: '6px',
})

export default function Sidebar({ userProdes = [] }: SidebarProps) {
  const [phasesOpen, setPhasesOpen] = useState(true)
  const [groupsOpen, setGroupsOpen] = useState(false)
  const [prodesOpen, setProdesOpen] = useState(true)
  const pathname = usePathname()

  const sectionBtn: React.CSSProperties = {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 16px', background: 'transparent', border: 'none',
    color: 'var(--accent)', fontWeight: 700, fontSize: '11px', letterSpacing: '1px',
    textTransform: 'uppercase', cursor: 'pointer',
  }

  return (
    <aside style={{
      width: '191px', minWidth: '191px',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      overflowY: 'auto', height: '100%',
    }}>
      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trophy size={20} style={{ color: 'var(--accent)' }} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 900, fontSize: '16px', letterSpacing: '1px', textTransform: 'uppercase' }}>
            PRODE <span style={{ color: 'var(--accent)' }}>2026</span>
          </span>
        </div>
      </Link>

      {/* MIS PRONÓSTICOS — suelto arriba de todo */}
      <div style={{ borderBottom: '1px solid var(--border)' }}>
        <Link
          href="/"
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px',
            color: pathname === '/' ? 'var(--accent)' : 'var(--text-muted)',
            fontWeight: 700, fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase',
            textDecoration: 'none', transition: 'color 0.2s',
            background: pathname === '/' ? 'rgba(116, 172, 223, 0.08)' : 'transparent',
            borderLeft: pathname === '/' ? '3px solid var(--accent)' : '3px solid transparent',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--accent)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = pathname === '/' ? 'var(--accent)' : 'var(--text-muted)' }}
        >
          <Star size={12} />
          MIS PRONÓSTICOS
        </Link>
      </div>

      {/* FASES DEL MUNDIAL */}
      <div>
        <button onClick={() => setPhasesOpen(!phasesOpen)} style={sectionBtn}>
          <span>FASES DEL MUNDIAL</span>
          {phasesOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {phasesOpen && phases.map((phase) => (
          <SidebarLink key={phase.id} href={`/fase/${phase.id}`} active={pathname === `/fase/${phase.id}`}>
            {phase.label}
          </SidebarLink>
        ))}
      </div>

      {/* GRUPOS */}
      <div style={{ borderTop: '1px solid var(--border)' }}>
        <button onClick={() => setGroupsOpen(!groupsOpen)} style={sectionBtn}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Globe size={13} /> GRUPOS</span>
          {groupsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {groupsOpen && groups.map((g) => (
          <Link key={g} href="/fase/groups"
            style={{ display: 'block', padding: '7px 24px', color: 'var(--text-muted)', fontSize: '14px', transition: 'all 0.3s ease', textDecoration: 'none' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; (e.currentTarget as HTMLElement).style.background = 'rgba(116, 172, 223, 0.08)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            Grupo {g}
          </Link>
        ))}
      </div>

      {/* PRODES PRIVADOS */}
      <div style={{ borderTop: '1px solid var(--border)' }}>
        <button onClick={() => setProdesOpen(!prodesOpen)} style={sectionBtn}>
          <span>PRODES PRIVADOS</span>
          {prodesOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {prodesOpen && (
          <>
            {userProdes.length === 0 && (
              <p style={{ padding: '6px 24px 8px', color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic' }}>
                Sin prodes aún
              </p>
            )}
            {userProdes.map((prode) => (
              <SidebarLink key={prode.slug} href={`/prode/${prode.slug}`} active={pathname === `/prode/${prode.slug}`}>
                {prode.name}
              </SidebarLink>
            ))}

            {/* + Crear Prode al final */}
            <Link
              href="/crear-prode"
              style={{
                display: 'block', padding: '8px 24px',
                color: pathname === '/crear-prode' ? 'var(--text-primary)' : 'var(--accent)',
                fontWeight: 700, fontSize: '14px', transition: 'all 0.3s ease', textDecoration: 'none',
                borderLeft: pathname === '/crear-prode' ? '3px solid var(--accent)' : '3px solid transparent',
                background: pathname === '/crear-prode' ? 'rgba(116, 172, 223, 0.08)' : 'transparent',
                borderTop: '1px solid var(--border)', marginTop: '4px',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(116, 172, 223, 0.08)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = pathname === '/crear-prode' ? 'rgba(116, 172, 223, 0.08)' : 'transparent' }}
            >
              + Crear Prode
            </Link>
          </>
        )}
      </div>
    </aside>
  )
}
