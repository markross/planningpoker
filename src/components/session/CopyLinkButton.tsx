import { useState, useCallback } from 'react'
import { Button } from '../ui/Button'

interface CopyLinkButtonProps {
  readonly sessionCode: string
}

export function CopyLinkButton({ sessionCode }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    const url = `${window.location.origin}/session/${sessionCode}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [sessionCode])

  return (
    <Button variant="ghost" onClick={handleCopy}>
      {copied ? 'Copied!' : 'Copy link'}
    </Button>
  )
}
