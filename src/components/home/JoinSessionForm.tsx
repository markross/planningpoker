import { useState } from 'react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

interface JoinSessionFormProps {
  readonly onJoin: (code: string) => void
}

export function JoinSessionForm({ onJoin }: JoinSessionFormProps) {
  const [code, setCode] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (trimmed) onJoin(trimmed)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <h2 className="text-lg font-semibold text-gray-900">Join a session</h2>
      <div className="flex gap-2 items-end">
        <Input
          id="session-code"
          label="Session code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. ABC123"
          maxLength={6}
          required
        />
        <Button type="submit" variant="secondary" disabled={!code.trim()}>
          Join
        </Button>
      </div>
    </form>
  )
}
