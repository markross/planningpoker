import type { Estimate } from '../constants/estimates'

export interface Vote {
  readonly id: string
  readonly sessionId: string
  readonly playerId: string
  readonly estimate: Estimate | null
  readonly updatedAt: string
}
