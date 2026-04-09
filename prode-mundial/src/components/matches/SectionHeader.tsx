import { Bell, ChevronUp } from 'lucide-react'

interface SectionHeaderProps {
  title: string
  icon?: string
  onToggle?: () => void
  isOpen?: boolean
  link?: string
}

export default function SectionHeader({
  title,
  icon,
  onToggle,
  isOpen = true,
  link,
}: SectionHeaderProps) {
  return (
    <div
      style={{
        background: 'var(--bg-section-header)',
        borderRadius: '8px 8px 0 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '32px',
        height: '32px',
        padding: '8px 12px',
        columnGap: '10px',
        marginTop: '12px',
      }}
    >
      {/* Titulo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 700,
          fontSize: '13px',
          color: 'var(--text-primary)',
          textTransform: 'uppercase',
          letterSpacing: '0.3px',
        }}
      >
        {icon && <span style={{ fontSize: '16px' }}>{icon}</span>}
        {title}
      </div>

      {/* Acciones */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Bell size={14} />
        </button>
        {onToggle && (
          <button
            onClick={onToggle}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)',
              transition: 'transform 0.2s',
            }}
          >
            <ChevronUp size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

export function SectionFooterLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      style={{
        display: 'block',
        textAlign: 'center',
        padding: '8px',
        color: 'var(--accent)',
        fontSize: '12px',
        fontWeight: 700,
        letterSpacing: '0.3px',
        borderTop: '1px solid var(--border)',
        background: 'rgba(116, 172, 223, 0.04)',
        textTransform: 'uppercase',
      }}
    >
      {label} &gt;
    </a>
  )
}
