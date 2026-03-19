import { useState } from 'react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { toSlug, validateSessionSlug } from '../../lib/sessionSlug'

interface CreateSessionFormProps {
  readonly onCreateSession: (customSlug?: string) => void
  readonly isLoading: boolean
}

export function CreateSessionForm({
  onCreateSession,
  isLoading,
}: CreateSessionFormProps) {
  const [slugInput, setSlugInput] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const converted = toSlug(e.target.value)
    setSlugInput(converted)
    setValidationError(converted ? validateSessionSlug(converted) : null)
  }

  const handleCreate = () => {
    const slug = slugInput.trim()
    if (slug) {
      const error = validateSessionSlug(slug)
      if (error) {
        setValidationError(error)
        return
      }
      onCreateSession(slug)
    } else {
      onCreateSession()
    }
  }

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-gray-900">Start a new session</h2>
      <Input
        id="session-slug"
        label="Session name (optional)"
        value={slugInput}
        onChange={handleSlugChange}
        placeholder="e.g. sprint-42"
        maxLength={50}
      />
      {validationError && (
        <p className="text-sm text-red-600">{validationError}</p>
      )}
      <Button onClick={handleCreate} disabled={isLoading || !!validationError}>
        {isLoading ? 'Creating...' : 'Create session'}
      </Button>
    </div>
  )
}
