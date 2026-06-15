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
