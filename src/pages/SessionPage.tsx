import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { SessionHeader } from '../components/session/SessionHeader'
import { CardDeck } from '../components/session/CardDeck'
import { PlayerList } from '../components/session/PlayerList'
import { VoteResults } from '../components/session/VoteResults'
import { CopyLinkButton } from '../components/session/CopyLinkButton'
import { NameEntry } from '../components/home/NameEntry'
import { Button } from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { createSessionRepository } from '../repositories/sessionRepository'
import { createPlayerRepository } from '../repositories/playerRepository'
import { createVoteRepository } from '../repositories/voteRepository'
import { supabase } from '../lib/supabase'
import type { Session } from '../types/session'
import type { Player } from '../types/player'
import type { Vote } from '../types/vote'
import type { Estimate } from '../constants/estimates'

type GamePhase = 'LOBBY' | 'VOTING' | 'REVEALED'

function derivePhase(
  votes: ReadonlyMap<string, Vote>,
  isRevealed: boolean,
): GamePhase {
  if (isRevealed) return 'REVEALED'
  if (votes.size > 0) return 'VOTING'
  return 'LOBBY'
}

export function SessionPage() {
  const { sessionCode } = useParams<{ sessionCode: string }>()
  const navigate = useNavigate()
  const { userId, isLoading: authLoading } = useAuth()
  const [displayName, setDisplayName] = useLocalStorage('displayName', '')

  const [session, setSession] = useState<Session | null>(null)
  const [players, setPlayers] = useState<readonly Player[]>([])
  const [votes, setVotes] = useState<ReadonlyMap<string, Vote>>(new Map())
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const currentPlayer = players.find((p) => p.userId === userId)
  const gamePhase = derivePhase(votes, session?.isRevealed ?? false)

  // Load session data
  useEffect(() => {
    if (!sessionCode || !userId || authLoading) return

    const load = async () => {
      try {
        const sessionRepo = createSessionRepository(supabase)
        const found = await sessionRepo.findByCode(sessionCode)
        if (!found) {
          navigate('/', { replace: true })
          return
        }
        setSession(found)

        const playerRepo = createPlayerRepository(supabase)
        const sessionPlayers = await playerRepo.findBySession(found.id)
        setPlayers(sessionPlayers)

        const voteRepo = createVoteRepository(supabase)
        const sessionVotes = await voteRepo.findBySession(found.id)
        const voteMap = new Map(sessionVotes.map((v) => [v.playerId, v]))
        setVotes(voteMap)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session')
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [sessionCode, userId, authLoading, navigate])

  // Auto-join session when name is set
  useEffect(() => {
    if (!session || !userId || !displayName || currentPlayer) return

    const join = async () => {
      try {
        const playerRepo = createPlayerRepository(supabase)
        const player = await playerRepo.create(session.id, userId, displayName)
        setPlayers((prev) => [...prev, player])
      } catch {
        // Already joined (unique constraint) — reload players
        const playerRepo = createPlayerRepository(supabase)
        const sessionPlayers = await playerRepo.findBySession(session.id)
        setPlayers(sessionPlayers)
      }
    }

    join()
  }, [session, userId, displayName, currentPlayer])

  const handleSelectEstimate = useCallback(
    async (estimate: Estimate) => {
      if (!session || !currentPlayer) return
      setSelectedEstimate(estimate)

      try {
        const voteRepo = createVoteRepository(supabase)
        const vote = await voteRepo.upsert(session.id, currentPlayer.id, estimate)
        setVotes((prev) => new Map([...prev, [currentPlayer.id, vote]]))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to submit vote')
      }
    },
    [session, currentPlayer],
  )

  const handleReveal = useCallback(async () => {
    if (!session) return
    try {
      const sessionRepo = createSessionRepository(supabase)
      await sessionRepo.updateRevealed(session.id, true)
      setSession({ ...session, isRevealed: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reveal votes')
    }
  }, [session])

  const handleClear = useCallback(async () => {
    if (!session) return
    try {
      const voteRepo = createVoteRepository(supabase)
      await voteRepo.deleteBySession(session.id)
      const sessionRepo = createSessionRepository(supabase)
      await sessionRepo.updateRevealed(session.id, false)
      setSession({ ...session, isRevealed: false })
      setVotes(new Map())
      setSelectedEstimate(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear votes')
    }
  }, [session])

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading session...</p>
      </div>
    )
  }

  if (!displayName) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4 max-w-sm w-full">
          <h2 className="text-lg font-semibold text-gray-900 text-center">
            Enter your name to join
          </h2>
          <NameEntry initialName="" onSubmit={setDisplayName} />
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Session not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SessionHeader
        sessionCode={session.sessionCode}
        gamePhase={gamePhase}
        playerCount={players.length}
      />

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="flex justify-end">
          <CopyLinkButton sessionCode={session.sessionCode} />
        </div>

        <CardDeck
          selectedEstimate={selectedEstimate}
          onSelect={handleSelectEstimate}
          disabled={gamePhase === 'REVEALED'}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Players</h3>
            <PlayerList
              players={players}
              votes={votes}
              isRevealed={session.isRevealed}
              currentUserId={userId}
            />
          </div>

          <div className="space-y-4">
            {gamePhase === 'REVEALED' && <VoteResults votes={votes} />}

            <div className="flex gap-3 justify-center">
              {gamePhase !== 'REVEALED' && (
                <Button onClick={handleReveal} disabled={votes.size === 0}>
                  Reveal votes
                </Button>
              )}
              {gamePhase === 'REVEALED' && (
                <Button onClick={handleClear}>New round</Button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}
      </div>
    </div>
  )
}
