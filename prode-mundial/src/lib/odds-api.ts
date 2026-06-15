// Cuotas de The Odds API (the-odds-api.com). Plan Starter: 500 créditos/mes.
// 1 request (regions=eu, markets=h2h) trae TODOS los partidos del Mundial y cuesta
// 1 crédito, así que cacheamos en el Data Cache de Next (revalidate) para no
// gastar de más. Devuelve el CONSENSO (promedio de todas las casas) por resultado.

const ODDS_BASE = 'https://api.the-odds-api.com/v4'
const ODDS_KEY = process.env.ODDS_API_KEY
const REVALIDATE_S = 1800 // 30 min: pre-partido casi no se mueve; en vivo es aceptable

// The Odds API y football-data nombran distinto a algunos equipos. Normalizamos
// ambos a un token canónico. Solo hacen falta 3 alias (el resto matchea solo).
const NAME_ALIASES: Record<string, string> = {
  czechrepublic: 'czechia',          // odds "Czech Republic" ↔ db "Czechia"
  bosniaandherzegovina: 'bosnia',    // odds "Bosnia & Herzegovina"
  bosniaherzegovina: 'bosnia',
  bosniah: 'bosnia',                 // db shortName "Bosnia-H."
  drcongo: 'congodr',                // odds "DR Congo" ↔ db "Congo DR"
  southkorea: 'korea',               // odds "South Korea" ↔ db "Korea Republic"
  korearepublic: 'korea',
}

function canon(name: string): string {
  const n = name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '')
  return NAME_ALIASES[n] ?? n
}

function pairKey(a: string, b: string): string {
  return [canon(a), canon(b)].sort().join('|')
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export interface MatchOdds {
  home: number
  draw: number
  away: number
}

type OddsEntry = { draw: number; byTeam: Record<string, number> }

interface RawEvent {
  home_team: string
  away_team: string
  bookmakers: Array<{ markets: Array<{ key: string; outcomes: Array<{ name: string; price: number }> }> }>
}

/**
 * Trae las cuotas del Mundial y devuelve un mapa keyed por par de equipos
 * (orden-independiente). El consumidor usa `oddsForMatch` para resolver un partido.
 */
export async function fetchWorldCupOdds(): Promise<Map<string, OddsEntry>> {
  const map = new Map<string, OddsEntry>()
  if (!ODDS_KEY) return map

  const url = `${ODDS_BASE}/sports/soccer_fifa_world_cup/odds?apiKey=${ODDS_KEY}&regions=eu&markets=h2h&oddsFormat=decimal`
  const res = await fetch(url, { next: { revalidate: REVALIDATE_S }, signal: AbortSignal.timeout(7_000) })
  if (!res.ok) throw new Error(`the-odds-api HTTP ${res.status}`)

  const events = (await res.json()) as RawEvent[]
  for (const ev of events) {
    const sums: Record<string, { total: number; n: number }> = {}
    let drawSum = 0
    let drawN = 0
    for (const bk of ev.bookmakers) {
      const market = bk.markets.find((m) => m.key === 'h2h')
      if (!market) continue
      for (const o of market.outcomes) {
        if (o.name === 'Draw') { drawSum += o.price; drawN++; continue }
        const c = canon(o.name)
        if (!sums[c]) sums[c] = { total: 0, n: 0 }
        sums[c].total += o.price
        sums[c].n++
      }
    }
    if (drawN === 0) continue
    const byTeam: Record<string, number> = {}
    for (const [c, s] of Object.entries(sums)) byTeam[c] = round2(s.total / s.n)
    map.set(pairKey(ev.home_team, ev.away_team), { draw: round2(drawSum / drawN), byTeam })
  }
  return map
}

/** Resuelve las cuotas de un partido (home/away en nombres de football-data/DB). */
export function oddsForMatch(map: Map<string, OddsEntry>, home: string, away: string): MatchOdds | null {
  const e = map.get(pairKey(home, away))
  if (!e) return null
  const h = e.byTeam[canon(home)]
  const a = e.byTeam[canon(away)]
  if (h == null || a == null) return null
  return { home: h, draw: e.draw, away: a }
}
