'use client'

import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createMatch, updateMatch } from '@/lib/actions/matches-admin'
import { useState } from 'react'

const Schema = z.object({
  home_team:  z.string().min(1, 'Requerido'),
  away_team:  z.string().min(1, 'Requerido'),
  match_date: z.string().min(1, 'Requerido'),
  phase:      z.string().min(1, 'Requerido'),
  grupo:      z.string().optional().nullable(),
  sede:       z.string().optional().nullable(),
  estadio:    z.string().optional().nullable(),
  home_score: z.coerce.number().int().min(0).optional().nullable(),
  away_score: z.coerce.number().int().min(0).optional().nullable(),
  status:     z.enum(['scheduled', 'live', 'finished', 'postponed']),
})

type FormData = z.infer<typeof Schema>

// reg_* = resultado a los 90' (lo que puntúa). El form edita ESTE valor.
type Match = FormData & { id: string; reg_home_score?: number | null; reg_away_score?: number | null; match_duration?: string | null }

interface Props {
  match?: Match
  onSaved: (match: Match) => void
  onClose: () => void
}

const PHASES = [
  { value: 'groups', label: 'Grupos' },
  { value: 'r32',    label: 'Dieciseisavos' },
  { value: 'r16',    label: 'Octavos' },
  { value: 'qf',     label: 'Cuartos' },
  { value: 'sf',     label: 'Semis' },
  { value: 'final',  label: 'Final' },
  // El partido por el 3er puesto se guarda como fase 'final'; las vistas
  // públicas separan los dos partidos 'final' por fecha (el más temprano = 3er puesto).
  { value: 'final',  label: 'Tercer puesto' },
]
const STATUSES = [
  { value: 'scheduled', label: 'Programado' },
  { value: 'live',      label: 'En vivo' },
  { value: 'finished',  label: 'Finalizado' },
  { value: 'postponed', label: 'Postergado' },
]

const PHASE_LABEL: Record<string, string> = {
  groups: 'Grupos', r32: 'Dieciseisavos', r16: 'Octavos', qf: 'Cuartos', sf: 'Semis', final: 'Final',
}

function formatHeaderDate(iso: string) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleString('es-AR', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function MatchDialog({ match, onSaved, onClose }: Props) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [clearing, setClearing] = useState(false)
  const isEdit = !!match

  async function handleClear() {
    if (!match) return
    if (!confirm('¿Limpiar el resultado y volver el partido a "Programado"? Se descartan los puntos de este partido en todos los prodes.')) return
    setServerError(null)
    setClearing(true)
    const cleared: Match = { ...match, home_score: null, away_score: null, reg_home_score: null, reg_away_score: null, status: 'scheduled' }
    const result = await updateMatch(match.id, cleared)
    setClearing(false)
    if ('error' in result && result.error) {
      setServerError(typeof result.error === 'string' ? result.error : 'Error al limpiar')
      return
    }
    onSaved(cleared)
  }

  // Prefill con el resultado de los 90' (reg_*) que es lo que se edita y puntúa; si todavía
  // no hay reg_* (partido viejo sin backfill) cae al home_score/away_score.
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(Schema) as Resolver<FormData>,
    defaultValues: match
      ? { ...match, home_score: match.reg_home_score ?? match.home_score, away_score: match.reg_away_score ?? match.away_score }
      : { status: 'scheduled' },
  })

  async function onSubmit(data: FormData) {
    setServerError(null)
    // Al editar solo cargamos resultado/estado: preservamos el resto del partido
    // (equipos, fecha, fase, sede…) tal cual venía, sin re-renderizar esos campos.
    const payload: FormData = isEdit ? { ...match!, ...data } : data

    const result = isEdit
      ? await updateMatch(match!.id, payload)
      : await createMatch(payload)

    if ('error' in result && result.error) {
      setServerError(typeof result.error === 'string' ? result.error : 'Error al guardar')
      return
    }
    const id = isEdit ? match!.id : (result as unknown as { id: string }).id
    // El resultado cargado es el de 90' → reflejarlo en reg_* para que la tabla lo muestre.
    onSaved({ id, ...payload, reg_home_score: payload.home_score ?? null, reg_away_score: payload.away_score ?? null })
  }

  return (
    <div className="admin-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="admin-dialog">
        <h2 className="admin-dialog-title">{isEdit ? 'Cargar resultado' : 'Nuevo partido'}</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          {isEdit ? (
            <>
              <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 8, background: 'var(--bg-subtle, rgba(255,255,255,0.04))' }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{match!.home_team} vs {match!.away_team}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>
                  {formatHeaderDate(match!.match_date)} · {PHASE_LABEL[match!.phase] ?? match!.phase}
                  {match!.grupo ? ` · Grupo ${match!.grupo}` : ''}
                  {match!.estadio ? ` · ${match!.estadio}` : ''}
                </div>
              </div>

              <div className="admin-form-grid">
                <div className="admin-field">
                  <label className="admin-label">Goles local (90′)</label>
                  <input type="number" min={0} className="admin-input" {...register('home_score')} />
                </div>

                <div className="admin-field">
                  <label className="admin-label">Goles visitante (90′)</label>
                  <input type="number" min={0} className="admin-input" {...register('away_score')} />
                </div>

                <div className="admin-field">
                  <label className="admin-label">Estado</label>
                  <select className="admin-select" {...register('status')}>
                    {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.4 }}>
                Se puntúa el resultado a los <b>90 minutos</b> (sin alargue ni penales). Al guardarlo
                queda <b>fijado</b>: el sync de la API no lo pisa, pero el marcador en vivo de la card
                sigue actualizándose. Usalo para corregir, por ejemplo, un gol de los 90+ que la foto
                automática no haya alcanzado a tomar.
                {match!.match_duration && match!.match_duration !== 'REGULAR' && (
                  <>
                    <br />
                    <span style={{ color: '#f59e0b' }}>
                      Definido en {match!.match_duration === 'PENALTY_SHOOTOUT' ? 'penales' : 'alargue'} ·
                      resultado real {match!.home_score}-{match!.away_score}
                    </span>
                  </>
                )}
              </p>
            </>
          ) : (
            <div className="admin-form-grid">
              <div className="admin-field">
                <label className="admin-label">Local</label>
                <input className={`admin-input${errors.home_team ? ' admin-input-error' : ''}`} {...register('home_team')} />
                {errors.home_team && <span className="admin-error-msg">{errors.home_team.message}</span>}
              </div>

              <div className="admin-field">
                <label className="admin-label">Visitante</label>
                <input className={`admin-input${errors.away_team ? ' admin-input-error' : ''}`} {...register('away_team')} />
                {errors.away_team && <span className="admin-error-msg">{errors.away_team.message}</span>}
              </div>

              <div className="admin-field">
                <label className="admin-label">Fecha y hora</label>
                <input type="datetime-local" className={`admin-input${errors.match_date ? ' admin-input-error' : ''}`} {...register('match_date')} />
                {errors.match_date && <span className="admin-error-msg">{errors.match_date.message}</span>}
              </div>

              <div className="admin-field">
                <label className="admin-label">Fase</label>
                <select className={`admin-select${errors.phase ? ' admin-input-error' : ''}`} {...register('phase')}>
                  <option value="">Seleccionar…</option>
                  {PHASES.map(p => <option key={p.label} value={p.value}>{p.label}</option>)}
                </select>
                {errors.phase && <span className="admin-error-msg">{errors.phase.message}</span>}
              </div>

              <div className="admin-field">
                <label className="admin-label">Estado</label>
                <select className="admin-select" {...register('status')}>
                  {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              <div className="admin-field">
                <label className="admin-label">Grupo (opcional)</label>
                <input className="admin-input" placeholder="A, B…" {...register('grupo')} />
              </div>

              <div className="admin-field">
                <label className="admin-label">Goles local</label>
                <input type="number" className="admin-input" {...register('home_score')} />
              </div>

              <div className="admin-field">
                <label className="admin-label">Goles visitante</label>
                <input type="number" className="admin-input" {...register('away_score')} />
              </div>

              <div className="admin-field">
                <label className="admin-label">Sede</label>
                <input className="admin-input" {...register('sede')} />
              </div>

              <div className="admin-field">
                <label className="admin-label">Estadio</label>
                <input className="admin-input" {...register('estadio')} />
              </div>
            </div>
          )}

          {serverError && <p className="admin-error-msg" style={{ marginTop: 12 }}>{serverError}</p>}

          <div className="admin-form-actions">
            {isEdit && (
              <button
                type="button"
                className="admin-btn admin-btn-ghost"
                onClick={handleClear}
                disabled={clearing || isSubmitting}
                style={{ marginRight: 'auto', color: 'var(--danger, #e06b6b)' }}
              >
                {clearing ? 'Limpiando…' : 'Limpiar resultado'}
              </button>
            )}
            <button type="button" className="admin-btn admin-btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={isSubmitting || clearing}>
              {isSubmitting ? 'Guardando…' : isEdit ? 'Guardar resultado' : 'Crear partido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
