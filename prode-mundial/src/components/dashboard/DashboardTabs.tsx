'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MatchSection from '@/components/matches/MatchSection'
import GroupStageFilter from '@/components/matches/GroupStageFilter'
import MisPicks from '@/components/matches/MisPicks'
import ChampionPickSelector from '@/components/champion/ChampionPickSelector'
import { type Match } from '@/components/matches/MatchCard'
import { useDictionary } from '@/hooks/useDictionary'

interface PickMatch {
  id: string
  homeTeam: string
  awayTeam: string
  homeFlag?: string
  awayFlag?: string
  matchDate: string
  status: 'scheduled' | 'live' | 'finished'
  group?: string
  phase: string
  defaultPickHome?: number
  defaultPickAway?: number
}

interface DashboardTabsProps {
  allMatches: Match[]
  liveMatches: Match[]
  todayMatches: Match[]
  allPickMatches: PickMatch[]
  isLoggedIn: boolean
  defaultChampionPick?: string | null
  officialChampion?: string | null
  userTotalPoints?: number
  userExactHits?: number
  userPartialHits?: number
}

export default function DashboardTabs({
  allMatches,
  liveMatches,
  todayMatches,
  allPickMatches,
  isLoggedIn,
  defaultChampionPick,
  officialChampion,
  userTotalPoints = 0,
  userExactHits = 0,
  userPartialHits = 0,
}: DashboardTabsProps) {
  const router = useRouter()
  const t = useDictionary()
  const [activeTab, setActiveTab] = useState<'todos' | 'vivo' | 'picks'>('picks')

  // Auto-refresh cada 60s cuando hay partidos en vivo para mantener scores y bloqueos actualizados
  useEffect(() => {
    if (liveMatches.length === 0) return
    const interval = setInterval(() => { router.refresh() }, 60_000)
    return () => clearInterval(interval)
  }, [liveMatches.length, router])

  const [knockoutFilter, setKnockoutFilter] = useState<'' | 'r32' | 'r16' | 'qf' | 'sf' | 'final'>('')

  const groupMatches = allMatches.filter((m) => m.phase === 'groups')
  const knockoutMatches = allMatches.filter((m) => m.phase !== 'groups')
  const filteredKnockout = knockoutFilter === ''
    ? knockoutMatches
    : knockoutMatches.filter((m) => m.phase === knockoutFilter)

  const vivoContent = liveMatches.length > 0 ? liveMatches : todayMatches
  const vivoTitle = liveMatches.length > 0 ? t.dashboard.live.label : t.dashboard.live.today
  const vivoIcon = liveMatches.length > 0 ? '🔴' : '📅'
  const vivoEmptyMsg = t.dashboard.live.noMatchesToday

  const tabs = [
    { id: 'picks', label: t.dashboard.tabs.picks },
    { id: 'vivo', label: liveMatches.length > 0 ? `${t.dashboard.tabs.live} (${liveMatches.length})` : t.dashboard.tabs.today },
    { id: 'todos', label: t.dashboard.tabs.all },
  ] as const

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '0 4px' }}>
        <h1 style={{ fontWeight: 900, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {activeTab === 'picks' ? t.dashboard.headers.myPredictions : t.dashboard.headers.worldCup}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isLoggedIn && activeTab === 'picks' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              background: 'linear-gradient(135deg, rgba(116,172,223,0.12) 0%, rgba(116,172,223,0.06) 100%)',
              border: '1px solid var(--accent)',
              borderRadius: '10px', padding: '10px 18px',
              boxShadow: '0 0 16px rgba(116,172,223,0.15)',
              maxWidth: '320px',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
                <span style={{ fontSize: '28px', fontWeight: 900, color: 'var(--accent)', letterSpacing: '-1px' }}>{userTotalPoints}</span>
                <span style={{ fontSize: '11px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '3px', opacity: 0.8 }}>{t.prode.stats.pts}</span>
              </div>
              <div style={{ width: '1px', height: '36px', background: 'var(--border)' }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#f0c040' }}>{userExactHits}</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '3px' }}>{t.prode.stats.exact}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
                <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-secondary, #aaa)' }}>{userPartialHits}</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '3px' }}>{t.prode.stats.partial}</span>
              </div>
            </div>
          )}
          {liveMatches.length > 0 && activeTab !== 'vivo' && (
            <span style={{ color: 'var(--live)', fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              onClick={() => setActiveTab('vivo')}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--live)', display: 'inline-block' }} />
              {t.dashboard.tabs.live} ({liveMatches.length})
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', marginBottom: '16px', borderBottom: '2px solid var(--border)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none', border: 'none', padding: '8px 16px', fontWeight: 700, fontSize: '13px',
              color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: '-2px', letterSpacing: '0.5px', cursor: 'pointer', transition: 'color 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido TODOS */}
      {activeTab === 'todos' && (
        <>
          {groupMatches.length > 0 && (
            <GroupStageFilter
              matches={groupMatches}
              canEdit={false}
              groupStageTitle={t.dashboard.groups.groupStage}
              groupLabel={t.fase.group}
              fechaLabel={t.misPicks.fecha}
              allLabel={t.misPicks.allFechas}
              hideMatches={knockoutFilter !== ''}
              rightSlot={knockoutMatches.length > 0 ? (
                <select
                  value={knockoutFilter}
                  onChange={(e) => setKnockoutFilter(e.target.value as '' | 'r32' | 'r16' | 'qf' | 'sf' | 'final')}
                  style={{
                    background: knockoutFilter ? 'var(--accent)' : 'transparent',
                    border: `1px solid ${knockoutFilter ? 'none' : 'var(--border)'}`,
                    borderRadius: '6px',
                    color: knockoutFilter ? '#fff' : 'var(--text-muted)',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                    {t.dashboard.groups.knockout}
                  </option>
                  <option value="r32" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{t.nav.phases.r32}</option>
                  <option value="r16" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{t.nav.phases.r16}</option>
                  <option value="qf"  style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{t.nav.phases.qf}</option>
                  <option value="sf"  style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{t.nav.phases.sf}</option>
                  <option value="final" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{t.nav.phases.final}</option>
                </select>
              ) : undefined}
            />
          )}
          {knockoutFilter === 'final' && filteredKnockout.length === 2 ? (() => {
            const sorted = [...filteredKnockout].sort((a, b) =>
              new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime()
            )
            return (
              <>
                <MatchSection title={t.fase.third} icon="🥉" matches={[sorted[0]]} canEdit={false} />
                <MatchSection title={t.nav.phases.final} icon="🏆" matches={[sorted[1]]} canEdit={false} />
              </>
            )
          })() : filteredKnockout.length > 0 ? (
            <MatchSection
              title={knockoutFilter ? (t.nav.phases as Record<string, string>)[knockoutFilter] : t.dashboard.groups.knockout}
              icon="⚽"
              matches={filteredKnockout}
              canEdit={false}
            />
          ) : null}
          {allMatches.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontSize: '14px' }}>
              {t.dashboard.live.worldStarts}
            </div>
          )}
        </>
      )}

      {/* Contenido VIVO / HOY */}
      {activeTab === 'vivo' && (
        <>
          {vivoContent.length > 0
            ? <MatchSection title={vivoTitle} icon={vivoIcon} matches={vivoContent} canEdit={false} />
            : <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontSize: '14px' }}>{vivoEmptyMsg}</div>
          }
        </>
      )}

      {/* Contenido MIS PICKS — siempre montado para no perder estado */}
      <div style={{ display: activeTab === 'picks' ? 'block' : 'none' }}>
        {isLoggedIn
          ? <>
              <ChampionPickSelector
                currentPick={defaultChampionPick ?? null}
                officialChampion={officialChampion ?? null}
                teams={[...new Set(
                  allMatches.flatMap((m) => [m.homeTeam, m.awayTeam])
                    .filter((t) => t && t !== 'A definir' && t !== 'TBD')
                )].sort()}
              />
              <MisPicks matches={allPickMatches} />
            </>
          : <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontSize: '14px' }}>
              <p>{t.dashboard.loginPrompt}</p>
            </div>
        }
      </div>
    </div>
  )
}
