-- Migración: incluir el bonus de campeón (champion_picks.points) en la vista leaderboard.
--
-- Contexto: la vista sumaba sólo picks.points. Los 10 pts del campeón se compensaban a mano
-- en la prode page y en el home, pero NO en el ranking de admin ni en empresa-admin. Además,
-- esas sumas en app-code se truncaban a 1000 filas (límite de PostgREST) en el prode grande,
-- así que algunos campeones acertados no sumaban. Moviendo el bonus a la vista, los 4
-- consumidores quedan correctos y sin límite de filas.
--
-- Seguro de correr en vivo: `create or replace view` es instantáneo y transaccional; si el SQL
-- falla, la vista vieja queda intacta. Hoy todos los champion_picks.points son 0 (fase de
-- grupos), así que no hay cambio visible hasta que se defina el campeón.
--
-- IMPORTANTE: desplegar junto con el código que quita las sumas manuales (prode page + home).
-- Si se corre el SQL pero queda el código viejo, al definirse el campeón se contaría DOBLE en
-- esas dos superficies.

create or replace view public.leaderboard as
select
  pm.prode_id,
  p.id as user_id,
  p.username,
  -- total = puntos de partidos (picks) + bonus campeón (champion_picks). El bonus va por
  -- subquery correlada (no join) para no multiplicar las filas de picks; max() es defensivo
  -- ante duplicados (en la práctica hay un único champion_pick por user+prode).
  coalesce(sum(pk.points), 0)
    + coalesce((select max(cp.points) from public.champion_picks cp
                where cp.user_id = p.id and cp.prode_id = pm.prode_id), 0) as total_points,
  count(pk.id) filter (where pk.points = 3) as exact_hits,
  count(pk.id) filter (where pk.points in (1, 2)) as partial_hits,
  count(pk.id) filter (where pk.points = 0 and pk.id is not null) as misses,
  p.first_name,
  p.last_name
from public.prode_members pm
join public.profiles p on p.id = pm.user_id
left join public.picks pk on pk.user_id = pm.user_id and pk.prode_id = pm.prode_id
group by pm.prode_id, p.id, p.username, p.first_name, p.last_name
order by total_points desc, exact_hits desc, partial_hits desc, misses asc,
         p.first_name asc, p.last_name asc, p.username asc;
