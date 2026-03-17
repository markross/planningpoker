import { describe, it, expect } from 'vitest'
import { channelName } from './channelName'

describe('channelName', () => {
  it('prefixes session code with "poker:"', () => {
    expect(channelName('ABC123')).toBe('poker:ABC123')
  })
})
