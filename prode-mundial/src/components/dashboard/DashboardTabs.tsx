'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MatchSection from '@/components/matches/MatchSection'
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
}

export default function DashboardTabs({
  allMatches,
  liveMatches,
  todayMatches,
  allPickMatches,
  isLoggedIn,
  defaultChampionPick,
  officialChampion,
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

  const groupMatches = allMatches.filter((m) => m.phase === 'groups')
  const knockoutMatches = allMatches.filter((m) => m.phase !== 'groups')

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
        {liveMatches.length > 0 && activeTab !== 'vivo' && (
          <span style={{ color: 'var(--live)', fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
            onClick={() => setActiveTab('vivo')}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--live)', display: 'inline-block' }} />
            {t.dashboard.tabs.live} ({liveMatches.length})
          </span>
        )}
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
            <MatchSection title={t.dashboard.groups.groupStage} icon="🏆" matches={groupMatches} canEdit={false} />
          )}
          {knockoutMatches.length > 0 && (
            <MatchSection title={t.dashboard.groups.knockout} icon="⚽" matches={knockoutMatches} canEdit={false} />
          )}
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
