import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { NameEntry } from '../components/home/NameEntry'
import { CreateSessionForm } from '../components/home/CreateSessionForm'
import { JoinSessionForm } from '../components/home/JoinSessionForm'
import { useAuth } from '../contexts/AuthContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { createSessionService } from '../services/sessionService'
import { supabase } from '../lib/supabase'

export function HomePage() {
  const { userId, isLoading: authLoading } = useAuth()
  const [displayName, setDisplayName] = useLocalStorage('displayName', '')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const sessionService = useMemo(() => createSessionService(supabase), [])

  const handleCreateSession = useCallback(async () => {
    if (!userId || !displayName) return
    setIsCreating(true)
    setError(null)

    try {
      const { sessionCode } = await sessionService.createSession(userId, displayName)
      navigate(`/session/${sessionCode}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session')
    } finally {
      setIsCreating(false)
    }
  }, [userId, displayName, navigate, sessionService])

  const handleJoin = useCallback(
    (code: string) => {
      navigate(`/session/${code}`)
    },
    [navigate],
  )

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Planning Poker</h1>
          <p className="mt-2 text-gray-600">
            Estimate as a team using fibonacci values
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <NameEntry initialName={displayName} onSubmit={setDisplayName} />

          {displayName && (
            <>
              <hr className="border-gray-200" />
              <CreateSessionForm
                onCreateSession={handleCreateSession}
                isLoading={isCreating}
              />
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">or</span>
                </div>
              </div>
              <JoinSessionForm onJoin={handleJoin} />
            </>
          )}

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}
        </div>
      </div>
    </div>
  )
}
