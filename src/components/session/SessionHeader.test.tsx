import { render, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SessionHeader } from './SessionHeader'

describe('SessionHeader', () => {
  it('renders session code', () => {
    const { container } = render(
      <SessionHeader sessionCode="ABC123" gamePhase="LOBBY" playerCount={3} />,
    )
    expect(within(container).getByText('ABC123')).toBeInTheDocument()
  })

  it('renders player count', () => {
    const { container } = render(
      <SessionHeader sessionCode="ABC123" gamePhase="VOTING" playerCount={5} />,
    )
    expect(within(container).getByText('5 players')).toBeInTheDocument()
  })

  it('renders singular player for count of 1', () => {
    const { container } = render(
      <SessionHeader sessionCode="ABC123" gamePhase="LOBBY" playerCount={1} />,
    )
    expect(within(container).getByText('1 player')).toBeInTheDocument()
  })

  it('renders game phase label', () => {
    const { container } = render(
      <SessionHeader sessionCode="ABC123" gamePhase="REVEALED" playerCount={2} />,
    )
    expect(within(container).getByText('Votes revealed')).toBeInTheDocument()
  })
})
