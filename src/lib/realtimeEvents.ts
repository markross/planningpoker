export const REALTIME_EVENTS = {
  REVEAL: 'reveal',
  CLEAR: 'clear',
} as const

export type RealtimeEvent = (typeof REALTIME_EVENTS)[keyof typeof REALTIME_EVENTS]
