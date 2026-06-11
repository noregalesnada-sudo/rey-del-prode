'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Eye } from 'lucide-react'
import { getMatchPicks, type RevealedPick } from '@/lib/actions/picks'
import { useDictionary } from '@/hooks/useDictionary'

interface MatchPicksRevealProps {
  matchId: string
  prodeId: string
  homeTeam: string
  awayTeam: string
}

function pointsColor(points: number) {
  return points === 3 ? '#27ae60' : points === 1 ? 'var(--accent)' : 'var(--text-muted)'
}

export default function MatchPicksReveal({ matchId, prodeId, homeTeam, awayTeam }: MatchPicksRevealProps) {
  const t = useDictionary()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [picks, setPicks] = useState<RevealedPick[] | null>(null)
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)

  const btnRef = useRef<HTMLButtonElement>(null)
  const popRef = useRef<HTMLDivElement>(null)

  const PANEL_WIDTH = 260

  function reposition() {
    const el = btnRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    // Alineado al borde derecho del botón, justo debajo; clamp al viewport.
    let left = r.right - PANEL_WIDTH
    if (left < 8) left = 8
    const top = r.bottom + 6
    setCoords({ top, left })
  }

  async function handleToggle() {
    if (open) {
      setOpen(false)
      return
    }
    reposition()
    setOpen(true)
    // Cargar una sola vez (cache hasta cerrar la card / refresh)
    if (picks === null && !loading) {
      setLoading(true)
      setError(null)
      const res = await getMatchPicks(matchId, prodeId)
      if ('error' in res && res.error) setError(res.error)
      else setPicks((res as { picks: RevealedPick[] }).picks)
      setLoading(false)
    }
  }

  // Cerrar al clickear afuera o al hacer scroll/resize
  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node
      if (btnRef.current?.contains(target) || popRef.current?.contains(target)) return
      setOpen(false)
    }
    function onScroll(e: Event) {
      // Scroll DENTRO del panel (lista larga): no cerrar, dejar desplazar.
      if (popRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    function onResize() {
      setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleToggle}
        title={t.matches.revealPicks}
        aria-label={t.matches.revealPicks}
        style={{
          background: open ? 'rgba(116,172,223,0.28)' : 'rgba(116,172,223,0.12)',
          color: '#74ACDF',
          border: '2px solid #74ACDF',
          borderRadius: '5px',
          padding: '3px 5px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          transition: 'background 0.15s',
        }}
      >
        <Eye size={15} strokeWidth={2.5} />
      </button>

      {open && coords && typeof document !== 'undefined' && createPortal(
        <div
          ref={popRef}
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            width: PANEL_WIDTH,
            maxHeight: '320px',
            overflowY: 'auto',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--section-border)',
            borderRadius: '8px',
            boxShadow: '0 8px 28px rgba(0,0,0,0.45)',
            zIndex: 1000,
            padding: '8px',
          }}
        >
          <div style={{ padding: '4px 6px 8px', borderBottom: '1px solid var(--border)', marginBottom: '6px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t.matches.groupPicks}
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              {homeTeam} - {awayTeam}
            </div>
          </div>

          {loading && (
            <div style={{ padding: '12px 6px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
              {t.matches.loadingPicks}
            </div>
          )}

          {!loading && error && (
            <div style={{ padding: '12px 6px', fontSize: '12px', color: 'var(--live)', textAlign: 'center' }}>
              {error}
            </div>
          )}

          {!loading && !error && picks && picks.length === 0 && (
            <div style={{ padding: '12px 6px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
              {t.matches.noPicksYet}
            </div>
          )}

          {!loading && !error && picks && picks.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {picks.map((p) => (
                <div
                  key={p.userId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '5px 6px',
                    borderRadius: '5px',
                    background: p.isYou ? 'rgba(116,172,223,0.10)' : 'transparent',
                  }}
                >
                  {p.avatarUrl ? (
                    <img src={p.avatarUrl} alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <span style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, background: 'var(--border)', color: 'var(--text-muted)', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', textTransform: 'uppercase' }}>
                      {p.name.charAt(0)}
                    </span>
                  )}
                  <span style={{ flex: 1, minWidth: 0, fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.isYou ? `${p.name} (${t.matches.you})` : p.name}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', flexShrink: 0 }}>
                    {p.home}-{p.away}
                  </span>
                  {p.points !== null && (
                    <span style={{ background: pointsColor(p.points), color: '#fff', borderRadius: '3px', padding: '1px 5px', fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>
                      {p.points}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  )
}
