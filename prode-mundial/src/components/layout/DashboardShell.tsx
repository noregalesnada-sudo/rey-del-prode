'use client'

import { useState } from 'react'
import TopBar from './TopBar'
import Sidebar from './Sidebar'

interface DashboardShellProps {
  userName: string
  userProdes: { slug: string; name: string }[]
  children: React.ReactNode
}

export default function DashboardShell({ userName, userProdes, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function closeSidebar() {
    setSidebarOpen(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar userName={userName} onMenuToggle={() => setSidebarOpen((o) => !o)} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Overlay mobile */}
        <div
          className={`sidebar-overlay${sidebarOpen ? ' sidebar-open' : ''}`}
          onClick={closeSidebar}
        />
        <Sidebar userProdes={userProdes} isOpen={sidebarOpen} onClose={closeSidebar} />
        <main className="main-content" style={{ flex: 1, overflowY: 'auto', padding: '32px 16px 50px', maxWidth: '980px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
