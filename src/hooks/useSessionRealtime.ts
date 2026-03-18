import { useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { channelName } from '../lib/channelName'
import { REALTIME_EVENTS } from '../lib/realtimeEvents'
import type { Vote } from '../types/vote'
import type { Player } from '../types/player'
import type { Estimate } from '../constants/estimates'

interface VotePayload {
  readonly id: string
  readonly session_id: string
  readonly player_id: string
  readonly estimate: string | null
  readonly updated_at: string
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

interface PlayerPayload {
  readonly id: string
  readonly session_id: string
  readonly user_id: string
  readonly display_name: string
  readonly created_at: string
}

function toPlayer(row: PlayerPayload): Player {
  return {
    id: row.id,
    sessionId: row.session_id,
    userId: row.user_id,
    displayName: row.display_name,
    createdAt: row.created_at,
  }
}

interface UseSessionRealtimeParams {
  readonly sessionId: string | null
  readonly sessionCode: string | undefined
  readonly userId: string | null
  readonly displayName: string
  readonly onVoteChange: (vote: Vote) => void
  readonly onPlayerJoin: (player: Player) => void
  readonly onReveal: () => void
  readonly onClear: () => void
}

interface UseSessionRealtimeResult {
  readonly broadcastReveal: () => void
  readonly broadcastClear: () => void
}

export function useSessionRealtime({
  sessionId,
  sessionCode,
  userId,
  displayName,
  onVoteChange,
  onPlayerJoin,
  onReveal,
  onClear,
}: UseSessionRealtimeParams): UseSessionRealtimeResult {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  // Store callbacks in refs to avoid re-subscribing on every render
  const onVoteChangeRef = useRef(onVoteChange)
  const onPlayerJoinRef = useRef(onPlayerJoin)
  const onRevealRef = useRef(onReveal)
  const onClearRef = useRef(onClear)

  useEffect(() => { onVoteChangeRef.current = onVoteChange }, [onVoteChange])
  useEffect(() => { onPlayerJoinRef.current = onPlayerJoin }, [onPlayerJoin])
  useEffect(() => { onRevealRef.current = onReveal }, [onReveal])
  useEffect(() => { onClearRef.current = onClear }, [onClear])

  useEffect(() => {
    if (!sessionCode || !sessionId || !userId || !displayName) return

    const ch = supabase.channel(channelName(sessionCode))
    channelRef.current = ch

    // Register ALL listeners BEFORE subscribing

    // 1. Vote changes (insert + update)
    ch.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'poker_votes',
        filter: `session_id=eq.${sessionId}`,
      },
      (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          onVoteChangeRef.current(toVote(payload.new as VotePayload))
        }
      },
    )

    // 2. Player changes (new players joining)
    ch.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'poker_players',
        filter: `session_id=eq.${sessionId}`,
      },
      (payload) => {
        onPlayerJoinRef.current(toPlayer(payload.new as PlayerPayload))
      },
    )

    // 3. Broadcast events (reveal + clear)
    ch.on('broadcast', { event: REALTIME_EVENTS.REVEAL }, () => {
      onRevealRef.current()
    })

    ch.on('broadcast', { event: REALTIME_EVENTS.CLEAR }, () => {
      onClearRef.current()
    })

    // 4. Presence
    ch.on('presence', { event: 'sync' }, () => {
      // Presence sync — could expose online users if needed
    })

    // NOW subscribe after all listeners are registered
    ch.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await ch.track({ userId, displayName })
      }
    })

    return () => {
      supabase.removeChannel(ch)
      channelRef.current = null
    }
  }, [sessionCode, sessionId, userId, displayName])

  const broadcastReveal = useCallback(() => {
    channelRef.current?.send({
      type: 'broadcast',
      event: REALTIME_EVENTS.REVEAL,
      payload: {},
    })
  }, [])

  const broadcastClear = useCallback(() => {
    channelRef.current?.send({
      type: 'broadcast',
      event: REALTIME_EVENTS.CLEAR,
      payload: {},
    })
  }, [])

  return { broadcastReveal, broadcastClear }
}
