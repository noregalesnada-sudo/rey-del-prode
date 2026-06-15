import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { connection } from 'next/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Trophy } from 'lucide-react'
import { hasLocale } from '@/app/[lang]/dictionaries'
import { translateTeam } from '@/lib/team-names'
import PredictAllProdes, { type AllProdesMatch } from '@/components/matches/PredictAllProdes'
import { effectivePick, type Pick } from '@/lib/effective-pick'

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const minutesUntil = (dateStr: string) => (new Date(dateStr).getTime() - Date.now()) / 60000

// "Pronosticar": enruta al lugar correcto según cuántos prodes tenés.
//  0 → al hub (crear/unirse) · 1 → directo a sus partidos · varios → selector de prode.
export default async function CargarPage({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ m?: string }> }) {
  const { lang } = await params
  const { m: matchId } = await searchParams
  const matchHash = matchId ? `#m-${matchId}` : ''
  if (!hasLocale(lang)) notFound()

  await connection()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${lang}/login`)

  const { data: rows } = await supabase
    .from('prode_members')
    .select('spectator, prodes(id, slug, name)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('joined_at', { ascending: true })

  const prodesRaw = (rows ?? [])
    .map((m: { spectator: boolean | null; prodes: { id: string; slug: string; name: string } | { id: string; slug: string; name: string }[] | null }) => {
      const p = Array.isArray(m.prodes) ? m.prodes[0] : m.prodes
      return p ? { id: p.id, slug: p.slug, name: p.name, spectator: !!m.spectator } : null
    })
    .filter(Boolean) as { id: string; slug: string; name: string; spectator: boolean }[]

  if (prodesRaw.length === 0) redirect(`/${lang}/prodes`)
  if (prodesRaw.length === 1) redirect(`/${lang}/prode/${prodesRaw[0].slug}?tab=partidos${matchHash}`)

  // Varios → selector con el nombre y color de cada prode (enterprise incluido).
  const prodeIds = prodesRaw.map((p) => p.id)
  // Para el pick efectivo del prefill: solo prodes donde JUGÁS (no espectador), igual que el
  // fixture y donde escribe savePickAllProdes.
  const playProdeIds = prodesRaw.filter((p) => !p.spectator).map((p) => p.id)
  const { data: companies } = prodeIds.length > 0
    ? await adminClient.from('companies').select('prode_id, prode_name, primary_color').in('prode_id', prodeIds)
    : { data: [] as { prode_id: string; prode_name: string | null; primary_color: string | null }[] }
  const companyMap = new Map(
    (companies ?? []).map((c: { prode_id: string; prode_name: string | null; primary_color: string | null }) => [c.prode_id, c])
  )
  const prodes = prodesRaw.map((p) => {
    const co = companyMap.get(p.id)
    return { slug: p.slug, name: co?.prode_name || p.name, color: co?.primary_color ?? undefined }
  })

  const en = lang === 'en'
  const lp = (p: string) => `/${lang}${p}`

  // Si llegaste tocando un partido (?m=) y todavía se puede editar, ofrecemos cargarlo en
  // TODOS tus prodes de una (pisa lo que tengas en cada uno). Sin `m` (entraste por el +),
  // no hay partido único → solo el selector.
  let allMatch: AllProdesMatch | null = null
  let allInitial: Pick | undefined
  if (matchId) {
    // Prefill = pick EFECTIVO (mismo criterio que el fixture), no el default_picks crudo: si todos
    // tus prodes donde jugás coinciden en un override mostramos ese; si no, el default.
    const [{ data: mrow }, { data: overrides }, { data: dp }] = await Promise.all([
      supabase.from('matches').select('id, home_team, away_team, home_flag, away_flag, match_date, status').eq('id', matchId).single(),
      playProdeIds.length > 0
        ? supabase.from('picks').select('prode_id, home_pick, away_pick').eq('user_id', user.id).eq('match_id', matchId).in('prode_id', playProdeIds)
        : Promise.resolve({ data: [] as { prode_id: string; home_pick: number; away_pick: number }[] }),
      supabase.from('default_picks').select('home_pick, away_pick').eq('user_id', user.id).eq('match_id', matchId).maybeSingle(),
    ])
    const editable = mrow && mrow.status === 'scheduled' && mrow.home_team && mrow.away_team &&
      minutesUntil(mrow.match_date as string) >= 15
    if (editable) {
      allMatch = {
        id: mrow!.id as string,
        homeTeam: translateTeam(mrow!.home_team as string, lang),
        awayTeam: translateTeam(mrow!.away_team as string, lang),
        homeFlag: (mrow!.home_flag as string | null) ?? undefined,
        awayFlag: (mrow!.away_flag as string | null) ?? undefined,
        matchDate: mrow!.match_date as string,
      }
      const overrideMap = new Map<string, Pick>(
        (overrides ?? []).map((o) => [o.prode_id, { home: o.home_pick, away: o.away_pick }])
      )
      allInitial = effectivePick(playProdeIds, overrideMap, dp ? { home: dp.home_pick, away: dp.away_pick } : undefined)
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>
        {en ? 'Where do you want to predict?' : '¿En qué prode querés pronosticar?'}
      </h1>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
        {en ? 'Pick a pool to load your predictions there.' : 'Elegí un prode para cargar tus pronósticos ahí.'}
      </p>

      {allMatch && (
        <>
          <PredictAllProdes match={allMatch} prodeCount={prodes.length} initialHome={allInitial?.home} initialAway={allInitial?.away} />
          <p style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--text-muted)', margin: '0 0 12px' }}>
            {en ? 'Or load it into a single pool:' : 'O cargalo en un solo prode:'}
          </p>
        </>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {prodes.map((p) => {
          const c = p.color
          return (
            <Link
              key={p.slug}
              href={lp(`/prode/${p.slug}?tab=partidos${matchHash}`)}
              style={{
                background: 'linear-gradient(160deg,#0e2f5e,#0b2348)', border: `1px solid ${c ? c + '88' : 'var(--border-light)'}`,
                borderRadius: 16, padding: '16px', boxShadow: c ? `0 8px 22px ${c}33` : '0 8px 22px rgba(0,0,0,.3)',
                textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <Trophy size={20} color={c ?? '#fad54a'} />
                <span style={{ fontSize: 17, fontWeight: 900 }}>{p.name}</span>
              </div>
              <span style={{ display: 'block', textAlign: 'center', background: c ? c + '22' : 'rgba(116,172,223,.14)', border: `1px solid ${c ?? 'var(--accent)'}`, color: c ?? 'var(--accent-light)', borderRadius: 11, padding: 11, fontSize: 13.5, fontWeight: 800 }}>
                {en ? 'Predict here →' : 'Pronosticar acá →'}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
