import { Button } from '../ui/Button'

interface CreateSessionFormProps {
  readonly onCreateSession: () => void
  readonly isLoading: boolean
}

export function CreateSessionForm({
  onCreateSession,
  isLoading,
}: CreateSessionFormProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-gray-900">Start a new session</h2>
      <Button onClick={onCreateSession} disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create session'}
      </Button>
    </div>
  )
}
