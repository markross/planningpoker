import type { SupabaseClient } from '@supabase/supabase-js'
import { createSessionRepository } from '../repositories/sessionRepository'
import { createPlayerRepository } from '../repositories/playerRepository'
import { generateSessionCode } from '../lib/sessionCode'
import type { Session } from '../types/session'

interface CreateSessionResult {
  readonly session: Session
  readonly sessionCode: string
}

export function createSessionService(client: SupabaseClient) {
  const sessionRepo = createSessionRepository(client)
  const playerRepo = createPlayerRepository(client)

  return {
    async createSession(
      userId: string,
      displayName: string,
    ): Promise<CreateSessionResult> {
      const code = generateSessionCode()
      const session = await sessionRepo.create(code, userId)
      await playerRepo.create(session.id, userId, displayName)
      return { session, sessionCode: code }
    },

    async joinSession(
      sessionId: string,
      userId: string,
      displayName: string,
    ): Promise<void> {
      try {
        await playerRepo.create(sessionId, userId, displayName)
      } catch {
        // Player may already exist (unique constraint) — refresh list silently
      }
    },

    async loadSession(sessionCode: string) {
      const session = await sessionRepo.findByCode(sessionCode)
      if (!session) return null

      const players = await playerRepo.findBySession(session.id)
      return { session, players }
    },
  }
}
