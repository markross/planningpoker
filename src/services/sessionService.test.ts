import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createSessionService } from './sessionService'
import { createMockSupabaseClient } from '../test/mocks/supabaseMock'
import type { SupabaseClient } from '@supabase/supabase-js'

vi.mock('../lib/sessionCode', () => ({
  generateSessionCode: () => 'ABC123',
}))

describe('sessionService', () => {
  let mockClient: ReturnType<typeof createMockSupabaseClient>
  let service: ReturnType<typeof createSessionService>

  beforeEach(() => {
    mockClient = createMockSupabaseClient()
    service = createSessionService(mockClient as unknown as SupabaseClient)
  })

  describe('createSession', () => {
    it('creates session and player, returns session code', async () => {
      const sessionRow = {
        id: 'sess-1',
        session_code: 'ABC123',
        is_revealed: false,
        created_by: 'user-1',
        created_at: '2026-03-17T00:00:00Z',
      }
      const playerRow = {
        id: 'player-1',
        session_id: 'sess-1',
        user_id: 'user-1',
        display_name: 'Alice',
        created_at: '2026-03-17T00:00:00Z',
      }

      mockClient._queryBuilder.single
        .mockResolvedValueOnce({ data: sessionRow, error: null })
        .mockResolvedValueOnce({ data: playerRow, error: null })

      const result = await service.createSession('user-1', 'Alice')

      expect(result.sessionCode).toBe('ABC123')
      expect(result.session.id).toBe('sess-1')
      expect(mockClient.from).toHaveBeenCalledWith('poker_sessions')
      expect(mockClient.from).toHaveBeenCalledWith('poker_players')
    })
  })

  describe('loadSession', () => {
    it('returns null when session not found', async () => {
      mockClient._queryBuilder.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      const result = await service.loadSession('NOTFOUND')
      expect(result).toBeNull()
    })

    it('returns session and players when found', async () => {
      const sessionRow = {
        id: 'sess-1',
        session_code: 'ABC123',
        is_revealed: false,
        created_by: 'user-1',
        created_at: '2026-03-17T00:00:00Z',
      }

      // findByCode: select().eq().maybeSingle()
      mockClient._queryBuilder.maybeSingle.mockResolvedValueOnce({
        data: sessionRow,
        error: null,
      })
      // findBySession: select().eq() — eq resolves directly here
      // We need to keep chaining working, so mock eq to return builder first,
      // then resolve with data on the second call
      const builder = mockClient._queryBuilder
      const origEq = builder.eq.getMockImplementation()
      let eqCallCount = 0
      builder.eq.mockImplementation(() => {
        eqCallCount++
        // First two eq calls are from findByCode (session_code eq), chain normally
        // Third eq call is from findBySession (session_id eq), resolve with data
        if (eqCallCount <= 2) {
          return builder
        }
        return Promise.resolve({ data: [], error: null })
      })

      const result = await service.loadSession('ABC123')
      expect(result).not.toBeNull()
      expect(result!.session.sessionCode).toBe('ABC123')
      expect(result!.players).toEqual([])

      // Restore
      if (origEq) builder.eq.mockImplementation(origEq)
      else builder.eq.mockReturnValue(builder)
    })
  })

  describe('joinSession', () => {
    it('creates a player', async () => {
      const playerRow = {
        id: 'player-1',
        session_id: 'sess-1',
        user_id: 'user-1',
        display_name: 'Bob',
        created_at: '2026-03-17T00:00:00Z',
      }
      mockClient._queryBuilder.single.mockResolvedValueOnce({
        data: playerRow,
        error: null,
      })

      await expect(
        service.joinSession('sess-1', 'user-1', 'Bob'),
      ).resolves.toBeUndefined()
    })

    it('does not throw when player already exists', async () => {
      mockClient._queryBuilder.single.mockRejectedValueOnce(
        new Error('unique constraint'),
      )

      await expect(
        service.joinSession('sess-1', 'user-1', 'Bob'),
      ).resolves.toBeUndefined()
    })
  })

  describe('resetSession', () => {
    it('deletes votes, removes players, and resets revealed state', async () => {
      mockClient._queryBuilder.eq
        .mockResolvedValueOnce({ error: null })  // voteRepo.deleteBySession
        .mockResolvedValueOnce({ error: null })  // playerRepo.removeBySession
        .mockResolvedValueOnce({ error: null })  // sessionRepo.updateRevealed

      await expect(service.resetSession('sess-1')).resolves.toBeUndefined()

      expect(mockClient.from).toHaveBeenCalledWith('poker_votes')
      expect(mockClient.from).toHaveBeenCalledWith('poker_players')
      expect(mockClient.from).toHaveBeenCalledWith('poker_sessions')
    })

    it('throws when vote deletion fails', async () => {
      mockClient._queryBuilder.eq.mockResolvedValueOnce({
        error: { message: 'delete failed' },
      })

      await expect(service.resetSession('sess-1')).rejects.toThrow('delete failed')
    })
  })
})