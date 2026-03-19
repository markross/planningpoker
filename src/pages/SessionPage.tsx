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
import { useGameState } from '../hooks/useGameState'

export function SessionPage() {
  const { sessionCode } = useParams<{ sessionCode: string }>()
  const navigate = useNavigate()
  const { userId, isLoading: authLoading } = useAuth()
  const [displayName, setDisplayName] = useLocalStorage('displayName', '')

  const {
    session,
    players,
    votes,
    myVote,
    gamePhase,
    isLoading,
    error,
    selectEstimate,
    reveal,
    clear,
  } = useGameState({ sessionCode, userId, displayName, authLoading })

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
    if (error) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-gray-500">Session not found</p>
            <Button variant="ghost" onClick={() => navigate('/', { replace: true })}>
              Go home
            </Button>
          </div>
        </div>
      )
    }
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
          selectedEstimate={myVote}
          onSelect={selectEstimate}
          isRevealed={gamePhase === 'REVEALED'}
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
                <Button onClick={reveal} disabled={votes.size === 0}>
                  Reveal votes
                </Button>
              )}
              {gamePhase === 'REVEALED' && (
                <Button onClick={clear}>New round</Button>
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
