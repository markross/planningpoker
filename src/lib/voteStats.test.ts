import { describe, it, expect } from 'vitest'
import { calculateAverage, calculateSpread, hasConsensus } from './voteStats'

describe('calculateAverage', () => {
  it('returns average of numeric estimates', () => {
    expect(calculateAverage(['1', '3', '5'])).toBe(3)
  })

  it('excludes "?" from calculation', () => {
    expect(calculateAverage(['2', '8', '?'])).toBe(5)
  })

  it('returns null when all votes are "?"', () => {
    expect(calculateAverage(['?', '?'])).toBeNull()
  })

  it('returns null for empty array', () => {
    expect(calculateAverage([])).toBeNull()
  })
})

describe('calculateSpread', () => {
  it('returns min and max of numeric estimates', () => {
    expect(calculateSpread(['1', '5', '13'])).toEqual({ min: 1, max: 13 })
  })

  it('excludes "?" from calculation', () => {
    expect(calculateSpread(['3', '8', '?'])).toEqual({ min: 3, max: 8 })
  })

  it('returns null when no numeric votes', () => {
    expect(calculateSpread(['?'])).toBeNull()
  })
})

describe('hasConsensus', () => {
  it('returns true when all numeric votes are the same', () => {
    expect(hasConsensus(['5', '5', '5'])).toBe(true)
  })

  it('returns false when votes differ', () => {
    expect(hasConsensus(['3', '5', '8'])).toBe(false)
  })

  it('ignores "?" for consensus check', () => {
    expect(hasConsensus(['5', '5', '?'])).toBe(true)
  })

  it('returns false for empty array', () => {
    expect(hasConsensus([])).toBe(false)
  })
})
