import { render, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PlayerItem } from './PlayerItem'

describe('PlayerItem', () => {
  const baseProps = {
    displayName: 'Alice',
    hasVoted: false,
    estimate: null,
    isRevealed: false,
    isCurrentUser: false,
  }

  it('renders the player name', () => {
    const { container } = render(<PlayerItem {...baseProps} />)
    expect(within(container).getByText('Alice')).toBeInTheDocument()
  })

  it('shows "(you)" for current user', () => {
    const { container } = render(<PlayerItem {...baseProps} isCurrentUser />)
    expect(within(container).getByText('(you)')).toBeInTheDocument()
  })

  it('shows "Waiting" when not voted', () => {
    const { container } = render(<PlayerItem {...baseProps} />)
    expect(within(container).getByText('Waiting')).toBeInTheDocument()
  })

  it('shows "Voted" when voted but not revealed', () => {
    const { container } = render(<PlayerItem {...baseProps} hasVoted />)
    expect(within(container).getByText('Voted')).toBeInTheDocument()
  })

  it('shows estimate value when revealed', () => {
    const { container } = render(
      <PlayerItem {...baseProps} hasVoted isRevealed estimate="8" />,
    )
    expect(within(container).getByText('8')).toBeInTheDocument()
  })
})
