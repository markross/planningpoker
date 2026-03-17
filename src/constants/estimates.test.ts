import { describe, it, expect } from 'vitest'
import { ESTIMATES } from './estimates'

describe('ESTIMATES', () => {
  it('contains the fibonacci sequence plus "?"', () => {
    expect(ESTIMATES).toEqual(['1', '2', '3', '5', '8', '13', '21', '?'])
  })

  it('has 8 values', () => {
    expect(ESTIMATES).toHaveLength(8)
  })
})
