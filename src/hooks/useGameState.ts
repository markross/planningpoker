import { useEffect, useState, useCallback, useMemo } from 'react'
import { useSessionRealtime } from './useSessionRealtime'
import { createSessionService } from '../services/sessionService'
import { createVoteService } from '../services/voteService'
import { supabase } from '../lib/supabase'
import { derivePhase } from '../types/gamePhase'
import type { GamePhase } from '../types/gamePhase'
import type { Session } from '../types/session'
import type { Player } from '../types/player'
import type { Vote } from '../types/vote'
import type { Estimate } from '../constants/estimates'

interface UseGameStateParams {
  readonly sessionCode: string | undefined
  readonly userId: string | null
  readonly displayName: string
  readonly authLoading: boolean
}

interface UseGameStateResult {
  readonly session: Session | null
  readonly players: readonly Player[]
  readonly votes: ReadonlyMap<string, Vote>
  readonly myVote: Estimate | null
  readonly gamePhase: GamePhase
  readonly isRevealed: boolean
  readonly isLoading: boolean
  readonly error: string | null
  readonly selectEstimate: (estimate: Estimate) => Promise<void>
  readonly reveal: () => Promise<void>
  readonly clear: () => Promise<void>
}

export function useGameState({
  sessionCode,
  userId,
  displayName,
  authLoading,
}: UseGameStateParams): UseGameStateResult {
  const [session, setSession] = useState<Session | null>(null)
  const [players, setPlayers] = useState<readonly Player[]>([])
  const [votes, setVotes] = useState<ReadonlyMap<string, Vote>>(new Map())
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const sessionService = useMemo(() => createSessionService(supabase), [])
  const voteService = useMemo(() => createVoteService(supabase), [])

  const currentPlayer = players.find((p) => p.userId === userId)
  const gamePhase = derivePhase(votes.size, session?.isRevealed ?? false)

  // Realtime callbacks
  const handleVoteChange = useCallback((vote: Vote) => {
    setVotes((prev) => new Map([...prev, [vote.playerId, vote]]))
  }, [])

  const handlePlayerJoin = useCallback((player: Player) => {
    setPlayers((prev) => {
      if (prev.some((p) => p.id === player.id)) return prev
      return [...prev, player]
    })
  }, [])

  const handleRemoteReveal = useCallback(() => {
    setSession((prev) => (prev ? { ...prev, isRevealed: true } : prev))
  }, [])

  const handleRemoteClear = useCallback(() => {
    setSession((prev) => (prev ? { ...prev, isRevealed: false } : prev))
    setVotes(new Map())
    setSelectedEstimate(null)
  }, [])

  const { broadcastReveal, broadcastClear } = useSessionRealtime({
    sessionId: session?.id ?? null,
    sessionCode,
    userId,
    displayName,
    onVoteChange: handleVoteChange,
    onPlayerJoin: handlePlayerJoin,
    onReveal: handleRemoteReveal,
    onClear: handleRemoteClear,
  })

  // Load session data
  useEffect(() => {
    if (!sessionCode || !userId || authLoading) return

    let cancelled = false
    const load = async () => {
      try {
        const result = await sessionService.loadSession(sessionCode)
        if (cancelled) return
        if (!result) {
          setError('Session not found')
          setIsLoading(false)
          return
        }
        setSession(result.session)
        setPlayers(result.players)

        const voteMap = await voteService.loadVotes(result.session.id)
        if (cancelled) return
        setVotes(voteMap)

        const myPlayer = result.players.find((p) => p.userId === userId)
        const existingVote = myPlayer ? voteMap.get(myPlayer.id) : undefined
        if (existingVote?.estimate) setSelectedEstimate(existingVote.estimate)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load session')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [sessionCode, userId, authLoading, sessionService, voteService])

  // Auto-join session when name is set
  useEffect(() => {
    if (!session || !userId || !displayName || currentPlayer) return

    const join = async () => {
      await sessionService.joinSession(session.id, userId, displayName)
      const result = await sessionService.loadSession(session.sessionCode)
      if (result) setPlayers(result.players)
    }

    join()
  }, [session, userId, displayName, currentPlayer, sessionService])

  const selectEstimate = useCallback(
    async (estimate: Estimate) => {
      if (!session || !currentPlayer) return
      setSelectedEstimate(estimate)

      try {
        const vote = await voteService.submitVote(session.id, currentPlayer.id, estimate)
        setVotes((prev) => new Map([...prev, [currentPlayer.id, vote]]))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to submit vote')
      }
    },
    [session, currentPlayer, voteService],
  )

  const reveal = useCallback(async () => {
    if (!session) return
    try {
      await voteService.revealVotes(session.id)
      setSession({ ...session, isRevealed: true })
      broadcastReveal()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reveal votes')
    }
  }, [session, broadcastReveal, voteService])

  const clear = useCallback(async () => {
    if (!session) return
    try {
      await voteService.clearVotes(session.id)
      setSession({ ...session, isRevealed: false })
      setVotes(new Map())
      setSelectedEstimate(null)
      broadcastClear()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear votes')
    }
  }, [session, broadcastClear, voteService])

  return {
    session,
    players,
    votes,
    myVote: selectedEstimate,
    gamePhase,
    isRevealed: session?.isRevealed ?? false,
    isLoading,
    error,
    selectEstimate,
    reveal,
    clear,
  }
}
