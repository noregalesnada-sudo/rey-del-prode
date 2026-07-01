# "Tu pick" en el fixture con pronósticos divergentes entre prodes

**Fecha:** 2026-07-01

## Problema

El fixture es una vista global (no atada a un prode). Muestra "Tu pick" resolviendo un valor
único entre todos los prodes activos del usuario (ver `effectivePick`). Cuando el usuario cargó
**picks distintos en distintos prodes** para el mismo partido, no hay un valor único y hoy el
fixture cae al default; si no hay default, queda **vacío**.

Ese vacío confunde: el usuario ve resultados en otros partidos y en uno puntual nada, y piensa
*"¿no se me guardó?"*. Ya le pasó a más de un usuario.

Caso real confirmado: un usuario con Inglaterra-Congo cargado `4-1` en un prode y `3-1` en otro,
sin default → fixture vacío.

## Solución

Hacer el "Tu pick" del fixture **consciente de la divergencia**. Tres estados:

1. **Un solo pick** (un prode, o coincide en todos) → `Tu pick: X-Y` + puntos, igual que hoy.
2. **Picks distintos entre prodes** → mensaje claro (ver abajo), en vez de vacío.
3. **No pronosticaste** en ningún prode ni default → vacío (correcto).

### Mensaje de divergencia

En el mismo lugar del footer donde va "Tu pick", con ✓ verde para transmitir "guardado":

- ES: **"✓ Cargaste distinto en cada prode · está todo guardado"**
- EN: **"✓ Different pick in each pool · all saved"**

Comunica: que sí pronosticó, que es distinto por prode (por eso no hay número), y que está guardado.

## Alcance técnico

### `src/lib/effective-pick.ts`

Nueva función `effectivePickStatus(prodeIds, overridesForMatch, def)` que devuelve:
- `{ kind: 'single', pick }` — un único valor efectivo (todos los prodes con pick coinciden; o
  sin prodes pero con default).
- `{ kind: 'divergent' }` — hay ≥2 valores distintos entre los prodes.
- `{ kind: 'none' }` — no hay ningún pick.

Regla: por prode, `override ?? default`; se descartan los prodes sin ningún pick; sobre los que
quedan, si todos coinciden → `single`, si difieren → `divergent`, si no queda ninguno → `none`.

`effectivePick` (usado por el prefill de `/cargar`) **no se toca**: mantiene su lógica conservadora.

### `src/app/[lang]/(dashboard)/fixture/page.tsx`

Reemplazar el `pickMap` (Map de pick) por un map de estado usando `effectivePickStatus`. Al armar
cada `Match`: si `single` → `userPickHome/Away`; si `divergent` → `pickDivergent: true`.

### `src/components/matches/MatchCard.tsx`

- `Match` gana `pickDivergent?: boolean`.
- En el footer: si `pickDivergent` → mostrar el mensaje; si no → comportamiento actual ("Tu pick").
- Solo el fixture setea `pickDivergent`. Dentro de un prode nunca hay divergencia, así que esas
  tarjetas no cambian.

### i18n

Nueva clave `matches.pickDivergent` (ES/EN) con el copy de arriba.

## Fuera de alcance

- No cambia el scoring ni el guardado: los picks por prode ya están bien guardados.
- No se listan los valores por prode en el fixture (para verlos, entrar a cada prode).
