import type { SupabaseClient } from '@supabase/supabase-js'
import { createSessionRepository } from '../repositories/sessionRepository'
import { createPlayerRepository } from '../repositories/playerRepository'
import { createVoteRepository } from '../repositories/voteRepository'
import { generateSessionCode } from '../lib/sessionCode'
import { validateSessionSlug } from '../lib/sessionSlug'
import type { Session } from '../types/session'

interface CreateSessionResult {
  readonly session: Session
  readonly sessionCode: string
}

export function createSessionService(client: SupabaseClient) {
  const sessionRepo = createSessionRepository(client)
  const playerRepo = createPlayerRepository(client)
  const voteRepo = createVoteRepository(client)

  return {
    async createSession(
      userId: string,
      displayName: string,
      customSlug?: string,
    ): Promise<CreateSessionResult> {
      let code: string

      if (customSlug) {
        const validationError = validateSessionSlug(customSlug)
        if (validationError) throw new Error(validationError)

        const exists = await sessionRepo.checkCodeExists(customSlug)
        if (exists) throw new Error('That session name is already taken')

        code = customSlug
      } else {
        code = generateSessionCode()
      }

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

    async resetSession(sessionId: string): Promise<void> {
      await voteRepo.deleteBySession(sessionId)
      await playerRepo.removeBySession(sessionId)
      await sessionRepo.updateRevealed(sessionId, false)
    },

    async loadSession(sessionCode: string) {
      const session = await sessionRepo.findByCode(sessionCode)
      if (!session) return null

      const players = await playerRepo.findBySession(session.id)
      return { session, players }
    },
  }
}
