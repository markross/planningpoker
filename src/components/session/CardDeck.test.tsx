import { render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { CardDeck } from './CardDeck'
import type { Estimate } from '../../constants/estimates'

function renderDeck(props: Partial<Parameters<typeof CardDeck>[0]> = {}) {
  const defaultProps = { selectedEstimate: null as Estimate | null, onSelect: vi.fn() }
  const result = render(<CardDeck {...defaultProps} {...props} />)
  const group = within(result.container).getByRole('group', {
    name: 'Estimate cards',
  })
  return { ...result, group, buttons: within(group).getAllByRole('button') }
}

describe('CardDeck', () => {
  it('renders 8 estimate cards', () => {
    const { buttons } = renderDeck()
    expect(buttons).toHaveLength(8)
  })

  it('renders all estimate values', () => {
    const { buttons } = renderDeck()
    const labels = buttons.map((b) => b.textContent)
    expect(labels).toEqual(['1', '2', '3', '5', '8', '13', '21', '?'])
  })

  it('highlights the selected card', () => {
    const { buttons } = renderDeck({ selectedEstimate: '5' })
    const fiveButton = buttons.find((b) => b.textContent === '5')!
    expect(fiveButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('calls onSelect when a card is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const { buttons } = renderDeck({ onSelect })

    const eightButton = buttons.find((b) => b.textContent === '8')!
    await user.click(eightButton)
    expect(onSelect).toHaveBeenCalledWith('8')
  })

  it('disables all cards when disabled', () => {
    const { buttons } = renderDeck({ disabled: true })
    buttons.forEach((btn) => expect(btn).toBeDisabled())
  })

  it('shows hint text when isRevealed', () => {
    const { container } = renderDeck({ isRevealed: true })
    expect(within(container).getByText('Votes revealed — click to change your vote')).toBeInTheDocument()
  })

  it('does not show hint text when not revealed', () => {
    const { container } = renderDeck({ isRevealed: false })
    expect(within(container).queryByText('Votes revealed — click to change your vote')).not.toBeInTheDocument()
  })

  it('cards are not disabled when isRevealed', () => {
    const { buttons } = renderDeck({ isRevealed: true })
    buttons.forEach((btn) => expect(btn).not.toBeDisabled())
  })

  it('calls onSelect when clicking a card in revealed state', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const { buttons } = renderDeck({ isRevealed: true, onSelect })

    const threeButton = buttons.find((b) => b.textContent === '3')!
    await user.click(threeButton)
    expect(onSelect).toHaveBeenCalledWith('3')
  })
})
