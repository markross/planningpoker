import { render, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PlayerList } from './PlayerList'
import { buildPlayer } from '../../test/factories/playerFactory'
import { buildVote } from '../../test/factories/voteFactory'

describe('PlayerList', () => {
  it('renders empty state when no players', () => {
    const { container } = render(
      <PlayerList
        players={[]}
        votes={new Map()}
        isRevealed={false}
        currentUserId={null}
      />,
    )
    expect(within(container).getByText(/no players yet/i)).toBeInTheDocument()
  })

  it('renders player names', () => {
    const players = [
      buildPlayer({ id: 'p1', displayName: 'Alice', userId: 'u1' }),
      buildPlayer({ id: 'p2', displayName: 'Bob', userId: 'u2' }),
    ]
    const { container } = render(
      <PlayerList
        players={players}
        votes={new Map()}
        isRevealed={false}
        currentUserId="u1"
      />,
    )
    expect(within(container).getByText('Alice')).toBeInTheDocument()
    expect(within(container).getByText('Bob')).toBeInTheDocument()
  })

  it('shows vote status for each player', () => {
    const players = [
      buildPlayer({ id: 'p1', displayName: 'Alice', userId: 'u1' }),
    ]
    const votes = new Map([
      ['p1', buildVote({ playerId: 'p1', estimate: '5' })],
    ])
    const { container } = render(
      <PlayerList
        players={players}
        votes={votes}
        isRevealed={false}
        currentUserId="u1"
      />,
    )
    expect(within(container).getByText('Voted')).toBeInTheDocument()
  })
})
