'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Trophy,
  CreditCard,
  Building2,
  ClipboardList,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin/partidos',  label: 'Partidos',  icon: Calendar },
  { href: '/admin/prodes',    label: 'Prodes',    icon: Trophy },
  { href: '/admin/usuarios',  label: 'Usuarios',  icon: Users },
  { href: '/admin/pagos',     label: 'Pagos',     icon: CreditCard },
  { href: '/admin/empresas',  label: 'Empresas',  icon: Building2 },
  { href: '/admin/auditoria', label: 'Auditoría', icon: ClipboardList },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-logo">
        <LayoutDashboard size={20} />
        <span>Backoffice</span>
      </div>
      <nav className="admin-sidebar-nav">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`admin-nav-item${active ? ' admin-nav-item--active' : ''}`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
