import { useEffect } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Vote } from '../types/vote'
import type { Estimate } from '../constants/estimates'

interface VotePayload {
  id: string
  session_id: string
  player_id: string
  estimate: string | null
  updated_at: string
}

function toVote(row: VotePayload): Vote {
  return {
    id: row.id,
    sessionId: row.session_id,
    playerId: row.player_id,
    estimate: row.estimate as Estimate | null,
    updatedAt: row.updated_at,
  }
}

export function useVoteChanges(
  channel: RealtimeChannel | null,
  sessionId: string | null,
  onVoteChange: (vote: Vote) => void,
): void {
  useEffect(() => {
    if (!channel || !sessionId) return

    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'poker_votes',
        filter: `session_id=eq.${sessionId}`,
      },
      (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          onVoteChange(toVote(payload.new as VotePayload))
        }
      },
    )
  }, [channel, sessionId, onVoteChange])
}
