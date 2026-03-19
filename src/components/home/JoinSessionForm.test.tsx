import { render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { JoinSessionForm } from './JoinSessionForm'

const PLACEHOLDER = 'e.g. ABC123 or sprint-42'

describe('JoinSessionForm', () => {
  it('renders session code input', () => {
    const { container } = render(<JoinSessionForm onJoin={vi.fn()} />)
    expect(within(container).getByPlaceholderText(PLACEHOLDER)).toBeInTheDocument()
  })

  it('accepts input as typed', async () => {
    const user = userEvent.setup()
    const { container } = render(<JoinSessionForm onJoin={vi.fn()} />)

    await user.type(within(container).getByPlaceholderText(PLACEHOLDER), 'abc123')
    expect(within(container).getByDisplayValue('abc123')).toBeInTheDocument()
  })

  it('uppercases 6-char codes on submit', async () => {
    const user = userEvent.setup()
    const onJoin = vi.fn()
    const { container } = render(<JoinSessionForm onJoin={onJoin} />)
    const scope = within(container)

    await user.type(scope.getByPlaceholderText(PLACEHOLDER), 'abc123')
    await user.click(scope.getByText('Join'))

    expect(onJoin).toHaveBeenCalledWith('ABC123')
  })

  it('preserves custom slugs on submit', async () => {
    const user = userEvent.setup()
    const onJoin = vi.fn()
    const { container } = render(<JoinSessionForm onJoin={onJoin} />)
    const scope = within(container)

    await user.type(scope.getByPlaceholderText(PLACEHOLDER), 'sprint-42')
    await user.click(scope.getByText('Join'))

    expect(onJoin).toHaveBeenCalledWith('sprint-42')
  })

  it('disables join button when input is empty', () => {
    const { container } = render(<JoinSessionForm onJoin={vi.fn()} />)
    expect(within(container).getByText('Join')).toBeDisabled()
  })
})
