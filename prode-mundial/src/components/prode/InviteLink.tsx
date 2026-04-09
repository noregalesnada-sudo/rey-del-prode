'use client'

import { useState } from 'react'
import { UserPlus, Copy, Check, X, Share2 } from 'lucide-react'

interface InviteLinkProps {
  url: string
  inviteCode: string
  isAdmin: boolean
}

export default function InviteLink({ url, inviteCode, isAdmin }: InviteLinkProps) {
  const [open, setOpen] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  if (!isAdmin) return null

  function handleCopyCode() {
    navigator.clipboard.writeText(inviteCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2500)
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rey del Prode',
          text: `Unite a mi prode del Mundial 2026! Código: ${inviteCode}`,
          url,
        })
      } catch {
        // usuario canceló
      }
    } else {
      handleCopyLink()
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--accent)',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          padding: '8px 16px',
          fontWeight: 700,
          fontSize: '13px',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        <UserPlus size={15} />
        Invitar amigos
      </button>

      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '28px 24px',
            width: '100%',
            maxWidth: '400px',
            position: 'relative',
          }}>
            <button
              onClick={() => setOpen(false)}
              style={{
                position: 'absolute', top: '12px', right: '12px',
                background: 'none', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', padding: '4px',
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <UserPlus size={20} style={{ color: 'var(--accent)' }} />
              <h2 style={{ fontWeight: 900, fontSize: '15px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Invitar amigos
              </h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
              Compartí el código o el link para que se unan a tu prode.
            </p>

            {/* Código grande */}
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                Código de invitación
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                padding: '12px 16px',
              }}>
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: '28px',
                  fontWeight: 900,
                  letterSpacing: '6px',
                  color: 'var(--accent)',
                }}>
                  {inviteCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: copiedCode ? '#27ae60' : 'var(--accent)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    padding: '7px 12px',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    flexShrink: 0,
                  }}
                >
                  {copiedCode ? <Check size={13} /> : <Copy size={13} />}
                  {copiedCode ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>o compartí el link</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
            </div>

            {/* Link */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid var(--border-light)',
              borderRadius: '6px',
              overflow: 'hidden',
              marginBottom: '12px',
              background: 'var(--bg-primary)',
            }}>
              <span style={{
                flex: 1,
                padding: '9px 12px',
                fontSize: '11px',
                color: 'var(--text-muted)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {url}
              </span>
              <button
                onClick={handleCopyLink}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: copiedLink ? '#27ae60' : 'rgba(116, 172, 223, 0.15)',
                  color: copiedLink ? '#fff' : 'var(--accent)',
                  border: 'none',
                  borderLeft: '1px solid var(--border-light)',
                  padding: '9px 14px',
                  fontWeight: 700,
                  fontSize: '11px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
              >
                {copiedLink ? <Check size={13} /> : <Copy size={13} />}
                {copiedLink ? 'Copiado' : 'Copiar'}
              </button>
            </div>

            <button
              onClick={handleShare}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                background: 'transparent',
                border: '1px solid var(--border-light)',
                borderRadius: '6px',
                color: 'var(--text-muted)',
                padding: '9px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <Share2 size={14} />
              Compartir
            </button>
          </div>
        </div>
      )}
    </>
  )
}
