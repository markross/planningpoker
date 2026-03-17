import type { SupabaseClient } from '@supabase/supabase-js'
import type { Vote } from '../types/vote'
import type { Estimate } from '../constants/estimates'

interface VoteRow {
  id: string
  session_id: string
  player_id: string
  estimate: string | null
  updated_at: string
}

function toVote(row: VoteRow): Vote {
  return {
    id: row.id,
    sessionId: row.session_id,
    playerId: row.player_id,
    estimate: row.estimate as Estimate | null,
    updatedAt: row.updated_at,
  }
}

export function createVoteRepository(client: SupabaseClient) {
  return {
    async upsert(
      sessionId: string,
      playerId: string,
      estimate: Estimate,
    ): Promise<Vote> {
      const { data, error } = await client
        .from('poker_votes')
        .upsert(
          {
            session_id: sessionId,
            player_id: playerId,
            estimate,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'session_id,player_id' },
        )
        .select()
        .single()

      if (error) throw new Error(error.message)
      return toVote(data)
    },

    async findBySession(sessionId: string): Promise<readonly Vote[]> {
      const { data, error } = await client
        .from('poker_votes')
        .select()
        .eq('session_id', sessionId)

      if (error) throw new Error(error.message)
      return (data ?? []).map(toVote)
    },

    async deleteBySession(sessionId: string): Promise<void> {
      const { error } = await client
        .from('poker_votes')
        .delete()
        .eq('session_id', sessionId)

      if (error) throw new Error(error.message)
    },
  }
}
