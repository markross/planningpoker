import { useEffect, useRef } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { channelName } from '../lib/channelName'

export function useRealtimeChannel(
  sessionCode: string | undefined,
): RealtimeChannel | null {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!sessionCode) return

    const channel = supabase.channel(channelName(sessionCode))
    channelRef.current = channel

    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [sessionCode])

  return channelRef.current
}
