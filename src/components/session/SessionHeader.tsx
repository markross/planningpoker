import { Badge } from '../ui/Badge'
import type { GamePhase } from '../../types/gamePhase'

interface SessionHeaderProps {
  readonly sessionCode: string
  readonly gamePhase: GamePhase
  readonly playerCount: number
}

const phaseLabels: Record<GamePhase, string> = {
  LOBBY: 'Waiting for votes',
  VOTING: 'Voting in progress',
  REVEALED: 'Votes revealed',
}

export function SessionHeader({
  sessionCode,
  gamePhase,
  playerCount,
}: SessionHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row items-center justify-between gap-2 p-4 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-gray-900">Planning Poker</h1>
        <Badge>{sessionCode}</Badge>
      </div>
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <span>
          {playerCount} player{playerCount !== 1 ? 's' : ''}
        </span>
        <Badge
          variant={gamePhase === 'REVEALED' ? 'success' : 'default'}
        >
          {phaseLabels[gamePhase]}
        </Badge>
      </div>
    </header>
  )
}
