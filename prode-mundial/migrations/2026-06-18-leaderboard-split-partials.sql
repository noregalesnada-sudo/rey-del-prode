-- Migración: desglosar `partial_hits` en la vista leaderboard.
-- Hasta ahora la tabla de líderes mostraba "Parciales" = aciertos de 1 y 2 pts juntos,
-- por lo que no se podía distinguir cuántos puntos venían de cada forma. Agregamos dos
-- columnas nuevas (diff_hits = 2 pts, winner_hits = 1 pt) sin tocar partial_hits, que
-- sigue usándose en las vistas de admin/empresa. Se mantiene: partial_hits = diff_hits + winner_hits.
--
-- IMPORTANTE: las columnas nuevas van al FINAL del select. CREATE OR REPLACE VIEW solo permite
-- agregar columnas al final; insertarlas en el medio (corriendo misses/first_name) falla con
-- "cannot change name of view column". No borra ni toca datos: una vista es solo una consulta guardada.
--
-- El bonus de campeón sigue sumándose en total_points (ver 2026-06-15-leaderboard-champion-bonus.sql).
create or replace view public.leaderboard as
select
  pm.prode_id,
  p.id as user_id,
  p.username,
  coalesce(sum(pk.points), 0)
    + coalesce((select max(cp.points) from public.champion_picks cp
                where cp.user_id = p.id and cp.prode_id = pm.prode_id), 0) as total_points,
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
