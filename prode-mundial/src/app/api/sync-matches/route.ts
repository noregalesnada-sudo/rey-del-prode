import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { revalidateTag } from 'next/cache'
import { Resend } from 'resend'
import { fetchMatches, getFlag, mapStage, mapStatus } from '@/lib/football-data'
import logger from '@/lib/logger'

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
    }
  })

  const { error, count } = await supabaseAdmin
    .from('matches')
    .upsert(rows, { onConflict: 'external_id', count: 'exact' })

  if (error) throw new Error(error.message)

  revalidateTag('matches', { expire: 0 })
  logger.info({ competition, upserted: count, total: rows.length, ms: Date.now() - t0 }, 'sync-matches ok')
  return { upserted: count, total: rows.length }
}

async function alertSyncError(errorMsg: string) {
  const emails = (process.env.SUPERADMIN_EMAILS ?? '').split(',').filter(Boolean)
  if (!emails.length) return
  await resend.emails.send({
    from: 'Rey del Prode <noreply@reydelprode.com>',
    to: emails,
    subject: '⚠️ Sync de partidos falló',
    html: `
      <p><strong>El sync automático de partidos falló.</strong></p>
      <p><strong>Error:</strong> ${errorMsg}</p>
      <p>Podés cargar los resultados manualmente en el backoffice:</p>
      <p><a href="https://reydelprode.com/admin/partidos">Admin → Partidos</a></p>
      <p style="color:#888;font-size:12px">${new Date().toISOString()}</p>
    `,
  }).catch(() => {})
}

// Vercel Cron llama GET con Authorization: Bearer CRON_SECRET
export async function GET(req: NextRequest) {
  const cronAuth = req.headers.get('authorization')
  const validCron = cronAuth === `Bearer ${process.env.CRON_SECRET}`

  if (validCron) {
    const competition = req.nextUrl.searchParams.get('competition') ?? 'WC'
    try {
      const result = await runSync(competition)
      return NextResponse.json({ success: true, ...result })
    } catch (err) {
      const msg = String(err)
      logger.error({ competition, err: msg }, 'sync-matches failed')
      await alertSyncError(msg)
      return NextResponse.json({ error: msg }, { status: 500 })
    }
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

  return NextResponse.json({ matches_in_db: count })
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

  const competition = req.nextUrl.searchParams.get('competition') ?? 'WC'
  try {
    const result = await runSync(competition)
    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    const msg = String(err)
    await alertSyncError(msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
