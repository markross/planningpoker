import { useState } from 'react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

interface NameEntryProps {
  readonly initialName: string
  readonly onSubmit: (name: string) => void
}

export function NameEntry({ initialName, onSubmit }: NameEntryProps) {
  const [name, setName] = useState(initialName)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed) onSubmit(trimmed)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <Input
        id="display-name"
        label="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
        required
        maxLength={30}
      />
      <Button type="submit" disabled={!name.trim()}>
        Set name
      </Button>
    </form>
  )
}
