import { useState } from 'react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

interface JoinSessionFormProps {
  readonly onJoin: (code: string) => void
}

const RANDOM_CODE_PATTERN = /^[A-Za-z0-9]{6}$/

function normalizeCode(value: string): string {
  const trimmed = value.trim()
  // If it looks like a 6-char random code, uppercase it
  if (RANDOM_CODE_PATTERN.test(trimmed)) return trimmed.toUpperCase()
  return trimmed
}

export function JoinSessionForm({ onJoin }: JoinSessionFormProps) {
  const [code, setCode] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const normalized = normalizeCode(code)
    if (normalized) onJoin(normalized)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <h2 className="text-lg font-semibold text-gray-900">Join a session</h2>
      <div className="flex gap-2 items-end">
        <Input
          id="session-code"
          label="Session code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. ABC123 or sprint-42"
          maxLength={50}
          required
        />
        <Button type="submit" variant="secondary" disabled={!code.trim()}>
          Join
        </Button>
      </div>
    </form>
  )
}
