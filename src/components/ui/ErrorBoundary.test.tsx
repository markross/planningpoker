import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'

function ThrowingComponent({ error }: { error: Error }) {
  throw error
}

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText('All good')).toBeInTheDocument()
  })

  it('renders error message when child throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ThrowingComponent error={new Error('Test failure')} />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Test failure')).toBeInTheDocument()
    expect(screen.getByText('Reload page')).toBeInTheDocument()

    vi.restoreAllMocks()
  })
})
