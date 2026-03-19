import type { SupabaseClient } from '@supabase/supabase-js'
import type { Player } from '../types/player'

interface PlayerRow {
  id: string
  session_id: string
  user_id: string
  display_name: string
  created_at: string
}

function toPlayer(row: PlayerRow): Player {
  return {
    id: row.id,
    sessionId: row.session_id,
    userId: row.user_id,
    displayName: row.display_name,
    createdAt: row.created_at,
  }
}

export function createPlayerRepository(client: SupabaseClient) {
  return {
    async create(
      sessionId: string,
      userId: string,
      displayName: string,
    ): Promise<Player> {
      const { data, error } = await client
        .from('poker_players')
        .insert({
          session_id: sessionId,
          user_id: userId,
          display_name: displayName,
        })
        .select()
        .single()

      if (error) throw new Error(error.message)
      return toPlayer(data)
    },

    async findBySession(sessionId: string): Promise<readonly Player[]> {
      const { data, error } = await client
        .from('poker_players')
        .select()
        .eq('session_id', sessionId)

      if (error) throw new Error(error.message)
      return (data ?? []).map(toPlayer)
    },

    async remove(id: string): Promise<void> {
      const { error } = await client
        .from('poker_players')
        .delete()
        .eq('id', id)

      if (error) throw new Error(error.message)
    },

    async removeBySession(sessionId: string): Promise<void> {
      const { error } = await client
        .from('poker_players')
        .delete()
        .eq('session_id', sessionId)

      if (error) throw new Error(error.message)
    },
  }
}
