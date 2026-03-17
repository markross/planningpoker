import { useEffect, useState, useCallback } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface PresenceState {
  readonly userId: string
  readonly displayName: string
}

export function usePresence(
  channel: RealtimeChannel | null,
  userId: string | null,
  displayName: string,
): readonly PresenceState[] {
  const [presences, setPresences] = useState<readonly PresenceState[]>([])

  const syncPresences = useCallback((ch: RealtimeChannel) => {
    const state = ch.presenceState<PresenceState>()
    const users = Object.values(state)
      .flat()
      .map((p) => ({ userId: p.userId, displayName: p.displayName }))
    setPresences(users)
  }, [])

  useEffect(() => {
    if (!channel || !userId || !displayName) return

    channel.on('presence', { event: 'sync' }, () => {
      syncPresences(channel)
    })

    channel.track({ userId, displayName })

    return () => {
      channel.untrack()
    }
  }, [channel, userId, displayName, syncPresences])

  return presences
}
