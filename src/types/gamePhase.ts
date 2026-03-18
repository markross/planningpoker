export type GamePhase = 'LOBBY' | 'VOTING' | 'REVEALED'

export function derivePhase(
  voteCount: number,
  isRevealed: boolean,
): GamePhase {
  if (isRevealed) return 'REVEALED'
  if (voteCount > 0) return 'VOTING'
  return 'LOBBY'
}
