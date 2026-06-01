'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { computePoints } from '@/lib/compute-points'

import PickForm from './PickForm'
import ScoreEditor from './ScoreEditor'
import type { AdminPickData, LeaderboardEntry } from '../page'

interface Match {
  id: string
  home_team: string | null
  away_team: string | null
  home_flag: string | null
  away_flag: string | null
  match_date: string
  status: string
  home_score: number | null
  away_score: number | null
  minute: number | null
  group_name: string | null
  competition_code: string | null
}

interface Props {
  initialMatches: Match[]
  myPicks: AdminPickData[]
  leaderboard: LeaderboardEntry[]
  currentUserId: string
}

const COMPETITION_LABELS: Record<string, string> = {
  WC: 'FIFA World Cup', BSA: 'Brasileirao', CL: 'Champions League',
  PL: 'Premier League', BL1: 'Bundesliga', SA: 'Serie A', PD: 'La Liga',
  FL1: 'Ligue 1', CLI: 'Copa Libertadores', DED: 'Eredivisie',
  PPL: 'Primeira Liga', ELC: 'Championship', EC: 'Eurocopa',
}

const REFRESH_SECONDS = 30

function isLocked(matchDate: string, status: string) {
  return status !== 'scheduled' || new Date(matchDate) <= new Date()
}

function PointsBadge({ pts, provisional }: { pts: number; provisional?: boolean }) {
  const colors = [
    { bg: '#1a1a1a', color: '#555' },
    { bg: '#1a2a1a', color: '#7cb87c' },
    { bg: '#1a281a', color: '#4caf50' },
    { bg: '#0d200d', color: '#f0c040' },
  ]
  const c = colors[Math.min(pts, 3)]
  return (
    <span style={{
      background: c.bg, color: c.color,
      fontSize: '11px', fontWeight: 800,
      padding: '3px 8px', borderRadius: '4px',
      border: `1px solid ${c.color}33`,
      opacity: provisional ? 0.7 : 1,
    }}>
      {provisional ? '~' : ''}{pts} pt{pts !== 1 ? 's' : ''}
    </span>
  )
}

function AdminMatchRow({ match, myPick }: { match: Match; myPick?: AdminPickData }) {
  const time = new Date(match.match_date).toLocaleTimeString('es-AR', {
    hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires',
  })
  const locked = isLocked(match.match_date, match.status)
  const isLive = match.status === 'live'
  const isFinished = match.status === 'finished'
  const hasScore = match.home_score != null && match.away_score != null

  const pts = myPick && hasScore
    ? computePoints(myPick.homePick, myPick.awayPick, match.home_score!, match.away_score!)
    : null

  return (
    <div style={{
      padding: '14px 16px',
      borderBottom: '1px solid #1e1e1e',
      background: isLive ? 'rgba(255,68,68,0.04)' : 'transparent',
    }}>
      {/* Match info */}
      <div style={{ display: 'grid', gridTemplateColumns: '65px 1fr auto 1fr auto', alignItems: 'center', gap: '10px' }}>
        <div style={{ fontSize: '11px', color: '#666', lineHeight: 1.4 }}>
          {time} ARG
          {isLive && match.minute != null && (
            <div style={{ color: '#ff4444', fontWeight: 700 }}>{match.minute}&apos;</div>
          )}
        </div>
        <div style={{ textAlign: 'right', fontWeight: 600, fontSize: '13px' }}>
          {match.home_flag && <img src={`https://flagcdn.com/20x15/${match.home_flag}.png`} alt="" style={{ marginRight: 6, verticalAlign: 'middle' }} />}
          {match.home_team ?? '—'}
        </div>
        <div style={{
          textAlign: 'center', minWidth: '56px',
          fontSize: hasScore ? '17px' : '12px', fontWeight: 800,
          color: isLive ? '#ff4444' : isFinished ? '#ccc' : '#444',
          letterSpacing: '2px',
        }}>
          {hasScore ? `${match.home_score} - ${match.away_score}` : 'vs'}
        </div>
        <div style={{ textAlign: 'left', fontWeight: 600, fontSize: '13px' }}>
          {match.away_team ?? '—'}
          {match.away_flag && <img src={`https://flagcdn.com/20x15/${match.away_flag}.png`} alt="" style={{ marginLeft: 6, verticalAlign: 'middle' }} />}
        </div>
        <div style={{ textAlign: 'right' }}>
          {pts != null && <PointsBadge pts={pts} provisional={isLive} />}
        </div>
      </div>

      {/* Pick + score editor */}
      <div style={{ marginTop: '10px', paddingLeft: '65px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <div>
          {locked ? (
            myPick ? (
              <span style={{ fontSize: '12px', color: '#555' }}>
                Tu pick:{' '}
                <span style={{ color: '#74acdf', fontWeight: 700 }}>{myPick.homePick} - {myPick.awayPick}</span>
                {pts == null && <span style={{ color: '#444', marginLeft: 8 }}>esperando resultado…</span>}
              </span>
            ) : (
              <span style={{ fontSize: '11px', color: '#333', fontStyle: 'italic' }}>Sin pick</span>
            )
          ) : (
            <PickForm
              matchId={match.id}
              initialHome={myPick?.homePick}
              initialAway={myPick?.awayPick}
              homeTeam={match.home_team ?? ''}
              awayTeam={match.away_team ?? ''}
            />
          )}
        </div>

        <ScoreEditor
          matchId={match.id}
          currentHomeScore={match.home_score}
          currentAwayScore={match.away_score}
          currentStatus={match.status}
        />
      </div>
    </div>
  )
}

function AdminLeaderboard({ entries, currentUserId }: { entries: LeaderboardEntry[]; currentUserId: string }) {
  if (entries.length === 0) return null
  return (
    <div style={{ marginBottom: '32px', border: '1px solid #2a2a2a', borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', background: '#1a1a2a', borderBottom: '1px solid #2a2a2a' }}>
        <span style={{ fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Tabla Admin Prode
        </span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ background: '#141414', color: '#555', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {['#', 'Jugador', 'Picks', 'Pts', '~Vivo', 'Exactos', 'Parciales'].map((h, i) => (
              <th key={h} style={{ padding: '8px 12px', textAlign: i < 2 ? 'left' : 'center', fontWeight: 700 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => {
            const isMe = e.userId === currentUserId
            return (
              <tr key={e.userId} style={{ borderTop: '1px solid #1e1e1e', background: isMe ? 'rgba(116,172,223,0.06)' : 'transparent' }}>
                <td style={{ padding: '10px 12px', color: '#555', fontWeight: 700 }}>{i + 1}</td>
                <td style={{ padding: '10px 12px', fontWeight: isMe ? 800 : 500 }}>
                  {e.displayName}
                  {isMe && <span style={{ color: '#74acdf', fontSize: '10px', marginLeft: 6 }}>tú</span>}
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'center', color: '#666' }}>{e.totalPicks}</td>
                <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, color: '#f0c040', fontSize: '15px' }}>{e.points}</td>
                <td style={{ padding: '10px 12px', textAlign: 'center', color: '#ff6644', fontWeight: 700 }}>
                  {e.provisionalPoints > 0 ? `+${e.provisionalPoints}` : '—'}
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'center', color: '#f0c040' }}>{e.exactHits}</td>
                <td style={{ padding: '10px 12px', textAlign: 'center', color: '#aaa' }}>{e.partialHits}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function LiveMatchesView({ initialMatches, myPicks, leaderboard, currentUserId }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [countdown, setCountdown] = useState(REFRESH_SECONDS)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      startTransition(() => { router.refresh() })
      setLastRefresh(new Date())
    }, REFRESH_SECONDS * 1000)
    return () => clearInterval(interval)
  }, [router])

  useEffect(() => {
    setCountdown(REFRESH_SECONDS)
    const tick = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(tick)
  }, [lastRefresh])

  function handleManualRefresh() {
    startTransition(() => { router.refresh() })
    setLastRefresh(new Date())
  }

const myPickMap = new Map(myPicks.map((p) => [p.matchId, p]))

  const todayStr = new Date().toDateString()
  const liveMatches = initialMatches.filter((m) => m.status === 'live')
  const todayMatches = initialMatches.filter((m) =>
    m.status !== 'live' && new Date(m.match_date).toDateString() === todayStr
  )
  const upcomingMatches = initialMatches.filter((m) =>
    m.status !== 'live' && new Date(m.match_date).toDateString() !== todayStr
  )

  const grouped = (matches: Match[]) => {
    const map: Record<string, Match[]> = {}
    for (const m of matches) {
      const key = m.competition_code ?? 'WC'
      if (!map[key]) map[key] = []
      map[key].push(m)
    }
    return map
  }

  function renderGroup(code: string, matches: Match[]) {
    const label = COMPETITION_LABELS[code] ?? code
    const hasLive = matches.some((m) => m.status === 'live')
    return (
      <div key={code} style={{ marginBottom: '24px', border: '1px solid #2a2a2a', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', background: '#1a1a2a', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #1e1e1e' }}>
          <span style={{ fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>
          {hasLive && <span style={{ color: '#ff4444', fontSize: '11px', fontWeight: 700 }}>● EN VIVO</span>}
          <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#444' }}>
            {matches.length} partido{matches.length !== 1 ? 's' : ''}
          </span>
        </div>
        {matches.map((m) => <AdminMatchRow key={m.id} match={m} myPick={myPickMap.get(m.id)} />)}
      </div>
    )
  }

  return (
    <div style={{ padding: '24px', maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
            Admin Prode Test Brasileirao
          </h1>
          <p style={{ fontSize: '12px', color: '#444', margin: '4px 0 0' }}>
            Actualización: {lastRefresh.toLocaleTimeString('es-AR')}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {liveMatches.length > 0 && (
            <span style={{ background: 'rgba(255,68,68,0.15)', color: '#ff4444', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}>
              ● {liveMatches.length} EN VIVO
            </span>
          )}
          <button
            onClick={handleManualRefresh} disabled={isPending}
            style={{
              background: '#1a2a3a', border: '1px solid #2a3a4a', color: '#74acdf',
              padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
              cursor: 'pointer', opacity: isPending ? 0.6 : 1,
            }}
          >
            {isPending ? '...' : `↻ (${countdown}s)`}
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      <AdminLeaderboard entries={leaderboard} currentUserId={currentUserId} />

      {/* En vivo */}
      {Object.keys(grouped(liveMatches)).length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '12px', color: '#ff4444', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>● En vivo</h2>
          {Object.entries(grouped(liveMatches)).map(([code, m]) => renderGroup(code, m))}
        </div>
      )}

      {/* Hoy */}
      {Object.keys(grouped(todayMatches)).length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '12px', color: '#555', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Hoy</h2>
          {Object.entries(grouped(todayMatches)).map(([code, m]) => renderGroup(code, m))}
        </div>
      )}

      {/* Próximos días */}
      {Object.keys(grouped(upcomingMatches)).length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '12px', color: '#74acdf', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Próximos días — cargá tus picks</h2>
          {Object.entries(grouped(upcomingMatches)).map(([code, m]) => renderGroup(code, m))}
        </div>
      )}

      {initialMatches.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#444', fontSize: '14px' }}>
          No hay partidos con picks registrados.
        </div>
      )}
    </div>
  )
}
