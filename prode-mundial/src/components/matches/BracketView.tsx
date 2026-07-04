'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { type Match } from './MatchCard'
import { useDictionary } from '@/hooks/useDictionary'

// Cuadro de eliminatorias (mata-mata) tipo "bracket" con scroll horizontal.
//
// El problema de fondo: la tabla `matches` NO guarda la estructura del cruce (qué llave
// alimenta a cuál). La reconstruimos infiriéndola por AVANCE DE EQUIPOS: el ganador de un
// partido reaparece como participante de la ronda siguiente, así linkeamos padre→hijo donde
// ya se jugó. Donde todavía es TBD (rondas futuras), el esqueleto queda sin conectores y se
// completa solo a medida que se definen los resultados. No agrega ninguna query: reusa los
// `matches` que la página de fixture ya trajo.

const ROUND_ORDER = ['r32', 'r16', 'qf', 'sf', 'final'] as const
type Round = (typeof ROUND_ORDER)[number]

const TBD_NAMES = new Set(['A definir', 'TBD'])
const flagUrl = (code?: string) => (code ? `https://flagcdn.com/w40/${code}.png` : undefined)

const ROW = 23 // alto de cada fila de equipo
const SLOT = 58 // alto vertical reservado por llave de la primera ronda (16avos)
const COL_W = 158 // ancho de columna
const COL_GAP = 30 // separación entre columnas (deja lugar a los conectores)

interface Node {
  id: string
  round: Round
  home: string
  away: string
  homeKnown: boolean
  awayKnown: boolean
  homeFlag?: string
  awayFlag?: string
  homeScore?: number
  awayScore?: number
  homeReg?: number | null
  awayReg?: number | null
  pens: boolean
  status: Match['status']
  date: string
  minute?: number
  winner: 'home' | 'away' | null
}

function winnerName(n: Node): string | null {
  if (n.winner === 'home') return n.homeKnown ? n.home : null
  if (n.winner === 'away') return n.awayKnown ? n.away : null
  return null
}

interface BracketData {
  rounds: Array<{ round: Round; nodes: Node[] }>
  third: Node | null
  champion: { name: string; flag?: string } | null
  edges: Array<[string, string]> // [childId (ronda posterior), feederId (ronda previa)]
  leafCount: number
  hasKnown: boolean
}

function build(matches: Match[]): BracketData {
  const toNode = (m: Match): Node => ({
    id: m.id,
    round: m.phase as Round,
    home: m.homeTeam,
    away: m.awayTeam,
    homeKnown: !TBD_NAMES.has(m.homeTeam),
    awayKnown: !TBD_NAMES.has(m.awayTeam),
    homeFlag: m.homeFlag || undefined,
    awayFlag: m.awayFlag || undefined,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    homeReg: m.regHomeScore,
    awayReg: m.regAwayScore,
    pens: m.matchDuration === 'PENALTY_SHOOTOUT',
    status: m.status,
    date: m.matchDate,
    minute: m.minute,
    winner: null,
  })

  const byPhase = new Map<string, Match[]>()
  for (const m of matches) {
    if (!(ROUND_ORDER as readonly string[]).includes(m.phase)) continue
    if (!byPhase.has(m.phase)) byPhase.set(m.phase, [])
    byPhase.get(m.phase)!.push(m)
  }

  // `final` agrupa la Final + el 3er puesto. El más temprano es el 3er puesto; el último, la Final.
  const finalRaw = (byPhase.get('final') ?? []).slice().sort(
    (a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime(),
  )
  const finalMatch = finalRaw.length ? finalRaw[finalRaw.length - 1] : null
  const thirdMatch = finalRaw.length > 1 ? finalRaw[0] : null

  // Rondas presentes, en orden, con `final` reducida a un solo partido.
  const present: Array<{ round: Round; nodes: Node[] }> = []
  for (const r of ROUND_ORDER) {
    if (r === 'final') {
      if (finalMatch) present.push({ round: r, nodes: [toNode(finalMatch)] })
      continue
    }
    const list = byPhase.get(r)
    if (list && list.length) present.push({ round: r, nodes: list.map(toNode) })
  }

  if (present.length === 0) {
    return { rounds: [], third: null, champion: null, edges: [], leafCount: 0, hasKnown: false }
  }

  // Nombres conocidos por ronda (para detectar avance sin falsos positivos con los TBD).
  const knownNames = present.map(
    (p) => new Set(p.nodes.flatMap((n) => [n.homeKnown ? n.home : null, n.awayKnown ? n.away : null].filter(Boolean) as string[])),
  )

  // 1) Ganador de cada llave: avanzó (aparece en la ronda siguiente) o, si finalizó, por marcador.
  present.forEach((p, i) => {
    const nextNames = knownNames[i + 1]
    for (const n of p.nodes) {
      if (nextNames && n.homeKnown && nextNames.has(n.home)) n.winner = 'home'
      else if (nextNames && n.awayKnown && nextNames.has(n.away)) n.winner = 'away'
      else if (n.status === 'finished' && n.homeScore != null && n.awayScore != null) {
        n.winner = n.homeScore > n.awayScore ? 'home' : n.homeScore < n.awayScore ? 'away' : null
      }
    }
  })

  const nodeById = new Map<string, Node>()
  present.forEach((p) => p.nodes.forEach((n) => nodeById.set(n.id, n)))

  // feeders(child) = llaves de la ronda previa cuyo ganador es uno de los equipos del child.
  const feedersOf = (node: Node, prevNodes: Node[] | undefined): Node[] => {
    if (!prevNodes) return []
    return prevNodes.filter((p) => {
      const w = winnerName(p)
      return !!w && ((node.homeKnown && node.home === w) || (node.awayKnown && node.away === w))
    })
  }

  // 2) Orden de cada ronda por "cadena de ancestros" (hacia la final) para que los hermanos
  // queden adyacentes y los conectores no se crucen. Subimos siguiendo al ganador.
  const roundIndex = new Map<Round, number>(present.map((p, i) => [p.round, i]))
  const chainKey = (node: Node): string => {
    const parts: string[] = []
    let cur: Node | undefined = node
    const seen = new Set<string>()
    while (cur && !seen.has(cur.id)) {
      seen.add(cur.id)
      const w = winnerName(cur)
      const ci = roundIndex.get(cur.round)
      if (!w || ci == null || ci + 1 >= present.length) break
      const parent = present[ci + 1].nodes.find(
        (n) => (n.homeKnown && n.home === w) || (n.awayKnown && n.away === w),
      )
      if (!parent) break
      parts.push(`${parent.date}#${parent.id}`)
      cur = parent
    }
    parts.reverse()
    return `${parts.join('>')}|${node.date}#${node.id}`
  }
  for (const p of present) {
    p.nodes.sort((a, b) => (chainKey(a) < chainKey(b) ? -1 : chainKey(a) > chainKey(b) ? 1 : 0))
  }

  // 3) Aristas (conectores) child→feeder para cada ronda ≥ 1.
  const edges: Array<[string, string]> = []
  for (let i = 1; i < present.length; i++) {
    for (const node of present[i].nodes) {
      for (const f of feedersOf(node, present[i - 1].nodes)) edges.push([node.id, f.id])
    }
  }

  // Campeón: ganador de la Final.
  let champion: BracketData['champion'] = null
  if (finalMatch) {
    const fn = nodeById.get(finalMatch.id)
    const w = fn ? winnerName(fn) : null
    if (fn && w) champion = { name: w, flag: fn.winner === 'home' ? fn.homeFlag : fn.awayFlag }
  }

  // 3er puesto: winner por marcador (no tiene ronda siguiente).
  let third: Node | null = null
  if (thirdMatch) {
    third = toNode(thirdMatch)
    if (third.status === 'finished' && third.homeScore != null && third.awayScore != null) {
      third.winner = third.homeScore > third.awayScore ? 'home' : third.homeScore < third.awayScore ? 'away' : null
    }
  }

  return {
    rounds: present.map((p) => ({ round: p.round, nodes: p.nodes })),
    third,
    champion,
    edges,
    leafCount: present[0].nodes.length,
    hasKnown: present.some((p) => p.nodes.some((n) => n.homeKnown || n.awayKnown)),
  }
}

function TeamRow({ n, side }: { n: Node; side: 'home' | 'away' }) {
  const known = side === 'home' ? n.homeKnown : n.awayKnown
  const name = side === 'home' ? n.home : n.away
  const flag = side === 'home' ? n.homeFlag : n.awayFlag
  const realScore = side === 'home' ? n.homeScore : n.awayScore
  const regScore = side === 'home' ? n.homeReg : n.awayReg
  // En penales, mostramos el resultado de los 90' y la tanda entre paréntesis (ej. 1 (3)).
  const mainScore = n.pens ? (regScore ?? realScore) : realScore
  const penScore = n.pens ? realScore : null
  const isWinner = n.winner === side
  const isLoser = n.winner != null && n.winner !== side
  const showScore = n.status !== 'scheduled' && known
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '0 8px',
        height: ROW,
        borderTop: side === 'away' ? '1px solid var(--border)' : 'none',
        boxShadow: isWinner ? 'inset 3px 0 0 var(--accent)' : 'none',
        background: isWinner ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'transparent',
        opacity: isLoser ? 0.5 : 1,
      }}
    >
      {flag ? (
        <img src={flagUrl(flag)} alt="" style={{ width: 18, height: 13, objectFit: 'cover', borderRadius: 2, flex: '0 0 auto' }} />
      ) : (
        <span style={{ width: 18, height: 13, borderRadius: 2, flex: '0 0 auto', background: 'color-mix(in srgb, var(--text-muted) 18%, transparent)' }} />
      )}
      <span
        style={{
          flex: '1 1 auto',
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: 12.5,
          fontWeight: isWinner ? 800 : 700,
          fontStyle: known ? 'normal' : 'italic',
          color: known ? 'var(--text-primary)' : 'var(--text-muted)',
        }}
      >
        {name}
      </span>
      <span
        style={{
          flex: '0 0 auto',
          minWidth: 12,
          textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
          fontSize: 13,
          fontWeight: 900,
          color: isWinner ? 'var(--accent)' : 'var(--text-primary)',
        }}
      >
        {showScore ? (mainScore ?? 0) : ''}
        {showScore && penScore != null && (
          <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginLeft: 2 }}>({penScore})</span>
        )}
      </span>
    </div>
  )
}

function MatchBox({
  n,
  liveLabel,
  registerRef,
}: {
  n: Node
  liveLabel: string
  registerRef: (id: string, el: HTMLDivElement | null) => void
}) {
  const d = new Date(n.date)
  const meta =
    n.status === 'live' ? (
      <span style={{ color: 'var(--live)', fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <span className="live-dot" aria-hidden />
        {n.minute ? `${n.minute}'` : liveLabel}
      </span>
    ) : n.status === 'scheduled' && (n.homeKnown || n.awayKnown) ? (
      <span>
        {String(d.getDate()).padStart(2, '0')}/{String(d.getMonth() + 1).padStart(2, '0')} · {String(d.getHours()).padStart(2, '0')}:
        {String(d.getMinutes()).padStart(2, '0')}
      </span>
    ) : null

  return (
    <div
      ref={(el) => registerRef(n.id, el)}
      style={{
        border: '1px solid var(--border)',
        borderRadius: 10,
        overflow: 'hidden',
        background: 'var(--bg-section-header)',
        boxShadow: '0 1px 2px color-mix(in srgb, var(--text-primary) 8%, transparent)',
      }}
    >
      {meta && (
        <div style={{ padding: '3px 8px 0', fontSize: 9.5, fontWeight: 800, letterSpacing: 0.2, color: 'var(--text-muted)', textAlign: 'center' }}>
          {meta}
        </div>
      )}
      <TeamRow n={n} side="home" />
      <TeamRow n={n} side="away" />
    </div>
  )
}

export default function BracketView({ matches }: { matches: Match[] }) {
  const t = useDictionary()
  const phaseLabels = t.nav.phases as Record<string, string>
  const fx = (t as { fixture: { thirdPlace: string; champion: string; bracketEmpty: string } }).fixture
  const liveLabel = (t as { matches: { live: string } }).matches.live

  const data = useMemo(() => build(matches), [matches])

  const scrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const registerRef = (id: string, el: HTMLDivElement | null) => {
    cardRefs.current[id] = el
  }

  const [path, setPath] = useState('')
  const [size, setSize] = useState({ w: 0, h: 0 })

  const contentHeight = Math.max(data.leafCount, 1) * SLOT + 8

  // Conectores: se calculan midiendo la posición real de cada card en el DOM. Así el dibujo
  // es correcto sea cual sea el orden/tamaño, y se recalcula ante resize.
  useLayoutEffect(() => {
    const content = contentRef.current
    if (!content) return
    const draw = () => {
      const cr = content.getBoundingClientRect()
      const w = content.offsetWidth
      const h = content.offsetHeight
      setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }))
      const anchor = (id: string, side: 'left' | 'right') => {
        const el = cardRefs.current[id]
        if (!el) return null
        const r = el.getBoundingClientRect()
        return { x: (side === 'right' ? r.right : r.left) - cr.left, y: r.top + r.height / 2 - cr.top }
      }
      let d = ''
      for (const [childId, feederId] of data.edges) {
        const c = anchor(childId, 'left')
        const p = anchor(feederId, 'right')
        if (!c || !p) continue
        const mx = (p.x + c.x) / 2
        d += `M${p.x} ${p.y}H${mx}M${mx} ${p.y}V${c.y}M${mx} ${c.y}H${c.x}`
      }
      setPath((prev) => (prev === d ? prev : d))
    }
    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(content)
    window.addEventListener('resize', draw)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', draw)
    }
  }, [data])

  // Al abrir, centrar el scroll en la primera ronda que todavía no terminó (lo "vigente").
  useEffect(() => {
    const scroll = scrollRef.current
    if (!scroll || data.rounds.length === 0) return
    let idx = data.rounds.findIndex((r) => r.nodes.some((n) => n.status !== 'finished'))
    if (idx < 0) idx = data.rounds.length - 1
    scroll.scrollLeft = Math.max(0, idx * (COL_W + COL_GAP) - 12)
  }, [data])

  if (data.rounds.length === 0 || !data.hasKnown) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontSize: 14 }}>
        {fx.bracketEmpty}
      </div>
    )
  }

  const colHead: React.CSSProperties = {
    height: 26,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
  }

  return (
    <div
      ref={scrollRef}
      className="chips-row"
      style={{ overflowX: 'auto', overflowY: 'hidden', padding: '2px 4px 12px', WebkitOverflowScrolling: 'touch' }}
    >
      <div ref={contentRef} style={{ position: 'relative', display: 'flex', gap: COL_GAP, height: contentHeight + 26, minWidth: 'min-content' }}>
        <svg
          width={size.w}
          height={size.h}
          viewBox={`0 0 ${size.w} ${size.h}`}
          style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', zIndex: 0 }}
          aria-hidden
        >
          <path d={path} fill="none" stroke="var(--border)" strokeWidth={1.5} />
        </svg>

        {data.rounds.map((r, ri) => (
          <div key={r.round} style={{ flex: `0 0 ${COL_W}px`, width: COL_W, display: 'flex', flexDirection: 'column', zIndex: 1 }}>
            <div style={colHead}>{phaseLabels[r.round] ?? r.round.toUpperCase()}</div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: 6 }}>
              {/* Campeón: encima de la Final (última ronda) si ya se definió */}
              {ri === data.rounds.length - 1 && data.champion && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    margin: '0 auto 2px',
                    padding: '5px 12px',
                    borderRadius: 999,
                    background: 'linear-gradient(180deg, color-mix(in srgb, #f2c766 26%, transparent), color-mix(in srgb, #f2c766 12%, transparent))',
                    border: '1px solid color-mix(in srgb, #f2c766 55%, transparent)',
                    fontSize: 12,
                    fontWeight: 900,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span aria-hidden>🏆</span>
                  {data.champion.flag && (
                    <img src={flagUrl(data.champion.flag)} alt="" style={{ width: 18, height: 13, objectFit: 'cover', borderRadius: 2 }} />
                  )}
                  {data.champion.name}
                </div>
              )}
              {r.nodes.map((n) => (
                <MatchBox key={n.id} n={n} liveLabel={liveLabel} registerRef={registerRef} />
              ))}
            </div>
          </div>
        ))}

        {/* 3er puesto: columna aparte, sin conectores */}
        {data.third && (
          <div style={{ flex: `0 0 ${COL_W}px`, width: COL_W, display: 'flex', flexDirection: 'column', zIndex: 1 }}>
            <div style={colHead}>🥉 {fx.thirdPlace}</div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <MatchBox n={data.third} liveLabel={liveLabel} registerRef={registerRef} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
