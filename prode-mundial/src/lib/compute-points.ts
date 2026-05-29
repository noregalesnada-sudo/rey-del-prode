export function computePoints(
  homePick: number,
  awayPick: number,
  actualHome: number,
  actualAway: number
): number {
  const actualWinner = actualHome > actualAway ? 'home' : actualAway > actualHome ? 'away' : 'draw'
  const actualDiff   = actualHome - actualAway
  const pickWinner   = homePick  > awayPick  ? 'home' : awayPick  > homePick  ? 'away' : 'draw'
  const pickDiff     = homePick  - awayPick

  if (homePick === actualHome && awayPick === actualAway) return 3
  if (pickWinner === actualWinner && pickDiff === actualDiff) return 2
  if (pickWinner === actualWinner) return 1
  return 0
}
