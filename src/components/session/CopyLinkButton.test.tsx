import { render, within, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CopyLinkButton } from './CopyLinkButton'

const writeText = vi.fn().mockResolvedValue(undefined)

beforeEach(() => {
  writeText.mockClear()
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    writable: true,
    configurable: true,
  })
})

describe('CopyLinkButton', () => {
  it('renders "Copy link" text', () => {
    const { container } = render(<CopyLinkButton sessionCode="ABC123" />)
    expect(within(container).getByText('Copy link')).toBeInTheDocument()
  })

  it('copies session URL and shows confirmation', async () => {
    const { container } = render(<CopyLinkButton sessionCode="ABC123" />)
    const button = within(container).getByText('Copy link')

    await act(async () => {
      button.click()
    })

    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('/session/ABC123'),
    )
    expect(within(container).getByText('Copied!')).toBeInTheDocument()
  })
})
