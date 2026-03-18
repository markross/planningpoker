import type { Vote } from '../../types/vote'
import {
  calculateAverage,
  calculateSpread,
  hasConsensus,
} from '../../lib/voteStats'

interface VoteResultsProps {
  readonly votes: ReadonlyMap<string, Vote>
}

export function VoteResults({ votes }: VoteResultsProps) {
  const voteValues: string[] = Array.from(votes.values())
    .map((v) => v.estimate)
    .filter((e): e is NonNullable<typeof e> => e != null)

  if (voteValues.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">No votes submitted</p>
    )
  }

  const average = calculateAverage(voteValues)
  const spread = calculateSpread(voteValues)
  const consensus = hasConsensus(voteValues)
  const unsureCount = voteValues.filter((v) => v === '?').length

  const averageText = average !== null ? average.toFixed(1) : '-'
  const spreadText = spread ? `${spread.min}–${spread.max}` : '-'
  const consensusText = consensus ? 'Yes' : 'No'

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <h3 className="font-semibold text-gray-900">Results</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-indigo-600" aria-label={`Average: ${averageText}`}>
            {averageText}
          </p>
          <p className="text-xs text-gray-500">Average</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-800" aria-label={`Spread: ${spreadText}`}>
            {spreadText}
          </p>
          <p className="text-xs text-gray-500">Spread</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-800" aria-label={`Consensus: ${consensusText}`}>
            {consensusText}
          </p>
          <p className="text-xs text-gray-500">Consensus</p>
        </div>
      </div>
      {unsureCount > 0 && (
        <p className="text-sm text-yellow-600 text-center">
          {unsureCount} player{unsureCount !== 1 ? 's' : ''} unsure
        </p>
      )}
    </div>
  )
}
