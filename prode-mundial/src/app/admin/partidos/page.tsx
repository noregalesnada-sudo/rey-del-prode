import { getMatches } from '@/lib/actions/matches-admin'
import MatchesTable from './_components/MatchesTable'

export default async function PartidosPage() {
  const result = await getMatches()
  const matches = 'data' in result ? (result.data ?? []) : []

  return <MatchesTable initialMatches={matches as Parameters<typeof MatchesTable>[0]['initialMatches']} />
}
