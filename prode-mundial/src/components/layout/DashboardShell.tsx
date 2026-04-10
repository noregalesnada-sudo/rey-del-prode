'use client'

import { useState } from 'react'
import TopBar from './TopBar'
import Sidebar from './Sidebar'

interface DashboardShellProps {
  userName: string
  userProdes: { slug: string; name: string }[]
  isLoggedIn: boolean
  children: React.ReactNode
}

export default function DashboardShell({ userName, userProdes, isLoggedIn, children }: DashboardShellProps) {
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
        <Sidebar userProdes={userProdes} isLoggedIn={isLoggedIn} isOpen={sidebarOpen} onClose={closeSidebar} />
        <main className="main-content" style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 50px 24px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
