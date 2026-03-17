import type { Vote } from '../../types/vote'
import type { Estimate } from '../../constants/estimates'

let counter = 0

export function buildVote(overrides: Partial<Vote> = {}): Vote {
  counter += 1
  return {
    id: `vote-${counter}`,
    sessionId: `session-1`,
    playerId: `player-${counter}`,
    estimate: '5' as Estimate,
    updatedAt: '2026-03-17T00:00:00Z',
    ...overrides,
  }
}
