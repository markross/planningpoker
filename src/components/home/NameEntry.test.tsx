import { render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { NameEntry } from './NameEntry'

describe('NameEntry', () => {
  it('renders input with initial name', () => {
    const { container } = render(<NameEntry initialName="Alice" onSubmit={vi.fn()} />)
    expect(within(container).getByDisplayValue('Alice')).toBeInTheDocument()
  })

  it('calls onSubmit with trimmed name', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const { container } = render(<NameEntry initialName="" onSubmit={onSubmit} />)
    const scope = within(container)

    await user.type(scope.getByPlaceholderText('Enter your name'), 'Bob  ')
    await user.click(scope.getByText('Set name'))

    expect(onSubmit).toHaveBeenCalledWith('Bob')
  })

  it('disables button when name is empty', () => {
    const { container } = render(<NameEntry initialName="" onSubmit={vi.fn()} />)
    expect(within(container).getByText('Set name')).toBeDisabled()
  })
})
