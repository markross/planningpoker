import { describe, it, expect } from 'vitest'
import { validateSessionSlug, toSlug } from './sessionSlug'

describe('validateSessionSlug', () => {
  it('accepts valid slugs', () => {
    expect(validateSessionSlug('sprint-42')).toBeNull()
    expect(validateSessionSlug('abc')).toBeNull()
    expect(validateSessionSlug('my-long-session-name')).toBeNull()
    expect(validateSessionSlug('a1b2c3')).toBeNull()
  })

  it('rejects too short', () => {
    expect(validateSessionSlug('ab')).toContain('at least 3')
    expect(validateSessionSlug('')).toContain('at least 3')
  })

  it('rejects too long', () => {
    expect(validateSessionSlug('a'.repeat(51))).toContain('at most 50')
  })

  it('rejects uppercase', () => {
    expect(validateSessionSlug('Sprint-42')).not.toBeNull()
  })

  it('rejects leading/trailing hyphens', () => {
    expect(validateSessionSlug('-sprint')).not.toBeNull()
    expect(validateSessionSlug('sprint-')).not.toBeNull()
  })

  it('rejects consecutive hyphens', () => {
    expect(validateSessionSlug('sprint--42')).not.toBeNull()
  })

  it('rejects special characters', () => {
    expect(validateSessionSlug('sprint_42')).not.toBeNull()
    expect(validateSessionSlug('sprint 42')).not.toBeNull()
  })
})

describe('toSlug', () => {
  it('lowercases input', () => {
    expect(toSlug('Sprint')).toBe('sprint')
  })

  it('converts spaces to hyphens', () => {
    expect(toSlug('my session')).toBe('my-session')
  })

  it('strips invalid characters', () => {
    expect(toSlug('sprint_42!')).toBe('sprint42')
  })

  it('collapses consecutive hyphens', () => {
    expect(toSlug('a--b')).toBe('a-b')
  })

  it('trims leading/trailing hyphens', () => {
    expect(toSlug('-sprint-')).toBe('sprint')
  })

  it('handles complex input', () => {
    expect(toSlug('  My Sprint #42!  ')).toBe('my-sprint-42')
  })
})
