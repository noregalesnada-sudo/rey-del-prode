import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { revalidateTag } from 'next/cache'
import { Resend } from 'resend'
import { fetchMatches, getFlag, mapStage, mapStatus, FootballDataError } from '@/lib/football-data'
import { calcPointsForMatch, materializeDefaultPicksForMatch } from '@/lib/scoring'
import logger from '@/lib/logger'

const DEFAULT_COMPETITIONS = (process.env.SYNC_COMPETITIONS ?? 'WC')
  .split(',').map((s) => s.trim()).filter(Boolean)

// 1 día antes del Mundial → sync cada minuto. Antes: 1 vez por hora.
const TOURNAMENT_START = new Date('2026-06-10T00:00:00Z')
const TOURNAMENT_END   = new Date('2026-07-20T00:00:00Z')

function isInTournamentWindow(now = new Date()): boolean {
  return now >= TOURNAMENT_START && now < TOURNAMENT_END
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

async function runSync(competition: string): Promise<{ upserted: number | null; total: number }> {
  const t0 = Date.now()
  const matches = await fetchMatches(competition)

  const rows = matches.map((m) => {
    const hasBothTeams = m.homeTeam?.name && m.awayTeam?.name
    const isThirdPlace = m.stage === 'THIRD_PLACE'
    return {
      external_id: String(m.id),
      home_team: hasBothTeams ? (m.homeTeam.shortName || m.homeTeam.name) : null,
      away_team: hasBothTeams ? (m.awayTeam.shortName || m.awayTeam.name) : null,
      home_flag: hasBothTeams ? getFlag(m.homeTeam.tla) : null,
      away_flag: hasBothTeams ? getFlag(m.awayTeam.tla) : null,
      match_date: m.utcDate,
      phase: mapStage(m.stage),
      group_name: m.group ? m.group.replace('GROUP_', '') : null,
      is_third_place: isThirdPlace,
      status: mapStatus(m.status),
      home_score: m.score.fullTime.home,
      away_score: m.score.fullTime.away,
      competition_code: competition,
    }
  })

  const { error, count } = await supabaseAdmin
    .from('matches')
    .upsert(rows, { onConflict: 'external_id', count: 'exact' })

  if (error) throw new Error(error.message)

  revalidateTag('matches', { expire: 0 } as Parameters<typeof revalidateTag>[1])
  logger.info({ competition, upserted: count, total: rows.length, ms: Date.now() - t0 }, 'sync-matches ok')
  return { upserted: count, total: rows.length }
}

async function alertSyncError(errorMsg: string, competition: string, err?: unknown) {
  const emails = (process.env.SUPERADMIN_EMAILS ?? '').split(',').filter(Boolean)
  if (!emails.length) return

  let errorType = 'Error desconocido'
  let hint = ''
  if (err instanceof FootballDataError) {
    if (err.isRateLimit) {
      errorType = 'Rate limit excedido (HTTP 429)'
      hint = '<p>Se superó el límite de requests por minuto del plan. No requiere acción, el próximo sync debería recuperarse.</p>'
    } else if (err.isNotFound) {
      errorType = 'Competición no encontrada (HTTP 404)'
      hint = '<p>La competición solicitada no existe o no está disponible en tu plan.</p>'
    } else if (err.isServerError) {
      errorType = `Error del servidor de football-data (HTTP ${err.status})`
      hint = '<p>El problema está del lado de football-data.org, no en la aplicación. Si persiste más de 10 minutos, revisá su status page.</p>'
    } else {
      errorType = `Error HTTP ${err.status}`
    }
  }

  await resend.emails.send({
    from: 'Rey del Prode <noreply@reydelprode.com>',
    to: emails,
    subject: `⚠️ Sync falló [${competition}]: ${errorType}`,
    html: `
      <p><strong>El sync automático de partidos falló.</strong></p>
      <p><strong>Competencia:</strong> ${competition}</p>
      <p><strong>Tipo:</strong> ${errorType}</p>
      <p><strong>Detalle:</strong> ${errorMsg}</p>
      ${hint}
      <p>Podés cargar los resultados manualmente en el backoffice:</p>
      <p><a href="https://reydelprode.com/admin/partidos">Admin → Partidos</a></p>
      <p style="color:#888;font-size:12px">${new Date().toISOString()}</p>
    `,
  }).catch(() => {})
}

async function syncAll(competitions: string[], alertOnError = false) {
  const results: Array<{ competition: string; upserted?: number | null; total?: number; error?: string }> = []
  for (const competition of competitions) {
    try {
      const result = await runSync(competition)
      results.push({ competition, ...result })
    } catch (err) {
      const msg = String(err)
      logger.error({ competition, err: msg }, 'sync-matches failed')
      if (alertOnError) await alertSyncError(msg, competition, err)
      results.push({ competition, error: msg })
    }
  }

  // Calcular puntos para partidos en vivo o finalizados con score disponible
  const { data: activeMatches } = await supabaseAdmin
    .from('matches')
    .select('id')
    .in('status', ['live', 'finished'])
    .not('home_score', 'is', null)
    .not('away_score', 'is', null)

  if (activeMatches && activeMatches.length > 0) {
    // Red de seguridad: completar con Mis Pronósticos a quien no cargó, ANTES de puntuar
    await Promise.allSettled(activeMatches.map((m) => materializeDefaultPicksForMatch(m.id)))
    await Promise.allSettled(activeMatches.map((m) => calcPointsForMatch(m.id)))
    await supabaseAdmin.rpc('refresh_leaderboard_mv')
    revalidateTag('leaderboard', { expire: 0 } as Parameters<typeof revalidateTag>[1])
  }

  return results
}

// Vercel Cron llama GET con Authorization: Bearer CRON_SECRET
export async function GET(req: NextRequest) {
  const cronAuth = req.headers.get('authorization')
  const validCron = cronAuth === `Bearer ${process.env.CRON_SECRET}`

  if (validCron) {
    const now = new Date()
    const inTournament = isInTournamentWindow(now)

    // Fuera del torneo: solo una vez por hora (minuto :00)
    if (!inTournament && now.getUTCMinutes() !== 0) {
      return NextResponse.json({ skipped: true, reason: 'outside tournament window, waiting for :00' })
    }

    const competitionParam = req.nextUrl.searchParams.get('competition')
    const competitions = competitionParam ? [competitionParam] : DEFAULT_COMPETITIONS
    const results = await syncAll(competitions, inTournament)
    return NextResponse.json({ success: true, inTournament, competitions, results })
  }

  // Sin auth: endpoint de estado/debug
  const debug = req.nextUrl.searchParams.get('debug')
  const competition = req.nextUrl.searchParams.get('competition') ?? 'WC'

  if (debug === '1') {
    const matches = await fetchMatches(competition)
    const stageCounts: Record<string, number> = {}
    matches.forEach((m) => { stageCounts[m.stage] = (stageCounts[m.stage] ?? 0) + 1 })
    const firstFive = matches.slice(0, 5).map((m) => ({
      id: m.id,
      home: m.homeTeam?.name ?? null,
      away: m.awayTeam?.name ?? null,
      date: m.utcDate,
      status: m.status,
    }))
    return NextResponse.json({ competition, total: matches.length, stages: stageCounts, firstFive })
  }

  const { count } = await supabaseAdmin
    .from('matches')
    .select('*', { count: 'exact', head: true })

  return NextResponse.json({ matches_in_db: count, sync_competitions: DEFAULT_COMPETITIONS })
}

// POST para llamadas manuales (desde el backoffice o con x-sync-secret)
export async function POST(req: NextRequest) {
  const syncSecret = req.headers.get('x-sync-secret')
  const cronAuth = req.headers.get('authorization')
  const validSync = syncSecret === process.env.SYNC_SECRET
  const validCron = cronAuth === `Bearer ${process.env.CRON_SECRET}`
  if (!validSync && !validCron) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const competitionParam = req.nextUrl.searchParams.get('competition')
  const competitions = competitionParam ? [competitionParam] : DEFAULT_COMPETITIONS
  const results = await syncAll(competitions)
  return NextResponse.json({ success: true, results })
}
