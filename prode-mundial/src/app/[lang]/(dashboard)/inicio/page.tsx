import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { connection } from 'next/server'
import { redirect, notFound } from 'next/navigation'
import { hasLocale } from '@/app/[lang]/dictionaries'
import { translateTeam } from '@/lib/team-names'
import { getCachedLeaderboard } from '@/lib/cached-queries'
import MobileHome, { type HomeMatch } from '@/components/home/MobileHome'
import { fetchWorldCupOdds, oddsForMatch } from '@/lib/odds-api'
import { getProdePickDistributions, type PickDistribution } from '@/lib/pick-distribution'

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function InicioPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()

  await connection()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${lang}/login`)

  const [scheduledRes, liveRes, profileRes, prodesRes] = await Promise.all([
    supabase.from('matches').select('*').eq('status', 'scheduled').eq('competition_code', 'WC').order('match_date', { ascending: true }),
    supabase.from('matches').select('*').eq('status', 'live').eq('competition_code', 'WC').order('match_date', { ascending: true }),
    supabase.from('profiles').select('username').eq('id', user.id).single(),
    supabase
      .from('prode_members')
      .select('prodes(id, slug, name)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('joined_at', { ascending: true }),
  ])

  const prodesRaw = (prodesRes.data ?? [])
    .map((m: { prodes: { id: string; slug: string; name: string } | { id: string; slug: string; name: string }[] | null }) => {
      const p = Array.isArray(m.prodes) ? m.prodes[0] : m.prodes
      return p ? { id: p.id, slug: p.slug, name: p.name } : null
    })
    .filter(Boolean) as { id: string; slug: string; name: string }[]

  // El pick del héroe/próximos: si jugás 1 solo prode, el de ESE prode. Con varios no se
  // muestra valor (sería ambiguo: cada prode puede tener un pronóstico distinto).
  const singleProde = prodesRaw.length === 1 ? prodesRaw[0] : null
  let pickMap = new Map<string, { h: number; a: number }>()
  if (singleProde) {
    // Pick efectivo = override del prode ?? heredado de Mis Pronósticos (igual que adentro del prode).
    const [ownPicksRes, defaultsRes] = await Promise.all([
      supabase.from('picks').select('match_id, home_pick, away_pick').eq('user_id', user.id).eq('prode_id', singleProde.id),
      supabase.from('default_picks').select('match_id, home_pick, away_pick').eq('user_id', user.id),
    ])
    pickMap = new Map((defaultsRes.data ?? []).map((p) => [p.match_id, { h: p.home_pick, a: p.away_pick }]))
    for (const p of (ownPicksRes.data ?? [])) pickMap.set(p.match_id, { h: p.home_pick, a: p.away_pick })
  }

  // Distribución del prode (solo si jugás 1 solo prode) para partidos ya cerrados (15 min antes)
  // y no finalizados: la card EN VIVO y el "pronóstico cerrado" del próximo partido.
  let distMap = new Map<string, PickDistribution>()
  if (singleProde) {
    const lockedIds = [...(scheduledRes.data ?? []), ...(liveRes.data ?? [])]
      .filter((m) => (new Date(m.match_date as string).getTime() - Date.now()) / 60000 <= 15)
      .map((m) => m.id as string)
    distMap = await getProdePickDistributions(singleProde.id, lockedIds)
  }

  // Cuotas (consenso). Aislado y tolerante a fallos.
  let oddsMap: Awaited<ReturnType<typeof fetchWorldCupOdds>> = new Map()
  try {
    oddsMap = await fetchWorldCupOdds()
  } catch {
    oddsMap = new Map()
  }

  const toHome = (m: Record<string, unknown>): HomeMatch => {
    const pk = pickMap.get(m.id as string)
    return {
      id: m.id as string,
      homeTeam: translateTeam(m.home_team as string, lang),
      awayTeam: translateTeam(m.away_team as string, lang),
      homeFlag: (m.home_flag as string | null) ?? undefined,
      awayFlag: (m.away_flag as string | null) ?? undefined,
      matchDate: m.match_date as string,
      status: m.status as 'scheduled' | 'live' | 'finished',
      homeScore: (m.home_score as number | null) ?? undefined,
      awayScore: (m.away_score as number | null) ?? undefined,
      minute: (m.minute as number | null) ?? undefined,
      matchDuration: (m.match_duration as string | null) ?? undefined,
      group: (m.group_name as string | null) ?? undefined,
      phase: m.phase as string,
      pickHome: pk?.h,
      pickAway: pk?.a,
      odds: (m.home_team && m.away_team)
        ? oddsForMatch(oddsMap, m.home_team as string, m.away_team as string) ?? undefined
        : undefined,
      distribution: distMap.get(m.id as string),
    }
  }

  const scheduled = (scheduledRes.data ?? []).map(toHome)
  const live = (liveRes.data ?? []).map(toHome)
  const nextMatch = scheduled[0] ?? null
  const upcoming = scheduled.slice(1, 4)

  // Prodes enterprise: traemos su nombre y color propios para teñir la tarjeta.
  const prodeIds = prodesRaw.map((p) => p.id)
  const { data: companies } = prodeIds.length > 0
    ? await adminClient.from('companies').select('prode_id, prode_name, primary_color').in('prode_id', prodeIds)
    : { data: [] as { prode_id: string; prode_name: string | null; primary_color: string | null }[] }
  const companyMap = new Map(
    (companies ?? []).map((c: { prode_id: string; prode_name: string | null; primary_color: string | null }) => [c.prode_id, c])
  )

  // Posición y puntos del usuario en cada prode (para la tarjeta del home).
  const prodeStats = await Promise.all(prodesRaw.map(async (p) => {
    // El bonus de campeón ya viene sumado en total_points por la vista leaderboard.
    const lb = await getCachedLeaderboard(p.id)
    const rows = ((lb ?? []) as { user_id: string; total_points: number | null }[])
      .map((r) => ({ user_id: r.user_id, total: r.total_points ?? 0 }))
      .sort((a, b) => b.total - a.total)
    const idx = rows.findIndex((r) => r.user_id === user.id)
    return { id: p.id, position: idx >= 0 ? idx + 1 : null, points: idx >= 0 ? rows[idx].total : 0, members: rows.length }
  }))
  const statsMap = new Map(prodeStats.map((st) => [st.id, st]))

  const prodes = prodesRaw.map((p) => {
    const co = companyMap.get(p.id)
    const st = statsMap.get(p.id)
    return {
      id: p.id,
      slug: p.slug,
      name: co?.prode_name || p.name,
      color: co?.primary_color ?? undefined,
      position: st?.position ?? null,
      points: st?.points ?? 0,
      members: st?.members ?? 0,
    }
  })

  const username = profileRes.data?.username ?? user.email?.split('@')[0] ?? ''

  return (
    <MobileHome
      username={username}
      lang={lang}
      nextMatch={nextMatch}
      upcoming={upcoming}
      live={live}
      prodes={prodes}
    />
  )
}
