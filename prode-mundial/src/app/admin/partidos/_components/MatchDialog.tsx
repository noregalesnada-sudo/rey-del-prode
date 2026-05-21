'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createMatch, updateMatch } from '@/lib/actions/matches-admin'
import { useState } from 'react'

const Schema = z.object({
  home_team:  z.string().min(1, 'Requerido'),
  away_team:  z.string().min(1, 'Requerido'),
  match_date: z.string().min(1, 'Requerido'),
  phase:      z.string().min(1, 'Requerido'),
  grupo:      z.string().optional(),
  sede:       z.string().optional(),
  estadio:    z.string().optional(),
  home_score: z.coerce.number().int().min(0).optional().nullable(),
  away_score: z.coerce.number().int().min(0).optional().nullable(),
  status:     z.enum(['scheduled', 'live', 'finished', 'postponed']),
})

type FormData = z.infer<typeof Schema>

type Match = FormData & { id: string }

interface Props {
  match?: Match
  onSaved: (match: Match) => void
  onClose: () => void
}

const PHASES = ['Grupos', 'Octavos', 'Cuartos', 'Semis', 'Final', 'Tercer puesto']
const STATUSES = [
  { value: 'scheduled', label: 'Programado' },
  { value: 'live',      label: 'En vivo' },
  { value: 'finished',  label: 'Finalizado' },
  { value: 'postponed', label: 'Postergado' },
]

export default function MatchDialog({ match, onSaved, onClose }: Props) {
  const [serverError, setServerError] = useState<string | null>(null)
  const isEdit = !!match

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(Schema),
    defaultValues: match ?? { status: 'scheduled' },
  })

  async function onSubmit(data: FormData) {
    setServerError(null)
    const result = isEdit
      ? await updateMatch(match!.id, data)
      : await createMatch(data)

    if ('error' in result && result.error) {
      setServerError(typeof result.error === 'string' ? result.error : 'Error al guardar')
      return
    }
    const id = isEdit ? match!.id : (result as { id: string }).id
    onSaved({ id, ...data })
  }

  return (
    <div className="admin-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="admin-dialog">
        <h2 className="admin-dialog-title">{isEdit ? 'Editar partido' : 'Nuevo partido'}</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
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
                {PHASES.map(p => <option key={p} value={p}>{p}</option>)}
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

          {serverError && <p className="admin-error-msg" style={{ marginTop: 12 }}>{serverError}</p>}

          <div className="admin-form-actions">
            <button type="button" className="admin-btn admin-btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear partido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
