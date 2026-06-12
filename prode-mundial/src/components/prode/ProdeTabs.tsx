'use client'

import { useState, useEffect, useRef } from 'react'
import { useLang } from '@/hooks/useDictionary'

interface ProdeTabsProps {
  tabla: React.ReactNode
  /** Si es undefined (ej. espectador), no se muestran tabs: solo la tabla. */
  partidos?: React.ReactNode
  initialTab?: 'tabla' | 'partidos'
}

export default function ProdeTabs({ tabla, partidos, initialTab }: ProdeTabsProps) {
  const lang = useLang()
  const [tab, setTab] = useState<'tabla' | 'partidos'>(initialTab ?? 'tabla')
  const segRef = useRef<HTMLDivElement>(null)

  // Si entrás directo a Partidos (ej. desde "Pronosticar"), scrollea hasta los tabs.
  useEffect(() => {
    if (initialTab !== 'partidos') return
    // Si venís apuntando a un partido puntual (#m-id), que el imán lo haga el MatchCard (no los tabs).
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#m-')) return
    const tid = setTimeout(() => segRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200)
    return () => clearTimeout(tid)
  }, [initialTab])

  const L = lang === 'en'
    ? { tabla: '🏆 Table', partidos: '⚽ Matches' }
    : { tabla: '🏆 Tabla', partidos: '⚽ Partidos' }

  // Sin partidos (espectador) → no hay nada que separar.
  if (!partidos) return <>{tabla}</>

  return (
    <>
      <div ref={segRef} style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 13, padding: 4, margin: '16px 0', scrollMarginTop: 60 }}>
        {(['tabla', 'partidos'] as const).map((k) => {
          const on = tab === k
          return (
            <button
              key={k}
              onClick={() => setTab(k)}
              style={{
                flex: '1 1 0', border: 0, cursor: 'pointer', borderRadius: 9, padding: 10,
                fontSize: 13.5, fontWeight: 800, transition: 'all .15s',
                background: on ? 'var(--accent)' : 'transparent',
                color: on ? '#fff' : 'var(--text-muted)',
                boxShadow: on ? '0 3px 10px rgba(116,172,223,0.3)' : 'none',
              }}
            >
              {L[k]}
            </button>
          )
        })}
      </div>

      {/* Ambos montados (display toggle) para no perder el estado de carga de los picks */}
      <div style={{ display: tab === 'tabla' ? 'block' : 'none' }}>{tabla}</div>
      <div style={{ display: tab === 'partidos' ? 'block' : 'none' }}>{partidos}</div>
    </>
  )
}
