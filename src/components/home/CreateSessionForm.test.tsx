import { render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { CreateSessionForm } from './CreateSessionForm'

describe('CreateSessionForm', () => {
  it('renders create button', () => {
    const { container } = render(<CreateSessionForm onCreateSession={vi.fn()} isLoading={false} />)
    expect(within(container).getByText('Create session')).toBeInTheDocument()
  })

  it('shows loading text when creating', () => {
    const { container } = render(<CreateSessionForm onCreateSession={vi.fn()} isLoading />)
    expect(within(container).getByText('Creating...')).toBeInTheDocument()
  })

  it('calls onCreateSession on click', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()
    const { container } = render(<CreateSessionForm onCreateSession={onCreate} isLoading={false} />)

    await user.click(within(container).getByText('Create session'))
    expect(onCreate).toHaveBeenCalledOnce()
  })

  it('disables button while loading', () => {
    const { container } = render(<CreateSessionForm onCreateSession={vi.fn()} isLoading />)
    expect(within(container).getByText('Creating...')).toBeDisabled()
  })
})
