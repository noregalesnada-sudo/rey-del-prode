'use client'

import { type PickDistribution } from '@/lib/pick-distribution'

// Local = celeste, Empate = gris pizarra, Visita = naranja. Distinguibles sobre fondo oscuro.
const COLORS = { home: '#4a9fe0', draw: '#8b95a3', away: '#e0764a' } as const

export interface DistributionLabels {
  title: string
  home: string
  draw: string
  away: string
  players: string
}

/**
 * Barra apilada con la distribución L/E/V de los pronósticos del prode.
 * Los segmentos en 0% se colapsan (no se renderizan). El pick propio se marca con ★.
 */
export default function PickDistributionBar({
  dist,
  userPick,
  labels,
}: {
  dist: PickDistribution
  userPick: 'home' | 'draw' | 'away' | null
  labels: DistributionLabels
}) {
  const pct = (n: number) => Math.round((n / dist.total) * 100)
  const segments = (['home', 'draw', 'away'] as const).filter((k) => dist[k] > 0)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 0.8, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          {labels.title}
        </span>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>
          {dist.total} {labels.players}
        </span>
      </div>

      <div style={{ display: 'flex', height: 24, borderRadius: 8, overflow: 'hidden', gap: 2 }}>
        {segments.map((k) => (
          <div
            key={k}
            title={`${labels[k]} ${pct(dist[k])}%`}
            style={{ flexGrow: dist[k], flexBasis: 0, background: COLORS[k], display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}
          >
            {pct(dist[k]) >= 12 && (
              <span style={{ fontSize: 11, fontWeight: 900, color: '#0b1f3a', fontVariantNumeric: 'tabular-nums' }}>
                {pct(dist[k])}%
              </span>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6, marginTop: 6 }}>
        {(['home', 'draw', 'away'] as const).map((k) => (
          <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)' }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[k], flexShrink: 0 }} />
            {labels[k]} {pct(dist[k])}%
            {userPick === k && <span style={{ color: '#f5c518' }}>★</span>}
          </span>
        ))}
      </div>
    </div>
  )
}
