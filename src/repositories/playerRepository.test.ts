import { describe, it, expect, beforeEach } from 'vitest'
import { createMockSupabaseClient } from '../test/mocks/supabaseMock'
import { createPlayerRepository } from './playerRepository'
import type { Player } from '../types/player'

describe('playerRepository', () => {
  const mockClient = createMockSupabaseClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const repo = createPlayerRepository(mockClient as any)
  const qb = mockClient._queryBuilder

  beforeEach(() => {
    Object.values(qb).forEach((fn) => fn.mockClear())
    mockClient.from.mockClear()
  })

  describe('create', () => {
    it('inserts a player and returns it', async () => {
      const dbRow = {
        id: 'p-1',
        session_id: 's-1',
        user_id: 'u-1',
        display_name: 'Alice',
        created_at: '2026-03-17T00:00:00Z',
      }
      const expected: Player = {
        id: 'p-1',
        sessionId: 's-1',
        userId: 'u-1',
        displayName: 'Alice',
        createdAt: '2026-03-17T00:00:00Z',
      }
      qb.single.mockResolvedValueOnce({ data: dbRow, error: null })

      const result = await repo.create('s-1', 'u-1', 'Alice')

      expect(mockClient.from).toHaveBeenCalledWith('poker_players')
      expect(qb.insert).toHaveBeenCalledWith({
        session_id: 's-1',
        user_id: 'u-1',
        display_name: 'Alice',
      })
      expect(result).toEqual(expected)
    })
  })

  describe('findBySession', () => {
    it('returns players for a session', async () => {
      const dbRows = [
        {
          id: 'p-1',
          session_id: 's-1',
          user_id: 'u-1',
          display_name: 'Alice',
          created_at: '2026-03-17T00:00:00Z',
        },
      ]
      qb.eq.mockResolvedValueOnce({ data: dbRows, error: null })

      const result = await repo.findBySession('s-1')

      expect(qb.eq).toHaveBeenCalledWith('session_id', 's-1')
      expect(result).toHaveLength(1)
      expect(result[0].displayName).toBe('Alice')
    })
  })

  describe('remove', () => {
    it('deletes a player by id', async () => {
      qb.eq.mockResolvedValueOnce({ data: null, error: null })

      await repo.remove('p-1')

      expect(mockClient.from).toHaveBeenCalledWith('poker_players')
      expect(qb.eq).toHaveBeenCalledWith('id', 'p-1')
    })
  })
})
