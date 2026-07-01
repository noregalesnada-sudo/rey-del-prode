# Selector de región en el ranking del prode

**Fecha:** 2026-06-30
**Prode objetivo:** Encompass (y cualquier prode con regiones/áreas habilitadas).

## Problema

En el prode, dentro de la pestaña de tabla, hay tres rankings:

1. **Ranking general** — todos los jugadores.
2. **Ranking por Región** (agregado) — promedio/total por región; ya muestra todas las regiones.
3. **"Mi Región — {tu región}"** — jugadores de la propia región del usuario, **fijo**.

El usuario quiere poder explorar cómo viene **cada** región por dentro, no solo la suya.

## Solución

Reemplazar el bloque 3 ("Mi Región") por un bloque con **selector de región**. Arranca mostrando
tu región (igual que hoy) y permite elegir cualquier otra para ver su ranking de jugadores.

### Componente nuevo: `RegionPlayersLeaderboard` (client)

Reusa el componente `Leaderboard` existente para renderizar la tabla; solo agrega el `<select>`.

**Props:**
- `areas: string[]` — regiones ordenadas por ranking (misma orden que el bloque agregado: la
  región líder primero).
- `playersByArea: Record<string, LeaderboardRow[]>` — filas de jugadores por región, ya rankeadas.
- `defaultArea: string` — la región del usuario; si no tiene, la primera de `areas`.
- `currentUserId: string` — para resaltar al usuario en la tabla.
- `labels` — título base (`"Ranking por {areaLabel}"`), label del selector, y los labels que ya
  consume `Leaderboard`.

**Comportamiento:**
- Estado client `selectedArea`, inicializado en `defaultArea`.
- Al cambiar el `<select>`, la tabla muestra `playersByArea[selectedArea]` al instante (sin red).
- Título dinámico: `"Ranking por {areaLabel} — {selectedArea}"`.

### Cambios en `prode/[slug]/page.tsx`

- Ya se calcula `membersWithArea` (user_id → area) y `leaderboardRows` (puntos por jugador).
  Construir `playersByArea` agrupando `leaderboardRows` por la región de cada jugador, ordenando
  cada grupo por puntos (reutilizar el orden existente).
- `areas` = `areaRows.map(r => r.area)` (ya viene ordenado por promedio).
- `defaultArea` = `userArea ?? areas[0]`.
- Reemplazar el render condicional de `myAreaLeaderboard` por `<RegionPlayersLeaderboard … />`.

### Visibilidad

Hoy el bloque solo aparece si el usuario tiene región asignada (`myAreaLeaderboard.length > 0`).
Pasa a aparecer siempre que el prode tenga regiones (`areasEnabled && areaRows.length > 0`), para que
espectadores o usuarios sin región también puedan explorar.

### i18n

Nueva clave para el label del selector: ES *"Ver región"* / EN *"View region"* (se compone con
`areaLabel`, que ya es configurable por empresa, p. ej. "Región" en Encompass).

## Fuera de alcance

- No se tocan el ranking general ni el "Ranking por Región" agregado (promedios).
- No hay nuevas queries: todos los datos ya se cargan en el server.
- Sin cambios de privacidad: nombres y puntos ya son visibles en el ranking general.
