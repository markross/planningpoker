import { describe, it, expect } from 'vitest'
import { generateSessionCode, SESSION_CODE_CHARS } from './sessionCode'

describe('generateSessionCode', () => {
  it('returns a 6-character string', () => {
    const code = generateSessionCode()
    expect(code).toHaveLength(6)
  })

  it('contains only allowed characters', () => {
    const code = generateSessionCode()
    for (const char of code) {
      expect(SESSION_CODE_CHARS).toContain(char)
    }
  })

  it('excludes ambiguous characters (0, O, 1, I, L)', () => {
    const ambiguous = ['0', 'O', '1', 'I', 'L']
    // Generate many codes to increase confidence
    for (let i = 0; i < 100; i++) {
      const code = generateSessionCode()
      for (const char of code) {
        expect(ambiguous).not.toContain(char)
      }
    }
  })

  it('generates unique codes across multiple calls', () => {
    const codes = new Set(Array.from({ length: 50 }, () => generateSessionCode()))
    expect(codes.size).toBeGreaterThan(45)
  })

  it('returns only uppercase characters', () => {
    for (let i = 0; i < 20; i++) {
      const code = generateSessionCode()
      expect(code).toBe(code.toUpperCase())
    }
  })
})
