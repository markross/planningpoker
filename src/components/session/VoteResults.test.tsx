import { render, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { VoteResults } from './VoteResults'
import { buildVote } from '../../test/factories/voteFactory'

describe('VoteResults', () => {
  it('shows no votes message when empty', () => {
    const { container } = render(<VoteResults votes={new Map()} />)
    expect(within(container).getByText('No votes submitted')).toBeInTheDocument()
  })

  it('displays average', () => {
    const votes = new Map([
      ['p1', buildVote({ playerId: 'p1', estimate: '3' })],
      ['p2', buildVote({ playerId: 'p2', estimate: '5' })],
    ])
    const { container } = render(<VoteResults votes={votes} />)
    expect(within(container).getByText('4.0')).toBeInTheDocument()
  })

  it('displays spread', () => {
    const votes = new Map([
      ['p1', buildVote({ playerId: 'p1', estimate: '1' })],
      ['p2', buildVote({ playerId: 'p2', estimate: '13' })],
    ])
    const { container } = render(<VoteResults votes={votes} />)
    // The spread is rendered as "min–max" with an en-dash
    const text = container.textContent ?? ''
    expect(text).toContain('1')
    expect(text).toContain('13')
  })

  it('shows consensus when all same', () => {
    const votes = new Map([
      ['p1', buildVote({ playerId: 'p1', estimate: '5' })],
      ['p2', buildVote({ playerId: 'p2', estimate: '5' })],
    ])
    const { container } = render(<VoteResults votes={votes} />)
    expect(within(container).getByText('Yes')).toBeInTheDocument()
  })

  it('shows unsure count when "?" votes exist', () => {
    const votes = new Map([
      ['p1', buildVote({ playerId: 'p1', estimate: '5' })],
      ['p2', buildVote({ playerId: 'p2', estimate: '?' })],
    ])
    const { container } = render(<VoteResults votes={votes} />)
    expect(within(container).getByText('1 player unsure')).toBeInTheDocument()
  })
})
