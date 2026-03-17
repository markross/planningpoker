import type { SupabaseClient } from '@supabase/supabase-js'
import type { Session } from '../types/session'

interface SessionRow {
  id: string
  session_code: string
  is_revealed: boolean
  created_by: string
  created_at: string
}

function toSession(row: SessionRow): Session {
  return {
    id: row.id,
    sessionCode: row.session_code,
    isRevealed: row.is_revealed,
    createdBy: row.created_by,
    createdAt: row.created_at,
  }
}

export function createSessionRepository(client: SupabaseClient) {
  return {
    async create(sessionCode: string, createdBy: string): Promise<Session> {
      const { data, error } = await client
        .from('poker_sessions')
        .insert({ session_code: sessionCode, created_by: createdBy })
        .select()
        .single()

      if (error) throw new Error(error.message)
      return toSession(data)
    },

    async findByCode(sessionCode: string): Promise<Session | null> {
      const { data, error } = await client
        .from('poker_sessions')
        .select()
        .eq('session_code', sessionCode)
        .maybeSingle()

      if (error) throw new Error(error.message)
      return data ? toSession(data) : null
    },

    async updateRevealed(id: string, isRevealed: boolean): Promise<void> {
      const { error } = await client
        .from('poker_sessions')
        .update({ is_revealed: isRevealed })
        .eq('id', id)

      if (error) throw new Error(error.message)
    },
  }
}
