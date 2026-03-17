import { ESTIMATES, type Estimate } from '../../constants/estimates'
import { EstimateCard } from './EstimateCard'

interface CardDeckProps {
  readonly selectedEstimate: Estimate | null
  readonly onSelect: (value: Estimate) => void
  readonly disabled?: boolean
}

export function CardDeck({
  selectedEstimate,
  onSelect,
  disabled = false,
}: CardDeckProps) {
  return (
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
  )
}
