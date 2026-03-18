import { useEffect, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { channelName } from '../lib/channelName'

export function useRealtimeChannel(
  sessionCode: string | undefined,
): RealtimeChannel | null {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!sessionCode) return

    const ch = supabase.channel(channelName(sessionCode))
    setChannel(ch)

    return () => {
      supabase.removeChannel(ch)
      setChannel(null)
    }
  }, [sessionCode])

  return channel
}
