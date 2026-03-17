import { useEffect, useCallback } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { REALTIME_EVENTS } from '../lib/realtimeEvents'

export function useBroadcast(
  channel: RealtimeChannel | null,
  onReveal: () => void,
  onClear: () => void,
) {
  useEffect(() => {
    if (!channel) return

    channel.on('broadcast', { event: REALTIME_EVENTS.REVEAL }, () => {
      onReveal()
    })

    channel.on('broadcast', { event: REALTIME_EVENTS.CLEAR }, () => {
      onClear()
    })
  }, [channel, onReveal, onClear])

  const broadcastReveal = useCallback(() => {
    channel?.send({
      type: 'broadcast',
      event: REALTIME_EVENTS.REVEAL,
      payload: {},
    })
  }, [channel])

  const broadcastClear = useCallback(() => {
    channel?.send({
      type: 'broadcast',
      event: REALTIME_EVENTS.CLEAR,
      payload: {},
    })
  }, [channel])

  return { broadcastReveal, broadcastClear }
}
