import { describe, it, expect, beforeEach } from 'vitest'
import { createMockSupabaseClient } from '../test/mocks/supabaseMock'
import { createVoteRepository } from './voteRepository'

describe('voteRepository', () => {
  const mockClient = createMockSupabaseClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const repo = createVoteRepository(mockClient as any)
  const qb = mockClient._queryBuilder

  beforeEach(() => {
    Object.values(qb).forEach((fn) => fn.mockClear())
    mockClient.from.mockClear()
  })

  describe('upsert', () => {
    it('upserts a vote', async () => {
      const dbRow = {
        id: 'v-1',
        session_id: 's-1',
        player_id: 'p-1',
        estimate: '5',
        updated_at: '2026-03-17T00:00:00Z',
      }
      qb.single.mockResolvedValueOnce({ data: dbRow, error: null })

      const result = await repo.upsert('s-1', 'p-1', '5')

      expect(qb.upsert).toHaveBeenCalledWith(
        {
          session_id: 's-1',
          player_id: 'p-1',
          estimate: '5',
          updated_at: expect.any(String),
        },
        { onConflict: 'session_id,player_id' },
      )
      expect(result.estimate).toBe('5')
    })
  })

  describe('findBySession', () => {
    it('returns votes for a session', async () => {
      const dbRows = [
        {
          id: 'v-1',
          session_id: 's-1',
          player_id: 'p-1',
          estimate: '8',
          updated_at: '2026-03-17T00:00:00Z',
        },
      ]
      qb.eq.mockResolvedValueOnce({ data: dbRows, error: null })

      const result = await repo.findBySession('s-1')

      expect(result).toHaveLength(1)
      expect(result[0].playerId).toBe('p-1')
    })
  })

  describe('deleteBySession', () => {
    it('deletes all votes for a session', async () => {
      qb.eq.mockResolvedValueOnce({ data: null, error: null })

      await repo.deleteBySession('s-1')

      expect(mockClient.from).toHaveBeenCalledWith('poker_votes')
      expect(qb.eq).toHaveBeenCalledWith('session_id', 's-1')
    })
  })
})
