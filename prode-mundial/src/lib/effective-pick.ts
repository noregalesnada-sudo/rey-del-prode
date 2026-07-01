export interface Pick { home: number; away: number }

// Pick efectivo del usuario para un partido en superficies GLOBALES (fixture y el prefill de
// "cargar en todos tus prodes"), donde no hay un prode en contexto. Regla: por cada prode donde
// jugás, override del prode ?? heredado de Mis Pronósticos (default). Si TODOS coinciden devolvemos
// ese valor; si divergen (o no jugás ningún prode) caemos al default. Así estas vistas reflejan lo
// que realmente pronosticaste y no un default viejo que ya no usa ningún prode.
export function effectivePick(
  prodeIds: string[],
  overridesForMatch: Map<string, Pick> | undefined,
  def: Pick | undefined
): Pick | undefined {
  if (!overridesForMatch || prodeIds.length === 0) return def
  const effective = prodeIds.map((pid) => overridesForMatch.get(pid) ?? def)
  const first = effective[0]
  if (first != null && effective.every((e) => e != null && e.home === first.home && e.away === first.away)) {
    return first
  }
  return def
}

export type PickStatus =
  | { kind: 'single'; pick: Pick }
  | { kind: 'divergent' }
  | { kind: 'none' }

// Estado del pick del usuario para un partido en el fixture (vista global). A diferencia de
// effectivePick, distingue "cargaste distinto en cada prode" de "no cargaste nada", para que el
// fixture no muestre un vacío engañoso cuando en realidad sí pronosticaste (con valores distintos).
// Regla: por prode, override ?? default; se descartan los prodes sin ningún pick; sobre los que
// quedan, si todos coinciden → single, si difieren → divergent, si no queda ninguno → none.
export function effectivePickStatus(
  prodeIds: string[],
  overridesForMatch: Map<string, Pick> | undefined,
  def: Pick | undefined
): PickStatus {
  if (prodeIds.length === 0) return def ? { kind: 'single', pick: def } : { kind: 'none' }
  const picks = prodeIds
    .map((pid) => overridesForMatch?.get(pid) ?? def)
    .filter((p): p is Pick => p != null)
  if (picks.length === 0) return { kind: 'none' }
  const first = picks[0]
  const allEqual = picks.every((p) => p.home === first.home && p.away === first.away)
  return allEqual ? { kind: 'single', pick: first } : { kind: 'divergent' }
}
