export interface Session {
  readonly id: string
  readonly sessionCode: string
  readonly isRevealed: boolean
  readonly createdBy: string
  readonly createdAt: string
}
