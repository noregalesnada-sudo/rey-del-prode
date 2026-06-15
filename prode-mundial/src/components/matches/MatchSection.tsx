'use client'

import { useState, Fragment } from 'react'
import SectionHeader, { SectionFooterLink } from './SectionHeader'
import MatchCard, { type Match } from './MatchCard'
import { useDictionary } from '@/hooks/useDictionary'

// "DD/MM" estable (sin locale, para no romper hidratación), para separar partidos por día
function dayKey(dateStr: string): string {
  const d = new Date(dateStr)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

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
  onPickChange?: (matchId: string, home: string, away: string) => void
  hideDisclaimer?: boolean
  groupByDate?: boolean
  hideDate?: boolean
}

export default function MatchSection({
  title,
  icon,
  matches,
  canEdit,
  prodeId,
  footerLink,
  footerLabel,
  onPickSave,
  onPickClear,
  onPickChange,
  hideDisclaimer = false,
  groupByDate = false,
  hideDate,
}: MatchSectionProps) {
  const t = useDictionary()
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div
      style={{
        border: '1px solid var(--section-border)',
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
          {/* {!hideDisclaimer && onPickClear && matches.some(m => m.hasProdeOverride) && (
            <div style={{ padding: '6px 16px', background: 'rgba(116,172,223,0.07)', borderBottom: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-muted)' }}>
              {t.prode.pickOverrideDisclaimer}
            </div>
          )} */}
          {(() => {
            const ordered = groupByDate
              ? [...matches].sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime())
              : matches
            let lastDay = ''
            return ordered.map((match) => {
              let divider = null
              if (groupByDate) {
                const key = dayKey(match.matchDate)
                if (key !== lastDay) {
                  lastDay = key
                  divider = (
                    <div style={{ padding: '5px 16px', background: 'color-mix(in srgb, var(--accent) 14%, transparent)', borderTop: '1px solid var(--section-border)', fontSize: '10px', fontWeight: 800, letterSpacing: '0.8px', color: 'var(--accent)' }}>
                      {key}
                    </div>
                  )
                }
              }
              return (
                <Fragment key={match.id}>
                  {divider}
                  <MatchCard
                    match={match}
                    canEdit={canEdit}
                    prodeId={prodeId}
                    onPickSave={onPickSave}
                    onPickClear={onPickClear}
                    onPickChange={onPickChange}
                    hideDate={hideDate ?? groupByDate}
                  />
                </Fragment>
              )
            })
          })()}
          {footerLink && footerLabel && (
            <SectionFooterLink href={footerLink} label={footerLabel} />
          )}
        </>
      )}
    </div>
  )
}
