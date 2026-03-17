import type { Player } from '../../types/player'
import type { Vote } from '../../types/vote'
import { PlayerItem } from './PlayerItem'

interface PlayerListProps {
  readonly players: readonly Player[]
  readonly votes: ReadonlyMap<string, Vote>
  readonly isRevealed: boolean
  readonly currentUserId: string | null
}

export function PlayerList({
  players,
  votes,
  isRevealed,
  currentUserId,
}: PlayerListProps) {
  if (players.length === 0) {
    return (
      <p className="text-gray-500 text-sm text-center py-4">
        No players yet. Share the link to invite teammates.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2" aria-label="Players">
      {players.map((player) => {
        const vote = votes.get(player.id)
        return (
          <PlayerItem
            key={player.id}
            displayName={player.displayName}
            hasVoted={vote?.estimate != null}
            estimate={vote?.estimate ?? null}
            isRevealed={isRevealed}
            isCurrentUser={player.userId === currentUserId}
          />
        )
      })}
    </div>
  )
}
