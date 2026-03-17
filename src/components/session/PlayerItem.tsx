import { Badge } from '../ui/Badge'

interface PlayerItemProps {
  readonly displayName: string
  readonly hasVoted: boolean
  readonly estimate: string | null
  readonly isRevealed: boolean
  readonly isCurrentUser: boolean
}

export function PlayerItem({
  displayName,
  hasVoted,
  estimate,
  isRevealed,
  isCurrentUser,
}: PlayerItemProps) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg ${
        isCurrentUser ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50'
      }`}
    >
      <span className="font-medium text-gray-800">
        {displayName}
        {isCurrentUser && (
          <span className="text-xs text-indigo-500 ml-1">(you)</span>
        )}
      </span>
      <div>
        {isRevealed && estimate ? (
          <Badge variant="success">{estimate}</Badge>
        ) : hasVoted ? (
          <Badge variant="success">Voted</Badge>
        ) : (
          <Badge>Waiting</Badge>
        )}
      </div>
    </div>
  )
}
