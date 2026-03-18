import { describe, it, expect, beforeEach } from 'vitest'
import { createVoteService } from './voteService'
import { createMockSupabaseClient } from '../test/mocks/supabaseMock'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Estimate } from '../constants/estimates'

describe('voteService', () => {
  let mockClient: ReturnType<typeof createMockSupabaseClient>
  let service: ReturnType<typeof createVoteService>

  beforeEach(() => {
    mockClient = createMockSupabaseClient()
    service = createVoteService(mockClient as unknown as SupabaseClient)
  })

  describe('submitVote', () => {
    it('upserts and returns vote', async () => {
      const voteRow = {
        id: 'vote-1',
        session_id: 'sess-1',
        player_id: 'player-1',
        estimate: '5',
        updated_at: '2026-03-17T00:00:00Z',
      }
      mockClient._queryBuilder.single.mockResolvedValueOnce({
        data: voteRow,
        error: null,
      })

      const vote = await service.submitVote('sess-1', 'player-1', '5' as Estimate)
      expect(vote.estimate).toBe('5')
      expect(vote.playerId).toBe('player-1')
    })
  })

  describe('loadVotes', () => {
    it('returns a map of playerId to vote', async () => {
      const rows = [
        {
          id: 'v1',
          session_id: 's1',
          player_id: 'p1',
          estimate: '3',
          updated_at: '2026-03-17T00:00:00Z',
        },
        {
          id: 'v2',
          session_id: 's1',
          player_id: 'p2',
          estimate: '8',
          updated_at: '2026-03-17T00:00:00Z',
        },
      ]
      mockClient._queryBuilder.eq.mockResolvedValueOnce({
        data: rows,
        error: null,
      })

      const voteMap = await service.loadVotes('s1')
      expect(voteMap.size).toBe(2)
      expect(voteMap.get('p1')?.estimate).toBe('3')
      expect(voteMap.get('p2')?.estimate).toBe('8')
    })
  })

  describe('revealVotes', () => {
    it('calls updateRevealed with true', async () => {
      mockClient._queryBuilder.eq.mockResolvedValueOnce({ error: null })

      await expect(service.revealVotes('sess-1')).resolves.toBeUndefined()
      expect(mockClient.from).toHaveBeenCalledWith('poker_sessions')
    })
  })

  describe('clearVotes', () => {
    it('deletes votes and resets revealed state', async () => {
      mockClient._queryBuilder.eq
        .mockResolvedValueOnce({ error: null })
        .mockResolvedValueOnce({ error: null })

      await expect(service.clearVotes('sess-1')).resolves.toBeUndefined()
      expect(mockClient.from).toHaveBeenCalledWith('poker_votes')
      expect(mockClient.from).toHaveBeenCalledWith('poker_sessions')
    })
  })
})
