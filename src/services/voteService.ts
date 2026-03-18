import type { SupabaseClient } from '@supabase/supabase-js'
import { createVoteRepository } from '../repositories/voteRepository'
import { createSessionRepository } from '../repositories/sessionRepository'
import type { Vote } from '../types/vote'
import type { Estimate } from '../constants/estimates'

export function createVoteService(client: SupabaseClient) {
  const voteRepo = createVoteRepository(client)
  const sessionRepo = createSessionRepository(client)

  return {
    async submitVote(
      sessionId: string,
      playerId: string,
      estimate: Estimate,
    ): Promise<Vote> {
      return voteRepo.upsert(sessionId, playerId, estimate)
    },

    async loadVotes(
      sessionId: string,
    ): Promise<ReadonlyMap<string, Vote>> {
      const votes = await voteRepo.findBySession(sessionId)
      return new Map(votes.map((v) => [v.playerId, v]))
    },

    async revealVotes(sessionId: string): Promise<void> {
      await sessionRepo.updateRevealed(sessionId, true)
    },

    async clearVotes(sessionId: string): Promise<void> {
      await voteRepo.deleteBySession(sessionId)
      await sessionRepo.updateRevealed(sessionId, false)
    },
  }
}
