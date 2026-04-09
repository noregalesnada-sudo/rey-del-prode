'use client'

import { useState } from 'react'
import { Copy, Check, Share2 } from 'lucide-react'

interface InviteLinkProps {
  url: string
  isAdmin: boolean
}

export default function InviteLink({ url, isAdmin }: InviteLinkProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isAdmin) return null

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0',
        border: '1px solid var(--border-light)',
        borderRadius: '4px',
        overflow: 'hidden',
        maxWidth: '320px',
      }}>
        <div style={{
          padding: '6px 10px',
          background: 'var(--bg-primary)',
          color: 'var(--text-muted)',
          fontSize: '12px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '240px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <Share2 size={12} style={{ flexShrink: 0 }} />
          {url}
        </div>
        <button
          onClick={handleCopy}
          style={{
            background: copied ? '#27ae60' : 'var(--accent)',
            color: '#fff',
            border: 'none',
            padding: '6px 12px',
            fontWeight: 700,
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'background 0.2s',
          }}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
    </div>
  )
}
