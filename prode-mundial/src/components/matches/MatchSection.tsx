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
}

export default function MatchSection({
  title,
  icon,
  matches,
  canEdit,
  footerLink,
  footerLabel,
  onPickSave,
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
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              canEdit={canEdit}
              onPickSave={onPickSave}
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
