-- Resultado a los 90' (tiempo reglamentario) para puntuar las eliminatorias.
--
-- La API (football-data v4) guarda en score.fullTime el resultado CON alargue, y en los
-- partidos por penales el marcador de la TANDA (ej. 3-0). Para el prode puntuamos SIEMPRE
-- el resultado de los 90 minutos. Por eso desdoblamos:
--
--   home_score / away_score          → resultado REAL / EN VIVO (incluye alargue y penales).
--                                       Es lo que se muestra en la card. Lo maneja el sync.
--   reg_home_score / reg_away_score  → resultado a los 90' (tiempo reglamentario).
--                                       Es lo que PUNTÚA.
--   result_locked                    → true cuando el resultado de 90' quedó congelado:
--                                       en automático al detectar alargue/penales, o por
--                                       corrección manual del backoffice. Mientras esté en
--                                       true el sync NO pisa reg_*, pero sí sigue moviendo
--                                       el resultado real (home_score/away_score).
--   match_duration                   → REGULAR | EXTRA_TIME | PENALTY_SHOOTOUT
--                                       (para mostrar el cartel "Alargue"/"Penales").

alter table matches
  add column if not exists reg_home_score integer,
  add column if not exists reg_away_score integer,
  add column if not exists result_locked  boolean not null default false,
  add column if not exists match_duration text;

-- Backfill imprescindible: todo lo ya cargado (fase de grupos, todo en tiempo reglamentario)
-- puntúa por su marcador actual. El scoring pasa a leer reg_*; sin este backfill vería null
-- y dejaría en 0 todos los partidos ya finalizados.
update matches
set reg_home_score = home_score,
    reg_away_score = away_score
where home_score is not null
  and reg_home_score is null;
