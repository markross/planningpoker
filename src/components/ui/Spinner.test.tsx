import { render, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Spinner } from './Spinner'

describe('Spinner', () => {
  it('renders with loading role', () => {
    const { container } = render(<Spinner />)
    expect(within(container).getByRole('status')).toBeInTheDocument()
  })

  it('has screen reader text', () => {
    const { container } = render(<Spinner />)
    expect(within(container).getByText('Loading...')).toBeInTheDocument()
  })
})
