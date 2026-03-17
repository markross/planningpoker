import { render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { JoinSessionForm } from './JoinSessionForm'

describe('JoinSessionForm', () => {
  it('renders session code input', () => {
    const { container } = render(<JoinSessionForm onJoin={vi.fn()} />)
    expect(within(container).getByPlaceholderText('e.g. ABC123')).toBeInTheDocument()
  })

  it('uppercases input as user types', async () => {
    const user = userEvent.setup()
    const { container } = render(<JoinSessionForm onJoin={vi.fn()} />)

    await user.type(within(container).getByPlaceholderText('e.g. ABC123'), 'abc')
    expect(within(container).getByDisplayValue('ABC')).toBeInTheDocument()
  })

  it('calls onJoin with uppercased trimmed code', async () => {
    const user = userEvent.setup()
    const onJoin = vi.fn()
    const { container } = render(<JoinSessionForm onJoin={onJoin} />)
    const scope = within(container)

    await user.type(scope.getByPlaceholderText('e.g. ABC123'), 'abc123')
    await user.click(scope.getByText('Join'))

    expect(onJoin).toHaveBeenCalledWith('ABC123')
  })

  it('disables join button when input is empty', () => {
    const { container } = render(<JoinSessionForm onJoin={vi.fn()} />)
    expect(within(container).getByText('Join')).toBeDisabled()
  })
})
