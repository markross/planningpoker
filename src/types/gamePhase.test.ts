import { describe, it, expect } from 'vitest'
import { derivePhase } from './gamePhase'

describe('derivePhase', () => {
  it('returns LOBBY when no votes and not revealed', () => {
    expect(derivePhase(0, false)).toBe('LOBBY')
  })

  it('returns VOTING when votes exist and not revealed', () => {
    expect(derivePhase(3, false)).toBe('VOTING')
  })

  it('returns REVEALED when isRevealed is true', () => {
    expect(derivePhase(3, true)).toBe('REVEALED')
  })

  it('returns REVEALED even with no votes if isRevealed', () => {
    expect(derivePhase(0, true)).toBe('REVEALED')
  })
})
