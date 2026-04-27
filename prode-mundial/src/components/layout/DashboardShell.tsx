'use client'

import { useState } from 'react'
import TopBar from './TopBar'
import Sidebar from './Sidebar'
import type es from '@/dictionaries/es.json'

type NavT = typeof es.nav
type TopbarT = typeof es.topbar
type LangT = typeof es.lang

interface DashboardShellProps {
  userName: string
  userProdes: { slug: string; name: string }[]
  isLoggedIn: boolean
  lang: string
  tNav: NavT
  tTopbar: TopbarT
  tLang: LangT
  children: React.ReactNode
}

export default function DashboardShell({
  userName,
  userProdes,
  isLoggedIn,
  lang,
  tNav,
  tTopbar,
  tLang,
  children,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function closeSidebar() {
    setSidebarOpen(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar
        userName={userName}
        onMenuToggle={() => setSidebarOpen((o) => !o)}
        lang={lang}
        t={tTopbar}
        tLang={tLang}
      />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div
          className={`sidebar-overlay${sidebarOpen ? ' sidebar-open' : ''}`}
          onClick={closeSidebar}
        />
        <Sidebar
          userProdes={userProdes}
          isLoggedIn={isLoggedIn}
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          lang={lang}
          t={tNav}
        />
        <main className="main-content" style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 50px 24px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
