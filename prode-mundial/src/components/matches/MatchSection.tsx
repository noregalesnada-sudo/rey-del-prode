'use client'

import { useState } from 'react'
import SectionHeader, { SectionFooterLink } from './SectionHeader'
import MatchCard, { type Match } from './MatchCard'

interface MatchSectionProps {
  title: string
  icon?: string
  matches: Match[]
  canEdit: boolean
  prodeId?: string
  footerLink?: string
  footerLabel?: string
  onPickSave?: (matchId: string, home: number, away: number) => void
  onPickClear?: (matchId: string) => void
  hideDisclaimer?: boolean
}

export default function MatchSection({
  title,
  icon,
  matches,
  canEdit,
  footerLink,
  footerLabel,
  onPickSave,
  onPickClear,
  hideDisclaimer = false,
}: MatchSectionProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '4px',
      }}
    >
      <SectionHeader
        title={title}
        icon={icon}
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
      />

      {isOpen && (
        <>
          {!hideDisclaimer && onPickClear && matches.some(m => m.hasProdeOverride) && (
            <div style={{ padding: '6px 16px', background: 'rgba(116,172,223,0.07)', borderBottom: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-muted)' }}>
              Algunos picks están personalizados para este prode. Presioná <strong>×</strong> en un partido para volver al pronóstico de <em>Mis Pronósticos</em>.
            </div>
          )}
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              canEdit={canEdit}
              onPickSave={onPickSave}
              onPickClear={onPickClear}
            />
          ))}
          {footerLink && footerLabel && (
            <SectionFooterLink href={footerLink} label={footerLabel} />
          )}
        </>
      )}
    </div>
  )
}
