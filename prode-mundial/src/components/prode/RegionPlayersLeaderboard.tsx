'use client'

import { useState } from 'react'
import Leaderboard, { type LeaderboardRow } from './Leaderboard'

interface RegionPlayersLeaderboardProps {
  // Regiones ordenadas por ranking (la región líder primero), igual que el ranking agregado.
  areas: string[]
  // Jugadores por región, ya rankeados por puntos.
  playersByArea: Record<string, LeaderboardRow[]>
  // Región del usuario; si no tiene, la primera de `areas`.
  defaultArea: string
  currentUserId: string
  // Título base, ej. "Ranking por Región". Se le agrega " — {región}".
  titleBase: string
  // Etiqueta del selector, ej. "Ver región".
  selectLabel: string
  // Etiqueta de jugadores para el subtítulo, ej. "jugadores".
  playersLabel: string
}

export default function RegionPlayersLeaderboard({
  areas,
  playersByArea,
  defaultArea,
  currentUserId,
  titleBase,
  selectLabel,
  playersLabel,
}: RegionPlayersLeaderboardProps) {
  const [selectedArea, setSelectedArea] = useState(defaultArea)
  const rows = playersByArea[selectedArea] ?? []

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
          {selectLabel}
        </label>
        <select
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
          style={{
            background: 'var(--accent)', border: 'none', borderRadius: 8,
            color: '#fff', padding: '7px 12px', fontSize: 13, fontWeight: 800,
            cursor: 'pointer', outline: 'none',
          }}
        >
          {areas.map((area) => (
            <option key={area} value={area} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
              {area}
            </option>
          ))}
        </select>
      </div>

      {/* key={selectedArea} remonta la tabla al cambiar de región: resetea la paginación interna. */}
      <Leaderboard
        key={selectedArea}
        rows={rows}
        currentUserId={currentUserId}
        title={`${titleBase} — ${selectedArea}`}
        subtitle={`${rows.length} ${playersLabel}`}
      />
    </div>
  )
}
