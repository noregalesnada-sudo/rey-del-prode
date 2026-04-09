const BASE_URL = 'https://api.football-data.org/v4'
const API_KEY = process.env.FOOTBALL_DATA_API_KEY!

// Mapa de banderas por código de equipo — todos los equipos del Mundial 2026
const FLAG_MAP: Record<string, string> = {
  // América
  ARG: '🇦🇷', BRA: '🇧🇷', URU: '🇺🇾', COL: '🇨🇴', ECU: '🇪🇨', PAR: '🇵🇾',
  CHL: '🇨🇱', PER: '🇵🇪', BOL: '🇧🇴', VEN: '🇻🇪',
  MEX: '🇲🇽', USA: '🇺🇸', CAN: '🇨🇦', PAN: '🇵🇦', CRC: '🇨🇷',
  HND: '🇭🇳', SLV: '🇸🇻', GTM: '🇬🇹', JAM: '🇯🇲', HAI: '🇭🇹', TRI: '🇹🇹',
  CUR: '🇨🇼',
  // Europa
  ESP: '🇪🇸', FRA: '🇫🇷', GER: '🇩🇪', DEU: '🇩🇪', POR: '🇵🇹',
  ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', SCO: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', WAL: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', IRL: '🇮🇪',
  NED: '🇳🇱', BEL: '🇧🇪', SUI: '🇨🇭', AUT: '🇦🇹', CRO: '🇭🇷',
  SRB: '🇷🇸', CZE: '🇨🇿', POL: '🇵🇱', SWE: '🇸🇪', NOR: '🇳🇴',
  DEN: '🇩🇰', HUN: '🇭🇺', SVK: '🇸🇰', ROU: '🇷🇴', UKR: '🇺🇦',
  GRE: '🇬🇷', TUR: '🇹🇷', ALB: '🇦🇱', ITA: '🇮🇹',
  BIH: '🇧🇦', SVN: '🇸🇮', ISL: '🇮🇸', FIN: '🇫🇮',
  // África
  MAR: '🇲🇦', SEN: '🇸🇳', NGA: '🇳🇬', GHA: '🇬🇭', CIV: '🇨🇮',
  CMR: '🇨🇲', EGY: '🇪🇬', TUN: '🇹🇳', ALG: '🇩🇿', RSA: '🇿🇦',
  COD: '🇨🇩', CPV: '🇨🇻', MLI: '🇲🇱', ZIM: '🇿🇼', MOZ: '🇲🇿',
  // Asia
  JPN: '🇯🇵', KOR: '🇰🇷', IRN: '🇮🇷', SAU: '🇸🇦', KSA: '🇸🇦',
  QAT: '🇶🇦', AUS: '🇦🇺', NZL: '🇳🇿', CHN: '🇨🇳', IND: '🇮🇳',
  JOR: '🇯🇴', IRQ: '🇮🇶', UZB: '🇺🇿',
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
  return FLAG_MAP[tla] ?? '🏳️'
}

export function mapStage(stage: string): 'groups' | 'r16' | 'qf' | 'sf' | 'final' {
  if (stage === 'GROUP_STAGE') return 'groups'
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

export async function fetchWCMatches(): Promise<FDMatch[]> {
  const res = await fetch(`${BASE_URL}/competitions/WC/matches`, {
    headers: { 'X-Auth-Token': API_KEY },
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`football-data error: ${res.status}`)
  const data = await res.json()
  return data.matches as FDMatch[]
}
