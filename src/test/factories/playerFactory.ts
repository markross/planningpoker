import type { Player } from '../../types/player'

let counter = 0

export function buildPlayer(overrides: Partial<Player> = {}): Player {
  counter += 1
  return {
    id: `player-${counter}`,
    sessionId: `session-1`,
    userId: `user-${counter}`,
    displayName: `Player ${counter}`,
    createdAt: '2026-03-17T00:00:00Z',
    ...overrides,
  }
}
