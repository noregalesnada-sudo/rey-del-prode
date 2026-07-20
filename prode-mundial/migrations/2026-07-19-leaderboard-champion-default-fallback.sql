-- Migración: el bonus de campeón en la vista `leaderboard` debe respetar la MISMA regla que
-- el display ("efectivo = override del prode ?? pick por defecto").
--
-- Bug que corrige: la subquery del bonus miraba SÓLO el champion_pick con
-- `cp.prode_id = pm.prode_id` (el override del prode). No hacía fallback al pick "por defecto"
-- (`prode_id is null`, el de "Mis Pronósticos"). Resultado: un usuario que eligió campeón
-- únicamente por defecto y participa en un prode sin override NO sumaba el bonus, aunque en la
-- card de campeones (getChampionPicks / prode page) SÍ figuraba como acertado — inconsistencia
-- entre lo que se muestra y lo que se puntúa.
--
-- Se detectó el 2026-07-19 al definirse España campeón: 4 miembros activos tenían España sólo
-- por defecto y no sumaban. Se corrigió su estado a mano insertando su fila por-prode; esta
-- migración vuelve ese parche innecesario a futuro (para cualquier campeón).
--
-- Regla de la subquery: se elige el champion_pick del usuario que matchea el prode O el default,
-- priorizando el override (prode_id no nulo) por sobre el default con `order by (prode_id is null)`
-- + `limit 1`. Así, si en el prode elegiste OTRO equipo, ese override (points reales) gana sobre
-- tu default — NO se usa max(points), que daría el bonus del default aunque en el prode hayas
-- elegido distinto.
--
-- Seguro de correr en vivo: `create or replace view` es instantáneo y transaccional; si el SQL
-- falla, la vista vieja queda intacta. No toca datos. Las columnas y su orden no cambian
-- (CREATE OR REPLACE VIEW exige mismos nombres/orden de columnas).

create or replace view public.leaderboard as
select
  pm.prode_id,
  p.id as user_id,
  p.username,
  -- total = puntos de partidos (picks) + bonus campeón (champion_picks).
  -- El bonus toma el pick EFECTIVO del prode: override si existe, si no el default (prode_id null).
  coalesce(sum(pk.points), 0)
    + coalesce((
        select cp.points
        from public.champion_picks cp
        where cp.user_id = p.id
          and (cp.prode_id = pm.prode_id or cp.prode_id is null)
        order by (cp.prode_id is null)  -- false (override del prode) antes que true (default)
        limit 1
      ), 0) as total_points,
  count(pk.id) filter (where pk.points = 3) as exact_hits,
  count(pk.id) filter (where pk.points in (1, 2)) as partial_hits,
  count(pk.id) filter (where pk.points = 0 and pk.id is not null) as misses,
  p.first_name,
  p.last_name,
  count(pk.id) filter (where pk.points = 2) as diff_hits,     -- ganador + diferencia de gol
  count(pk.id) filter (where pk.points = 1) as winner_hits    -- solo el ganador / empate
from public.prode_members pm
join public.profiles p on p.id = pm.user_id
left join public.picks pk on pk.user_id = pm.user_id and pk.prode_id = pm.prode_id
group by pm.prode_id, p.id, p.username, p.first_name, p.last_name
-- Desempate determinístico: puntos → exactos → aciertos de 2 pts → de 1 pt → menos errados → alfabético.
order by total_points desc, exact_hits desc, diff_hits desc, winner_hits desc, misses asc,
         p.first_name asc, p.last_name asc, p.username asc;
