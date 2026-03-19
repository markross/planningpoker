import { ESTIMATES, type Estimate } from '../../constants/estimates'
import { EstimateCard } from './EstimateCard'

interface CardDeckProps {
  readonly selectedEstimate: Estimate | null
  readonly onSelect: (value: Estimate) => void
  readonly disabled?: boolean
  readonly isRevealed?: boolean
}

export function CardDeck({
  selectedEstimate,
  onSelect,
  disabled = false,
  isRevealed = false,
}: CardDeckProps) {
  return (
    <div>
      {isRevealed && (
        <p className="text-sm text-center text-indigo-600 mb-1">
          Votes revealed — click to change your vote
        </p>
      )}
      <div
        className="flex flex-wrap justify-center gap-3 p-4"
        role="group"
        aria-label="Estimate cards"
      >
        {ESTIMATES.map((value) => (
          <EstimateCard
            key={value}
            value={value}
            isSelected={selectedEstimate === value}
            onSelect={onSelect}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  )
}
