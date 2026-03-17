import { useEffect, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected'

export function useConnectionStatus(
  channel: RealtimeChannel | null,
): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>('connecting')

  useEffect(() => {
    if (!channel) {
      setStatus('disconnected')
      return
    }

    const handleStatus = (state: string) => {
      switch (state) {
        case 'SUBSCRIBED':
          setStatus('connected')
          break
        case 'CHANNEL_ERROR':
        case 'TIMED_OUT':
        case 'CLOSED':
          setStatus('disconnected')
          break
        default:
          setStatus('connecting')
      }
    }

    channel.on('system', {}, (payload) => {
      if (typeof payload === 'object' && payload !== null && 'status' in payload) {
        handleStatus(payload.status as string)
      }
    })
  }, [channel])

  return status
}
