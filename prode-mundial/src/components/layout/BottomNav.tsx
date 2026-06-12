'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CalendarDays, Plus, Trophy, User } from 'lucide-react'

interface UserProde {
  slug: string
  name: string
}

interface BottomNavProps {
  lang: string
  userProdes: UserProde[]
}

/**
 * Barra de navegación inferior, estilo app nativa. Solo visible en mobile
 * (la visibilidad la controla `.bottom-nav` en globals.css con la media query).
 * En desktop la nav sigue siendo el Sidebar.
 */
export default function BottomNav({ lang, userProdes }: BottomNavProps) {
  const pathname = usePathname()
  const lp = (p: string) => `/${lang}${p}`
  const is = (p: string) => pathname === lp(p)
  const inProdes = pathname.startsWith(`/${lang}/prode`)

  // Prodes: 1 → directo a ese; varios → al hub para elegir; ninguno → crear.
  const prodesHref =
    userProdes.length === 0 ? lp('/crear-prode')
    : userProdes.length === 1 ? lp(`/prode/${userProdes[0].slug}`)
    : lp('/prodes')

  const L = lang === 'en'
    ? { inicio: 'Home', fixture: 'Fixture', cargar: 'Predict', prodes: 'Pools', perfil: 'Profile' }
    : { inicio: 'Inicio', fixture: 'Fixture', cargar: 'Pronosticar', prodes: 'Prodes', perfil: 'Perfil' }

  const item = (active: boolean): React.CSSProperties => ({
    flex: '1 1 0',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: '3px', paddingTop: '8px',
    color: active ? 'var(--accent-light, #a8d4f5)' : 'rgba(255,255,255,0.45)',
    fontSize: '10.5px', fontWeight: 700, textDecoration: 'none',
  })

  return (
    <nav className="bottom-nav">
      <Link href={lp('/inicio')} style={item(is('/inicio'))}>
        <Home size={23} strokeWidth={2.1} />
        {L.inicio}
      </Link>
      <Link href={lp('/fixture')} style={item(is('/fixture'))}>
        <CalendarDays size={23} strokeWidth={2.1} />
        {L.fixture}
      </Link>
      <Link href={lp('/cargar')} className="bottom-nav-fab" aria-label="Cargar pronósticos">
        <span className="fab-btn"><Plus size={28} strokeWidth={2.6} /></span>
        <span className="fab-label">{L.cargar}</span>
      </Link>
      <Link href={prodesHref} style={item(inProdes)}>
        <Trophy size={23} strokeWidth={2.1} />
        {L.prodes}
      </Link>
      <Link href={lp('/perfil')} style={item(is('/perfil'))}>
        <User size={23} strokeWidth={2.1} />
        {L.perfil}
      </Link>
    </nav>
  )
}
