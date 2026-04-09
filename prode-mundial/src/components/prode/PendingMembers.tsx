'use client'

import { useTransition } from 'react'
import { Check, X, Clock } from 'lucide-react'
import { approveMember, rejectMember } from '@/lib/actions/prodes'

interface PendingMember {
  user_id: string
  username: string
}

interface PendingMembersProps {
  prodeId: string
  members: PendingMember[]
}

export default function PendingMembers({ prodeId, members }: PendingMembersProps) {
  const [isPending, startTransition] = useTransition()

  if (members.length === 0) return null

  function handleApprove(userId: string) {
    startTransition(async () => {
      await approveMember(prodeId, userId)
    })
  }

  function handleReject(userId: string) {
    startTransition(async () => {
      await rejectMember(prodeId, userId)
    })
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        background: 'var(--bg-section-header)',
        padding: '10px 16px',
        borderRadius: '6px 6px 0 0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        border: '1px solid var(--border)',
        borderBottom: 'none',
      }}>
        <Clock size={14} style={{ color: '#FFD700' }} />
        <span style={{ fontWeight: 700, fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', color: '#FFD700' }}>
          Solicitudes pendientes ({members.length})
        </span>
      </div>
      <div style={{
        border: '1px solid var(--border)',
        borderRadius: '0 0 6px 6px',
        overflow: 'hidden',
      }}>
        {members.map((member, i) => (
          <div
            key={member.user_id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              background: i % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-secondary)',
              borderTop: i > 0 ? '1px solid var(--border)' : 'none',
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: 500 }}>{member.username}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleApprove(member.user_id)}
                disabled={isPending}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  background: '#27ae60',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '5px 12px',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: isPending ? 'not-allowed' : 'pointer',
                  opacity: isPending ? 0.6 : 1,
                }}
              >
                <Check size={13} />
                Aceptar
              </button>
              <button
                onClick={() => handleReject(member.user_id)}
                disabled={isPending}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  background: 'transparent',
                  color: 'var(--live)',
                  border: '1px solid var(--live)',
                  borderRadius: '4px',
                  padding: '5px 12px',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: isPending ? 'not-allowed' : 'pointer',
                  opacity: isPending ? 0.6 : 1,
                }}
              >
                <X size={13} />
                Rechazar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
