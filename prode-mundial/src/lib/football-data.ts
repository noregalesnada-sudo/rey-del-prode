const BASE_URL = 'https://api.football-data.org/v4'
const API_KEY = process.env.FOOTBALL_DATA_API_KEY!

// Códigos ISO 2 letras para flagcdn.com — todos los equipos del Mundial 2026
// Se incluyen aliases alternativos que usa football-data.org (TLA del API ≠ siempre ISO/FIFA)
const FLAG_MAP: Record<string, string> = {
  // América
  ARG: 'ar', BRA: 'br', URU: 'uy', URY: 'uy', UY: 'uy', COL: 'co', ECU: 'ec', PAR: 'py',
  CHL: 'cl', CHI: 'cl', PER: 'pe', BOL: 'bo', VEN: 've',
  MEX: 'mx', USA: 'us', CAN: 'ca', PAN: 'pa', CRC: 'cr', COS: 'cr',
  HND: 'hn', HON: 'hn', SLV: 'sv', ESA: 'sv', GTM: 'gt', GUA: 'gt',
  JAM: 'jm', HAI: 'ht', HAT: 'ht', TRI: 'tt', TTO: 'tt',
  CUR: 'cw', CUW: 'cw',            // Curaçao: football-data usa CUW (ISO alpha-3)
  // Europa
  ESP: 'es', FRA: 'fr', GER: 'de', DEU: 'de', POR: 'pt',
  ENG: 'gb-eng', SCO: 'gb-sct', WAL: 'gb-wls', NIR: 'gb-nir', IRL: 'ie',
  NED: 'nl', BEL: 'be', SUI: 'ch', SWI: 'ch', AUT: 'at', CRO: 'hr',
  SRB: 'rs', CZE: 'cz', POL: 'pl', SWE: 'se', NOR: 'no',
  DEN: 'dk', HUN: 'hu', SVK: 'sk', ROU: 'ro', UKR: 'ua',
  GRE: 'gr', TUR: 'tr', ALB: 'al', ITA: 'it',
  BIH: 'ba', SVN: 'si', ISL: 'is', FIN: 'fi',
  // África
  MAR: 'ma', SEN: 'sn', NGA: 'ng', GHA: 'gh', CIV: 'ci',
  CMR: 'cm', EGY: 'eg', TUN: 'tn', ALG: 'dz', RSA: 'za',
  COD: 'cd', CPV: 'cv', MLI: 'ml', ZIM: 'zw', MOZ: 'mz',
  // Asia / Oceanía
  JPN: 'jp', KOR: 'kr', IRN: 'ir', IRI: 'ir', SAU: 'sa', KSA: 'sa',
  QAT: 'qa', AUS: 'au', NZL: 'nz', CHN: 'cn', IND: 'in',
  JOR: 'jo', IRQ: 'iq', UZB: 'uz',
}

export type FDMatch = {
  id: number
  utcDate: string
  status: 'TIMED' | 'SCHEDULED' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'SUSPENDED' | 'POSTPONED' | 'CANCELLED'
  stage: string
  group: string | null
  homeTeam: { id: number; name: string; shortName: string; tla: string }
  awayTeam: { id: number; name: string; shortName: string; tla: string }
  score: {
    winner: string | null
    fullTime: { home: number | null; away: number | null }
  }
  minute?: number
}

export function getFlag(tla: string): string {
  return FLAG_MAP[tla] ?? ''
}

export function mapStage(stage: string): 'groups' | 'r32' | 'r16' | 'qf' | 'sf' | 'final' {
  if (stage === 'GROUP_STAGE') return 'groups'
  if (stage === 'ROUND_OF_32' || stage === 'LAST_32' || stage === 'ROUND_OF_36') return 'r32'
  if (stage === 'ROUND_OF_16' || stage === 'LAST_16') return 'r16'
  if (stage === 'QUARTER_FINALS') return 'qf'
  if (stage === 'SEMI_FINALS') return 'sf'
  if (stage === 'FINAL' || stage === 'THIRD_PLACE') return 'final'
  return 'groups'
}

export function mapStatus(status: string): 'scheduled' | 'live' | 'finished' {
  if (status === 'IN_PLAY' || status === 'PAUSED') return 'live'
  if (status === 'FINISHED') return 'finished'
  return 'scheduled'
}

export class FootballDataError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: string,
  ) {
    super(message)
    this.name = 'FootballDataError'
  }

  get isRateLimit() { return this.status === 429 }
  get isNotFound() { return this.status === 404 }
  get isServerError() { return this.status >= 500 }
}

export async function fetchMatches(competition: string): Promise<FDMatch[]> {
  const res = await fetch(`${BASE_URL}/competitions/${competition}/matches`, {
    headers: { 'X-Auth-Token': API_KEY },
    cache: 'no-store',
  })
  if (!res.ok) {
    let body: string | undefined
    try { body = await res.text() } catch { /* ignore */ }
    const label =
      res.status === 429 ? 'rate limit excedido' :
      res.status === 404 ? 'competición no encontrada' :
      res.status >= 500 ? 'error del servidor de football-data' :
      'error inesperado'
    throw new FootballDataError(
      res.status,
      `football-data ${label} (HTTP ${res.status})${body ? ' — ' + body.slice(0, 300) : ''}`,
      body,
    )
  }
  const data = await res.json()
  return data.matches as FDMatch[]
}

export async function fetchWCMatches(): Promise<FDMatch[]> {
  return fetchMatches('WC')
}
