export const REALTIME_EVENTS = {
  REVEAL: 'reveal',
  CLEAR: 'clear',
  RESET: 'reset',
} as const

export type RealtimeEvent = (typeof REALTIME_EVENTS)[keyof typeof REALTIME_EVENTS]
