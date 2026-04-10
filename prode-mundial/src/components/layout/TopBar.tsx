'use client'

import { Bell, User, LogOut, Menu } from 'lucide-react'
import Link from 'next/link'
import { logout } from '@/lib/actions/auth'

interface TopBarProps {
  userName?: string
  prodeName?: string
  onMenuToggle?: () => void
}

export default function TopBar({ userName, prodeName, onMenuToggle }: TopBarProps) {
  return (
    <header style={{
      background: 'var(--bg-section-header)',
      borderBottom: '1px solid var(--border)',
      padding: '0 16px',
      height: '44px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Hamburguesa — solo visible en mobile via CSS */}
        <button
          className="hamburger-btn"
          onClick={onMenuToggle}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '4px',
            alignItems: 'center',
          }}
        >
          <Menu size={20} />
        </button>

        <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {prodeName ?? 'REY DEL PRODE'}
        </span>
      </div>

      {userName ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Bell size={16} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
          <Link href="/perfil" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontSize: '13px', textDecoration: 'none' }}>
            <User size={15} style={{ color: 'var(--accent)' }} />
            <span>{userName}</span>
          </Link>
          <form action={logout}>
            <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <LogOut size={14} />
            </button>
          </form>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link
            href="/register"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'transparent', color: 'var(--text-primary)',
              padding: '5px 14px', borderRadius: '4px',
              fontSize: '12px', fontWeight: 700, textDecoration: 'none',
              letterSpacing: '0.3px', border: '1px solid #2563eb',
            }}
          >
            Registrarse
          </Link>
          <Link
            href="/login"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'var(--accent)', color: '#fff',
              padding: '5px 14px', borderRadius: '4px',
              fontSize: '12px', fontWeight: 700, textDecoration: 'none',
              letterSpacing: '0.3px', border: '1px solid transparent',
            }}
          >
            <User size={13} />
            Iniciar sesión
          </Link>
        </div>
      )}
    </header>
  )
}
