# Plan de Testing Completo — Rey del Prode

## Contexto
La app está a punto de recibir su primer cliente enterprise real (Acudir). Antes de darle acceso hay que verificar que cada parte crítica funcione sin fallas: sync de partidos, puntos, flujos enterprise y pagos. La exploración del código encontró un bug bloqueante que hay que corregir antes de cualquier test real.

---

## Bug Crítico a Corregir Primero (antes de testear)

### R32: Constraint de DB incompatible con el código
`mapStage()` en `src/lib/football-data.ts:49` devuelve `'r32'` para los partidos de Round of 32 del Mundial 2026 (hay 16 partidos de esta fase con 48 equipos).

El constraint en `supabase-schema.sql:42` solo permite:
```sql
phase text check (phase in ('groups', 'r16', 'qf', 'sf', 'final'))
```

`'r32'` NO está incluido → el `upsert` de esos 16 partidos va a fallar silenciosamente.

**Fix necesario (SQL en Supabase):**
```sql
ALTER TABLE public.matches
  DROP CONSTRAINT IF EXISTS matches_phase_check;

ALTER TABLE public.matches
  ADD CONSTRAINT matches_phase_check
  CHECK (phase IN ('groups', 'r32', 'r16', 'qf', 'sf', 'final'));
```

**Estado:** ✅ APLICADO (2026-04-15)

**Archivos relevantes:**
- `src/lib/football-data.ts` — mapStage() línea 49
- `src/app/api/sync-matches/route.ts` — usa mapStage()
- `supabase-schema.sql` — constraint línea 42

---

## Sistema de Puntos Real (3/2/1/0)

El código tiene **4 niveles**, no 3 como está documentado:
- **3 pts**: marcador exacto (ej. pronosticaste 2-1 y fue 2-1)
- **2 pts**: ganador correcto + misma diferencia de goles (ej. pronosticaste 3-1 y fue 2-0 — ambos ganan por 2)
- **1 pt**: solo el ganador/empate correcto
- **0 pts**: todo mal

Verificar que los usuarios conozcan esta regla. Código en `src/app/api/admin/calculate-points/route.ts:92-98`.

---

## ÁREA 1: Sync de Partidos

### Prerequisito
- `FOOTBALL_DATA_API_KEY` configurada en Vercel
- `SYNC_SECRET` configurada en Vercel
- Fix de constraint R32 ya aplicado en Supabase

### Tests

**T1.1 — Sync básico**
```bash
curl -X POST https://www.reydelprode.com/api/sync-matches \
  -H "x-sync-secret: <SYNC_SECRET>"
```
Resultado esperado: `{ "success": true, "total": 104 }` (o más con R32)

**T1.2 — Verificar datos en Supabase**
```sql
-- Total de partidos
SELECT COUNT(*) FROM matches;
-- Esperado: ~104 para grupos + knockouts

-- Partidos por fase
SELECT phase, COUNT(*) FROM matches GROUP BY phase ORDER BY phase;
-- Debe incluir: groups (~72), r32 (16), r16 (8), qf (4), sf (2), final (2)

-- Verificar que no hay partidos sin equipo
SELECT COUNT(*) FROM matches WHERE home_team IS NULL OR away_team IS NULL;
-- Esperado: 0 (o los que aún no se sortearon)

-- Verificar flags
SELECT home_team, home_flag, away_team, away_flag FROM matches
WHERE home_flag IS NULL AND home_team IS NOT NULL LIMIT 10;
-- Lista de equipos sin flag → hay que agregar al FLAG_MAP
```

**T1.3 — Verificar status**
```sql
SELECT status, COUNT(*) FROM matches GROUP BY status;
-- Todos deben ser 'scheduled' hasta junio 2026
```

---

## ÁREA 2: Picks y Puntos

### Setup de test
Usar una cuenta de test (no la de admin). Necesitás un prode activo con al menos 2 usuarios.

**T2.1 — Guardar un pick**
1. Ir a un prode → ingresar resultado en un partido → click Guardar
2. Verificar en Supabase:
```sql
SELECT * FROM picks WHERE user_id = '<tu_user_id>' ORDER BY updated_at DESC LIMIT 5;
-- Debe aparecer el pick con points = 0
```

**T2.2 — Bloqueo de pick a 15 minutos del partido**

El código en `src/lib/actions/picks.ts` bloquea si `minutesUntilStart < 15`. Hay que verificar dos cosas:

*a) El bloqueo visual en la UI*
1. Buscar en Supabase un partido con `status = 'scheduled'`
2. Actualizar su `match_date` a 10 minutos en el futuro:
```sql
UPDATE matches
SET match_date = NOW() + INTERVAL '10 minutes'
WHERE id = '<match_id>';
```
3. Recargar la app → el input de ese partido debe estar deshabilitado/bloqueado
4. Restaurar la fecha original después del test

*b) El bloqueo en el server action (seguridad)*
1. Con el partido a 10 min: intentar hacer un pick via la UI → debe fallar con error
2. Verificar en Supabase que **no** se guardó ningún pick nuevo para ese partido

*c) El pick que cuenta es el que estaba guardado al momento del bloqueo*
1. Hacer un pick antes del bloqueo (ej. 2-1)
2. Esperar/simular que el partido está a <15 min (patch de match_date)
3. Verificar que el pick 2-1 sigue en DB sin cambios
4. Calcular puntos → los 2-1 son los que se usan
```sql
SELECT home_pick, away_pick, updated_at FROM picks
WHERE match_id = '<match_id>' AND user_id = '<user_id>';
-- updated_at debe ser ANTERIOR al bloqueo
```

**T2.3 — Cálculo de puntos**
```sql
-- 1. Crear escenario de test: simular partido terminado
UPDATE matches
SET status = 'finished', home_score = 2, away_score = 1
WHERE id = '<match_id_con_picks>';
```
```bash
# 2. Llamar al endpoint de cálculo
curl -X POST https://www.reydelprode.com/api/admin/calculate-points \
  -H "x-sync-secret: <SYNC_SECRET>" \
  -H "Content-Type: application/json" \
  -d '{"matchId": "<match_id>"}'
```
```sql
-- 3. Verificar puntos asignados
SELECT p.home_pick, p.away_pick, p.points,
       m.home_score, m.away_score
FROM picks p
JOIN matches m ON m.id = p.match_id
WHERE p.match_id = '<match_id>';
```

Casos a verificar:
| Pick | Resultado | Puntos esperados |
|------|-----------|-----------------|
| 2-1  | 2-1       | 3               |
| 3-2  | 2-1       | 2 (mismo ganador, misma dif +1) |
| 1-0  | 2-1       | 1 (solo ganador) |
| 0-1  | 2-1       | 0               |
| 1-1  | 0-0       | 1 (empate correcto) |

**T2.4 — Leaderboard**
1. Después de calcular puntos, ir al prode en la app
2. Verificar que el leaderboard muestra los puntos actualizados
3. Verificar que el orden es correcto (mayor a menor)
4. Verificar que "(vos)" aparece en tu fila

**T2.5 — Calcular puntos de todos los partidos finished**
```bash
curl -X POST https://www.reydelprode.com/api/admin/calculate-points \
  -H "x-sync-secret: <SYNC_SECRET>"
```
Resultado esperado: `{ "success": true, "processed": N }`

---

## ÁREA 3: Champion Pick

**T3.1 — Guardar pick de campeón**
1. Ir a Mis Pronósticos o a un prode
2. Seleccionar un equipo como campeón
3. Verificar en Supabase:
```sql
SELECT * FROM champion_picks WHERE user_id = '<user_id>';
-- Debe haber una fila con prode_id null (pick global) y opcionalmente una con prode_id
```

**T3.2 — Asignar 10 puntos**
```bash
curl -X POST https://www.reydelprode.com/api/admin/calculate-points \
  -H "x-sync-secret: <SYNC_SECRET>" \
  -H "Content-Type: application/json" \
  -d '{"champion": "Argentina"}'
```
```sql
SELECT * FROM champion_picks WHERE team = 'Argentina';
-- points debe ser 10

SELECT * FROM leaderboard WHERE prode_id = '<prode_id>';
-- total_points debe incluir los 10 pts del campeón
```

---

## ÁREA 4: Flujo Enterprise

**T4.1 — Landing de empresa**
1. Acceder a `https://www.reydelprode.com/acudir`
2. Verificar: logo, banner, colores custom, nombre empresa
3. Verificar que "Ya tengo cuenta" redirige a `/login?next=/prode/<slug_correcto>`

**T4.2 — Registro via whitelist**
```sql
INSERT INTO company_whitelist (company_slug, email, area)
VALUES ('acudir', 'test@test.com', 'Tecnología');
```
1. Ir a `/acudir/register` con ese mail y completar registro
2. Verificar:
```sql
SELECT pm.*, p.email FROM prode_members pm
JOIN profiles p ON p.id = pm.user_id
WHERE pm.prode_id = (SELECT prode_id FROM companies WHERE slug = 'acudir')
ORDER BY pm.joined_at DESC LIMIT 3;

SELECT * FROM company_whitelist WHERE email = 'test@test.com';
-- used debe ser true
```

**T4.3 — Email no en whitelist**
1. Registrarse en `/acudir/register` con email no listado
2. Resultado esperado: error "No es un mail válido para registrarse"

**T4.4 — Panel admin**
1. Loguearse como superadmin → ir a `/empresa-admin/acudir`
2. Tab Jugadores: lista con área, filtros, eliminar
3. Tab Whitelist: emails, estado, filtros, copiar mails
4. Tab Configuración: cambiar color → verificar que se refleja en el prode

**T4.5 — Branding en el prode**
```sql
SELECT slug, primary_color, secondary_color, logo_url, banner_url, prode_name
FROM companies WHERE slug = 'acudir';
```
Ir al prode de Acudir → verificar colores, logo y nombre custom.

---

## ÁREA 5: Flujos Pro/Business

**T5.1 — Código promo Pro**
1. Crear prode con plan Pro + código promo → verificar `plan = 'pro'` en DB

**T5.2 — Código promo Business**
1. Crear prode con plan Business + código → verificar `plan = 'business'` en DB

**T5.3 — Límite de jugadores Free**
1. En prode free con 25 jugadores, intentar unirse con usuario 26
2. Resultado esperado: error de límite alcanzado

---

## ÁREA 6: Realtime del Leaderboard

*Prerequisito: Realtime habilitado en Supabase para `picks` y `matches` (Database → Replication)*

**T6.1 — Picks en tiempo real**
1. Abrir el prode en dos browsers con distintos usuarios
2. Browser 1: guardar un pick
3. Browser 2: verificar que el leaderboard se actualiza sin recargar

**T6.2 — Scores en tiempo real**
```sql
UPDATE matches SET home_score = 1 WHERE id = '<match_id>';
```
Verificar que la app refleja el cambio sin recargar.

---

## ÁREA 7: Carga — 800 usuarios simultáneos

### Puntos de presión
- **Auth rate limits**: 800 signUps rápidos pueden chocar el límite de Supabase Auth
- **Conexiones DB**: verificar que `NEXT_PUBLIC_SUPABASE_URL` usa el pooler (puerto 6543)

### Estrategia recomendada
Onboarding escalonado: enviar el link por tandas de 200/hora en lugar de todos juntos.

### Checklist
- [ ] Plan de Supabase: mínimo Pro
- [ ] URL de Supabase apunta al connection pooler
- [ ] Auth rate limits revisados en el dashboard
- [ ] Estrategia de onboarding escalonado acordada con el cliente

---

## Orden de Ejecución

1. ✅ Fix constraint R32 en Supabase
2. T1.1–T1.3 — Sync y verificar datos
3. T2.1–T2.5 — Picks y puntos
4. T3.1–T3.2 — Champion pick
5. T4.1–T4.5 — Enterprise (Acudir)
6. T5.1–T5.3 — Pagos/promos
7. T6.1–T6.2 — Realtime
8. Área 7 — Carga

---

## Checklist Pre-Go-Live

- [x] Fix constraint R32 aplicado en Supabase
- [ ] `FOOTBALL_DATA_API_KEY` en Vercel
- [ ] `SYNC_SECRET` en Vercel
- [ ] `CRON_SECRET` en Vercel
- [ ] Realtime habilitado en Supabase para `picks` y `matches`
- [ ] Sync manual ejecutado y 104+ partidos verificados en DB
- [ ] Puntos calculados correctamente (T2.3)
- [ ] Flujo enterprise Acudir funcionando end-to-end (T4.1–T4.5)
- [ ] Leaderboard actualiza en tiempo real
