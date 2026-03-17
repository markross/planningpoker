import { render, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders children text', () => {
    const { container } = render(<Badge>Active</Badge>)
    expect(within(container).getByText('Active')).toBeInTheDocument()
  })

  it('applies default variant styling', () => {
    const { container } = render(<Badge>Default</Badge>)
    const badge = within(container).getByText('Default')
    expect(badge).toHaveClass('bg-gray-100')
  })

  it('applies success variant styling', () => {
    const { container } = render(<Badge variant="success">Done</Badge>)
    const badge = within(container).getByText('Done')
    expect(badge).toHaveClass('bg-green-100')
  })

  it('applies warning variant styling', () => {
    const { container } = render(<Badge variant="warning">Warn</Badge>)
    const badge = within(container).getByText('Warn')
    expect(badge).toHaveClass('bg-yellow-100')
  })
})
