import type { Session } from '../../types/session'

let counter = 0

export function buildSession(overrides: Partial<Session> = {}): Session {
  counter += 1
  return {
    id: `session-${counter}`,
    sessionCode: `TST${String(counter).padStart(3, '0')}`,
    isRevealed: false,
    createdBy: `user-${counter}`,
    createdAt: '2026-03-17T00:00:00Z',
    ...overrides,
  }
}
