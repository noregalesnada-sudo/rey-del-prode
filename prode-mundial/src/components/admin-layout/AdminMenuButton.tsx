'use client'

import { Menu } from 'lucide-react'
import { useSidebar } from './SidebarProvider'

export default function AdminMenuButton() {
  const { toggle } = useSidebar()
  return (
    <button className="admin-menu-btn" onClick={toggle} aria-label="Abrir menú">
      <Menu size={18} />
    </button>
  )
}
