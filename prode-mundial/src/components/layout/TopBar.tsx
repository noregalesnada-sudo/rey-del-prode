import { Bell, User, LogOut } from 'lucide-react'
import Link from 'next/link'
import { logout } from '@/lib/actions/auth'

interface TopBarProps {
  userName?: string
  prodeName?: string
}

export default function TopBar({ userName, prodeName }: TopBarProps) {
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
    }}>
      <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {prodeName ?? 'REY DEL PRODE'}
      </span>

      {userName && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Bell size={16} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
          <Link href="/perfil" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontSize: '13px', textDecoration: 'none' }}>
            <User size={15} style={{ color: 'var(--accent)' }} />
            <span>{userName}</span>
          </Link>
          <form action={logout}>
            <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', cursor: 'pointer' }}>
              <LogOut size={14} />
            </button>
          </form>
        </div>
      )}
    </header>
  )
}
