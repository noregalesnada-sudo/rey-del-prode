'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Minus, ChevronRight, Trophy } from 'lucide-react'
import { savePick } from '@/lib/actions/picks'
import { type MatchOdds } from '@/lib/odds-api'
import { type PickDistribution } from '@/lib/pick-distribution'
import PickDistributionBar from '@/components/matches/PickDistributionBar'

// Cuotas ocultas por feedback (2026-06-15). Poner en true para reactivar; el fetch sigue activo.
const ODDS_ENABLED = false

export interface HomeMatch {
  id: string
  homeTeam: string
  awayTeam: string
  homeFlag?: string
  awayFlag?: string
  matchDate: string
  status: 'scheduled' | 'live' | 'finished'
  homeScore?: number
  awayScore?: number
  minute?: number
  group?: string
  phase: string
  pickHome?: number
  pickAway?: number
  odds?: MatchOdds
  distribution?: PickDistribution
}

interface MobileHomeProps {
  username: string
  lang: string
  nextMatch: HomeMatch | null
  upcoming: HomeMatch[]
  live: HomeMatch[]
  prodes: { id: string; slug: string; name: string; color?: string; position?: number | null; points?: number; members?: number }[]
}

interface Strings {
  hello: string; champ: string; pendingOne: string; pendingMany: string
  nextMatch: string; seeFixture: string; comingUp: string; all: string; live: string
  yourProde: string; yourProdes: string; predict: string; predicted: string; saving: string
  sourceNone: string; sourceOne: (n: string) => string; sourceMany: (n: number) => string
  seeTable: string; noUpcoming: string; createOrJoin: string; joinOther: [string, string]
  closesIn: string; kickedOff: string; liveShort: string; locale: string
  of: string; players: string; pts: string; closed: string
  distTitle: string; distLocal: string; distDraw: string; distAway: string
}

const STR: Record<'es' | 'en', Strings> = {
  es: {
    hello: 'Hola,', champ: 'crack', pendingOne: 'partido por jugar', pendingMany: 'partidos por jugar',
    nextMatch: '⚽ Próximo partido', seeFixture: 'Ver fixture →', comingUp: '📅 Después juegan', all: 'Todos →', live: 'En vivo',
    yourProde: '🏆 Tu prode', yourProdes: '🏆 Tus prodes', predict: 'Pronosticar', predicted: '✓ Pronosticado · Modificar', saving: 'Guardando…',
    sourceNone: 'Creá tu prode para competir con amigos',
    sourceOne: (n) => `Pronóstico para ${n}`,
    sourceMany: (n) => `Elegí en cuál de tus ${n} prodes pronosticar`,
    seeTable: 'Ver tabla y pronósticos →', noUpcoming: 'No hay próximos partidos por ahora.',
    createOrJoin: 'Creá o unite a un prode', joinOther: ['Unirme o crear', 'otro prode'],
    closesIn: 'cierra en', kickedOff: '¡Arrancó!', liveShort: 'EN VIVO', locale: 'es-AR',
    of: 'de', players: 'jugadores', pts: 'pts', closed: 'Cerrado',
    distTitle: 'Qué eligió el prode', distLocal: 'Local', distDraw: 'Empate', distAway: 'Visita',
  },
  en: {
    hello: 'Hi,', champ: 'champ', pendingOne: 'match to play', pendingMany: 'matches to play',
    nextMatch: '⚽ Next match', seeFixture: 'See fixture →', comingUp: '📅 Coming up', all: 'All →', live: 'Live',
    yourProde: '🏆 Your pool', yourProdes: '🏆 Your pools', predict: 'Predict', predicted: '✓ Predicted · Edit', saving: 'Saving…',
    sourceNone: 'Create your pool to play with friends',
    sourceOne: (n) => `Prediction for ${n}`,
    sourceMany: (n) => `Choose which of your ${n} pools to predict in`,
    seeTable: 'See table & picks →', noUpcoming: 'No upcoming matches right now.',
    createOrJoin: 'Create or join a pool', joinOther: ['Join or create', 'another pool'],
    closesIn: 'closes in', kickedOff: 'Kicked off!', liveShort: 'LIVE', locale: 'en-US',
    of: 'of', players: 'players', pts: 'pts', closed: 'Closed',
    distTitle: 'What the pool picked', distLocal: 'Home', distDraw: 'Draw', distAway: 'Away',
  },
}

const flag = (code?: string, size = 'w40') => (code ? `https://flagcdn.com/${size}/${code}.png` : undefined)

const pickClass = (h?: number, a?: number): 'home' | 'draw' | 'away' | null =>
  h !== undefined && a !== undefined ? (h > a ? 'home' : h < a ? 'away' : 'draw') : null

const distLabels = (s: Strings) => ({ title: s.distTitle, home: s.distLocal, draw: s.distDraw, away: s.distAway, players: s.players })

function useCountdown(target: string, closesIn: string, closedLabel: string): { text: string; closed: boolean } {
  const [state, setState] = useState<{ text: string; closed: boolean }>({ text: '', closed: false })
  useEffect(() => {
    // El pronóstico cierra 15 min antes del partido (no al arrancar).
    const deadline = new Date(target).getTime() - 15 * 60 * 1000
    const tick = () => {
      const ms = deadline - Date.now()
      if (ms <= 0) { setState({ text: closedLabel, closed: true }); return }
      const s = Math.floor(ms / 1000)
      const h = String(Math.floor(s / 3600)).padStart(2, '0')
      const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
      const sec = String(s % 60).padStart(2, '0')
      setState({ text: `${closesIn} ${h}:${m}:${sec}`, closed: false })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [target, closesIn, closedLabel])
  return state
}

export default function MobileHome({ username, lang, nextMatch, upcoming, live, prodes }: MobileHomeProps) {
  const s = STR[lang === 'en' ? 'en' : 'es']
  const lp = (p: string) => `/${lang}${p}`
  const sourceHint =
    prodes.length === 0 ? s.sourceNone
    : prodes.length === 1 ? s.sourceOne(prodes[0].name)
    : s.sourceMany(prodes.length)
  const singleProdeId = prodes.length === 1 ? prodes[0].id : null

  const pendingCount = (nextMatch && nextMatch.pickHome === undefined ? 1 : 0) +
    upcoming.filter((m) => m.pickHome === undefined).length

  return (
    <div className="home-grid">
      <div className="home-col">
      <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '2px 2px 14px' }}>
        {s.hello} <b style={{ color: 'var(--text-primary)' }}>{username || s.champ}</b> 👑
        {pendingCount > 0 && <> · <b style={{ color: 'var(--text-primary)' }}>{pendingCount} {pendingCount === 1 ? s.pendingOne : s.pendingMany}</b></>}
      </p>

      <SectionTitle title={s.nextMatch} href={lp('/fixture')} cta={s.seeFixture} />
      {nextMatch
        ? <HeroMatch match={nextMatch} hint={sourceHint} s={s} prodeId={singleProdeId} cargarHref={lp(`/cargar?m=${nextMatch.id}`)} />
        : <EmptyCard text={s.noUpcoming} />}

      {upcoming.length > 0 && (
        <>
          <SectionTitle title={s.comingUp} href={lp('/fixture')} cta={s.all} />
          {upcoming.map((m) => <MiniMatch key={m.id} match={m} href={prodes.length === 1 ? lp(`/prode/${prodes[0].slug}?tab=partidos#m-${m.id}`) : lp(`/cargar?m=${m.id}`)} locale={s.locale} />)}
        </>
      )}
      </div>

      <div className="home-col">
      {live.length > 0 && (
        <>
          <SectionTitle title={s.live} live />
          {live.map((m) => <LiveMatch key={m.id} match={m} liveShort={s.liveShort} s={s} />)}
        </>
      )}

      <SectionTitle title={prodes.length === 1 ? s.yourProde : s.yourProdes} />
      {prodes.length === 0
        ? <Link href={lp('/crear-prode')} style={{ ...joinCardStyle, textDecoration: 'none' }}>
            <span style={{ fontSize: 26 }}>＋</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>{s.createOrJoin}</span>
          </Link>
        : <div className="prode-rail" style={{ display: 'flex', gap: 12, overflowX: 'auto', margin: '0 -2px', padding: '2px 2px 6px', scrollSnapType: 'x mandatory' }}>
            {prodes.map((p) => <ProdeCard key={p.slug} prode={p} solo={prodes.length === 1} href={lp(`/prode/${p.slug}`)} s={s} />)}
            {prodes.length > 1 && (
              <Link href={lp('/crear-prode')} style={{ ...joinCardStyle, flex: '0 0 60%', scrollSnapAlign: 'start', textDecoration: 'none' }}>
                <span style={{ fontSize: 26 }}>＋</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center' }}>{s.joinOther[0]}<br />{s.joinOther[1]}</span>
              </Link>
            )}
          </div>}
      </div>
    </div>
  )
}

/* ── Subcomponentes ── */

function SectionTitle({ title, href, cta, live }: { title: string; href?: string; cta?: string; live?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '22px 4px 10px' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--accent)' }}>
        {live && <span className="live-dot" aria-hidden />}
        {title}
      </h2>
      {href && cta && <Link href={href} style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textDecoration: 'none' }}>{cta}</Link>}
    </div>
  )
}

function HeroMatch({ match, hint, s, prodeId, cargarHref }: { match: HomeMatch; hint: string; s: Strings; prodeId: string | null; cargarHref: string }) {
  const [home, setHome] = useState<number | null>(match.pickHome ?? null)
  const [away, setAway] = useState<number | null>(match.pickAway ?? null)
  const [saved, setSaved] = useState(match.pickHome !== undefined)
  const [saving, setSaving] = useState(false)
  const { text: countdown, closed } = useCountdown(match.matchDate, s.closesIn, s.closed)

  async function save() {
    if (!prodeId) return
    setSaving(true)
    const h = home ?? 0, a = away ?? 0
    setHome(h); setAway(a)
    const res = await savePick(match.id, prodeId, h, a)
    setSaving(false)
    if (!('error' in res)) setSaved(true)
  }

  const goldBtn: React.CSSProperties = { display: 'block', width: '100%', textAlign: 'center', border: 0, borderRadius: 14, padding: 16, fontSize: 16, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.4px', background: 'linear-gradient(135deg,#fad54a,#c9a010)', color: '#3a2c00', boxShadow: '0 8px 22px rgba(245,197,24,.28)', textDecoration: 'none' }
  const closedBtn: React.CSSProperties = { display: 'block', width: '100%', textAlign: 'center', border: '1px solid var(--border-light)', borderRadius: 14, padding: 15, fontSize: 15, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.4px', background: 'rgba(255,255,255,.05)', color: 'var(--text-muted)' }

  return (
    <div style={{ background: 'linear-gradient(160deg,#143d77,#0c2950)', border: '1px solid var(--border-light)', borderRadius: 18, padding: '16px 14px 14px', boxShadow: '0 10px 30px rgba(0,0,0,.35)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(245,197,24,.14)', color: '#fad54a', border: '1px solid rgba(245,197,24,.35)', borderRadius: 999, padding: '5px 10px', fontSize: 11, fontWeight: 800, letterSpacing: '.6px', textTransform: 'uppercase' }}>
          {match.group ? `${s.locale === 'en-US' ? 'Group' : 'Grupo'} ${match.group}` : match.phase}
        </span>
        <span style={{ fontSize: 13, fontWeight: 800, color: '#a8d4f5', fontVariantNumeric: 'tabular-nums' }}>{countdown}</span>
      </div>

      {prodeId ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'start', gap: 10, margin: '10px auto 16px', maxWidth: 360 }}>
            <TeamStepper team={match.homeTeam} flagCode={match.homeFlag} value={home} onBump={(d) => { if (closed) return; setHome((v) => Math.max(0, (v ?? 0) + d)); setSaved(false) }} />
            <TeamStepper team={match.awayTeam} flagCode={match.awayFlag} value={away} onBump={(d) => { if (closed) return; setAway((v) => Math.max(0, (v ?? 0) + d)); setSaved(false) }} />
          </div>
          <div style={{ maxWidth: 380, margin: '0 auto' }}>
            <button
              onClick={save}
              disabled={saving || closed}
              style={closed
                ? closedBtn
                : saved
                ? { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', border: '1.5px solid #27ae60', borderRadius: 14, padding: 15, fontSize: 16, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.4px', background: 'rgba(39,174,96,.16)', color: '#7ee0a3' }
                : goldBtn}
            >
              {closed ? s.closed : saving ? s.saving : saved ? s.predicted : s.predict}
            </button>
            <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--text-muted)', marginTop: 9 }}>{hint}</p>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '10px auto 16px', maxWidth: 360 }}>
            {[{ team: match.homeTeam, fc: match.homeFlag }, { team: match.awayTeam, fc: match.awayFlag }].map((tm, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9 }}>
                {tm.fc && <img src={flag(tm.fc, 'w80')} alt={tm.team} style={{ width: 50, height: 38, objectFit: 'cover', borderRadius: 5, boxShadow: '0 3px 8px rgba(0,0,0,.4)' }} />}
                <span style={{ fontSize: 15, fontWeight: 800, textAlign: 'center', lineHeight: 1.15 }}>{tm.team}</span>
              </div>
            ))}
          </div>
          <div style={{ maxWidth: 380, margin: '0 auto' }}>
            {closed
              ? <div style={closedBtn}>{s.closed}</div>
              : <Link href={cargarHref} style={goldBtn}>{s.predict}</Link>}
            <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--text-muted)', marginTop: 9 }}>{hint}</p>
          </div>
        </>
      )}

      {/* Qué eligió el prode — dentro de la card, separado por un divisor sutil */}
      {match.distribution && (
        <div style={{ maxWidth: 380, margin: '14px auto 0', paddingTop: 14, borderTop: '1px solid rgba(255,255,255,.10)' }}>
          <PickDistributionBar dist={match.distribution} userPick={pickClass(match.pickHome, match.pickAway)} labels={distLabels(s)} />
        </div>
      )}

      {/* Cuotas ocultas por feedback (2026-06-15). Poner ODDS_ENABLED en true para reactivar. */}
      {ODDS_ENABLED && match.odds && (
        <div style={{ maxWidth: 380, margin: '14px auto 0' }}>
          <div style={{ textAlign: 'center', fontSize: 9.5, fontWeight: 800, letterSpacing: 0.8, color: '#9fc0e8', textTransform: 'uppercase', marginBottom: 6 }}>
            {s.locale === 'en-US' ? 'Odds (avg)' : 'Cuotas (prom.)'}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {([[s.locale === 'en-US' ? 'Home' : 'Local', match.odds.home], [s.locale === 'en-US' ? 'Draw' : 'Empate', match.odds.draw], [s.locale === 'en-US' ? 'Away' : 'Visita', match.odds.away]] as [string, number][]).map(([lab, val], i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '8px 4px', borderRadius: 10, border: '1px solid var(--border-light)', background: 'rgba(255,255,255,.04)' }}>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: '#9fc0e8', textTransform: 'uppercase', letterSpacing: 0.3 }}>{lab}</span>
                <span style={{ fontSize: 16, fontWeight: 900, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{val.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TeamStepper({ team, flagCode, value, onBump }: { team: string; flagCode?: string; value: number | null; onBump: (d: number) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, minWidth: 0 }}>
      {flagCode && <img src={flag(flagCode, 'w80')} alt={team} style={{ width: 50, height: 38, objectFit: 'cover', borderRadius: 5, boxShadow: '0 3px 8px rgba(0,0,0,.4)' }} />}
      <span style={{ fontSize: 15, fontWeight: 800, textAlign: 'center', lineHeight: 1.15 }}>{team}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 3 }}>
        <RoundBtn onClick={() => onBump(-1)}><Minus size={18} /></RoundBtn>
        <span style={{ minWidth: 28, textAlign: 'center', fontSize: 30, fontWeight: 900, fontVariantNumeric: 'tabular-nums', color: value === null ? 'rgba(255,255,255,.45)' : '#fff' }}>{value === null ? '–' : value}</span>
        <RoundBtn onClick={() => onBump(1)}><Plus size={18} /></RoundBtn>
      </div>
    </div>
  )
}

function RoundBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ width: 38, height: 38, borderRadius: '50%', border: '1.5px solid var(--border-light)', background: 'rgba(116,172,223,.12)', color: '#a8d4f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </button>
  )
}

function MiniMatch({ match, href, locale }: { match: HomeMatch; href: string; locale: string }) {
  const d = new Date(match.matchDate)
  const day = d.toLocaleDateString(locale, { weekday: 'short' })
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  const hasPick = match.pickHome !== undefined && match.pickAway !== undefined
  return (
    <Link href={href} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 14px', marginBottom: 10, textDecoration: 'none', color: 'inherit' }}>
      <div style={{ flex: '0 0 46px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, lineHeight: 1.3 }}>
        {day}<br /><b style={{ color: 'var(--text-primary)', fontSize: 13 }}>{time}</b>
      </div>
      <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
        <TeamLine team={match.homeTeam} flagCode={match.homeFlag} />
        <TeamLine team={match.awayTeam} flagCode={match.awayFlag} />
      </div>
      {hasPick
        ? <span style={{ flex: '0 0 auto', background: 'rgba(116,172,223,.16)', border: '1px solid var(--accent)', color: '#a8d4f5', fontSize: 13, fontWeight: 800, borderRadius: 10, padding: '7px 11px' }}>{match.pickHome} - {match.pickAway}</span>
        : <span style={{ flex: '0 0 auto', width: 40, height: 40, borderRadius: 12, border: '1.5px solid var(--border-light)', background: 'rgba(116,172,223,.10)', color: '#a8d4f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={20} /></span>}
    </Link>
  )
}

function TeamLine({ team, flagCode }: { team: string; flagCode?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, minWidth: 0 }}>
      {flagCode && <img src={flag(flagCode)} alt={team} style={{ width: 22, height: 16, objectFit: 'cover', borderRadius: 3, flex: '0 0 auto' }} />}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team}</span>
    </div>
  )
}

function LiveMatch({ match, liveShort, s }: { match: HomeMatch; liveShort: string; s: Strings }) {
  return (
    <div style={{ background: 'linear-gradient(135deg,rgba(231,76,60,.16),rgba(231,76,60,.05))', border: '1px solid rgba(231,76,60,.45)', borderRadius: 14, padding: '12px 14px', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 14, fontWeight: 800 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{match.homeFlag && <img src={flag(match.homeFlag)} alt="" style={{ width: 20, height: 15, objectFit: 'cover', borderRadius: 2 }} />}{match.homeTeam}</span>
            <span>{match.homeScore ?? '-'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 14, fontWeight: 800 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{match.awayFlag && <img src={flag(match.awayFlag)} alt="" style={{ width: 20, height: 15, objectFit: 'cover', borderRadius: 2 }} />}{match.awayTeam}</span>
            <span>{match.awayScore ?? '-'}</span>
          </div>
        </div>
        <span style={{ flex: '0 0 auto', color: 'var(--live)', fontWeight: 900, fontSize: 13 }}>{match.minute ? `${match.minute}'` : liveShort}</span>
      </div>
      {match.distribution && (
        <div style={{ marginTop: 11, paddingTop: 11, borderTop: '1px solid rgba(231,76,60,.25)' }}>
          <PickDistributionBar dist={match.distribution} userPick={pickClass(match.pickHome, match.pickAway)} labels={distLabels(s)} />
        </div>
      )}
    </div>
  )
}

function ProdeCard({ prode, solo, href, s }: { prode: { slug: string; name: string; color?: string; position?: number | null; points?: number; members?: number }; solo: boolean; href: string; s: Strings }) {
  const c = prode.color
  const accent = c ?? '#f5c518'
  const hasStats = prode.position != null
  return (
    <Link href={href} style={{ scrollSnapAlign: 'start', flex: solo ? '1 1 auto' : '0 0 86%', background: 'linear-gradient(160deg,#0e2f5e,#0b2348)', border: `1px solid ${c ? c + '88' : 'var(--border-light)'}`, borderRadius: 16, padding: '15px 16px', boxShadow: c ? `0 8px 22px ${c}33` : '0 8px 22px rgba(0,0,0,.3)', textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: hasStats ? 8 : 12 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <Trophy size={18} color={accent} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 16, fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prode.name}</span>
        </span>
        {hasStats && (
          <span style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--accent-light)', letterSpacing: '-0.5px' }}>{prode.points}</span>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', marginLeft: 3 }}>{s.pts}</span>
          </span>
        )}
      </div>
      {hasStats && (
        <div style={{ fontSize: 13, fontWeight: 800, color: accent, marginBottom: 12 }}>
          {prode.position}° <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: 12 }}>{s.of} {prode.members} {s.players}</span>
        </div>
      )}
      <span style={{ display: 'block', textAlign: 'center', background: c ? c + '22' : 'rgba(116,172,223,0.14)', border: `1px solid ${c ?? 'var(--accent)'}`, color: c ?? '#a8d4f5', borderRadius: 11, padding: 11, fontSize: 13.5, fontWeight: 800 }}>
        {s.seeTable}
      </span>
    </Link>
  )
}

function EmptyCard({ text }: { text: string }) {
  return <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>{text}</div>
}

const joinCardStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
  border: '1.5px dashed var(--border-light)', borderRadius: 16, background: 'rgba(255,255,255,.02)',
  padding: 22, color: '#a8d4f5',
}
