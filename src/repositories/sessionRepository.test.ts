import { describe, it, expect, beforeEach } from 'vitest'
import { createMockSupabaseClient } from '../test/mocks/supabaseMock'
import { createSessionRepository } from './sessionRepository'
import type { Session } from '../types/session'

describe('sessionRepository', () => {
  const mockClient = createMockSupabaseClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const repo = createSessionRepository(mockClient as any)
  const qb = mockClient._queryBuilder

  beforeEach(() => {
    Object.values(qb).forEach((fn) => fn.mockClear())
    mockClient.from.mockClear()
  })

  describe('create', () => {
    it('inserts a session and returns it', async () => {
      const dbRow = {
        id: 'uuid-1',
        session_code: 'ABC123',
        is_revealed: false,
        created_by: 'user-1',
        created_at: '2026-03-17T00:00:00Z',
      }
      const expected: Session = {
        id: 'uuid-1',
        sessionCode: 'ABC123',
        isRevealed: false,
        createdBy: 'user-1',
        createdAt: '2026-03-17T00:00:00Z',
      }
      qb.single.mockResolvedValueOnce({ data: dbRow, error: null })

      const result = await repo.create('ABC123', 'user-1')

      expect(mockClient.from).toHaveBeenCalledWith('poker_sessions')
      expect(qb.insert).toHaveBeenCalledWith({
        session_code: 'ABC123',
        created_by: 'user-1',
      })
      expect(result).toEqual(expected)
    })

    it('throws on error', async () => {
      qb.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'duplicate' },
      })

      await expect(repo.create('ABC123', 'user-1')).rejects.toThrow('duplicate')
    })
  })

  describe('findByCode', () => {
    it('returns session when found', async () => {
      const dbRow = {
        id: 'uuid-1',
        session_code: 'ABC123',
        is_revealed: false,
        created_by: 'user-1',
        created_at: '2026-03-17T00:00:00Z',
      }
      const expected: Session = {
        id: 'uuid-1',
        sessionCode: 'ABC123',
        isRevealed: false,
        createdBy: 'user-1',
        createdAt: '2026-03-17T00:00:00Z',
      }
      qb.maybeSingle.mockResolvedValueOnce({ data: dbRow, error: null })

      const result = await repo.findByCode('ABC123')

      expect(qb.eq).toHaveBeenCalledWith('session_code', 'ABC123')
      expect(result).toEqual(expected)
    })

    it('returns null when not found', async () => {
      qb.maybeSingle.mockResolvedValueOnce({ data: null, error: null })

      const result = await repo.findByCode('NOPE')
      expect(result).toBeNull()
    })
  })

  describe('updateRevealed', () => {
    it('updates is_revealed flag', async () => {
      qb.eq.mockResolvedValueOnce({ data: null, error: null })

      await repo.updateRevealed('uuid-1', true)

      expect(qb.update).toHaveBeenCalledWith({ is_revealed: true })
      expect(qb.eq).toHaveBeenCalledWith('id', 'uuid-1')
    })
  })
})
