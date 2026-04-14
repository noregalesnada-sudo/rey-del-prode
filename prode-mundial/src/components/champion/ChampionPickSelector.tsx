'use client'

import { useState, useTransition } from 'react'
import { saveChampionPick } from '@/lib/actions/champion'

// 48 seleccionados Copa del Mundo 2026
export const WC2026_TEAMS = [
  // CONMEBOL
  'Argentina', 'Brasil', 'Colombia', 'Uruguay', 'Ecuador', 'Venezuela',
  // UEFA
  'España', 'Francia', 'Alemania', 'Inglaterra', 'Portugal', 'Países Bajos',
  'Italia', 'Bélgica', 'Croacia', 'Serbia', 'Suiza', 'Polonia',
  'Dinamarca', 'Austria', 'Escocia', 'Turquía',
  // CONCACAF
  'Estados Unidos', 'México', 'Canadá', 'Costa Rica', 'Panamá', 'Jamaica',
  // CAF
  'Marruecos', 'Senegal', 'Nigeria', 'Egipto', 'Camerún', 'Costa de Marfil',
  'Sudáfrica', 'DR Congo', 'Mali',
  // AFC
  'Japón', 'Corea del Sur', 'Irán', 'Australia', 'Arabia Saudita',
  'Catar', 'Uzbekistán', 'Jordania',
  // OFC
  'Nueva Zelanda',
  // Repechaje / por confirmar
  'Ucrania', 'Ghana', 'Chile',
].sort()

interface ChampionPickSelectorProps {
  currentPick: string | null
  prodeId?: string          // undefined = default (Mis Pronósticos)
  officialChampion?: string | null  // set cuando el torneo terminó
}

export default function ChampionPickSelector({
  currentPick,
  prodeId,
  officialChampion,
}: ChampionPickSelectorProps) {
  const [selected, setSelected] = useState(currentPick ?? '')
  const [saved, setSaved] = useState(!!currentPick)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Deadline: 15 min antes del 11 jun 2026 19:00 Ciudad de México
  const deadline = new Date('2026-06-11T19:00:00-06:00').getTime() - 15 * 60 * 1000
  const locked = Date.now() >= deadline || !!officialChampion

  const hit = officialChampion && currentPick === officialChampion

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelected(e.target.value)
    setSaved(false)
    setError(null)
  }

  function handleSave() {
    if (!selected) return
    startTransition(async () => {
      const res = await saveChampionPick(selected, prodeId)
      if (res?.error) {
        setError(res.error)
      } else {
        setSaved(true)
      }
    })
  }

  return (
    <div style={{
      background: 'var(--card-bg, #0d2545)',
      border: `1px solid ${hit ? 'rgba(74,222,128,0.4)' : 'rgba(255,215,0,0.25)'}`,
      borderRadius: '8px',
      padding: '16px 20px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#FFD700' }}>
            Campeón del Mundial
          </span>
          <span style={{
            fontSize: '10px', fontWeight: 700, padding: '1px 7px',
            borderRadius: '20px', background: 'rgba(255,215,0,0.12)',
            border: '1px solid rgba(255,215,0,0.3)', color: '#FFD700',
          }}>
            +10 pts
          </span>
          {hit && (
            <span style={{
              fontSize: '10px', fontWeight: 800, padding: '1px 7px',
              borderRadius: '20px', background: 'rgba(74,222,128,0.15)',
              border: '1px solid rgba(74,222,128,0.4)', color: '#4ade80',
            }}>
              ¡Acertaste!
            </span>
          )}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {locked && !officialChampion
            ? 'El plazo para elegir cerró al inicio del torneo.'
            : officialChampion
            ? `Campeón oficial: ${officialChampion}`
            : 'Elegí antes del inicio del torneo · Cierra 15 min antes del primer partido'}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {locked ? (
          <div style={{
            padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700,
            background: 'rgba(116,172,223,0.08)', border: '1px solid rgba(116,172,223,0.15)',
            color: currentPick ? 'var(--text-primary)' : 'var(--text-muted)',
          }}>
            {currentPick ?? 'Sin elección'}
          </div>
        ) : (
          <>
            <select
              value={selected}
              onChange={handleChange}
              style={{
                background: 'rgba(116,172,223,0.08)',
                border: `1px solid ${saved && selected ? 'var(--accent)' : 'rgba(116,172,223,0.2)'}`,
                borderRadius: '6px', padding: '8px 12px',
                fontSize: '13px', color: 'var(--text-primary)',
                outline: 'none', minWidth: '160px', cursor: 'pointer',
              }}
            >
              <option value="">— Elegir campeón —</option>
              {WC2026_TEAMS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <button
              onClick={handleSave}
              disabled={!selected || isPending || saved}
              style={{
                padding: '8px 16px', borderRadius: '6px',
                fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px',
                border: 'none', cursor: (!selected || isPending || saved) ? 'not-allowed' : 'pointer',
                background: saved ? 'rgba(74,222,128,0.15)' : 'var(--accent)',
                color: saved ? '#4ade80' : '#fff',
                transition: 'background 0.15s',
              }}
            >
              {isPending ? '...' : saved ? 'Guardado' : 'Guardar'}
            </button>
          </>
        )}
      </div>

      {error && (
        <div style={{ width: '100%', fontSize: '12px', color: '#ef4444' }}>{error}</div>
      )}
    </div>
  )
}
