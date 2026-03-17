import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Input } from './Input'

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input id="test" />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders label when provided', () => {
    render(<Input id="test" label="Name" />)
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
  })

  it('does not render label when not provided', () => {
    render(<Input id="test" />)
    expect(screen.queryByRole('label')).not.toBeInTheDocument()
  })

  it('passes through HTML attributes', () => {
    render(<Input id="test" placeholder="Enter..." maxLength={10} />)
    const input = screen.getByPlaceholderText('Enter...')
    expect(input).toHaveAttribute('maxlength', '10')
  })
})
