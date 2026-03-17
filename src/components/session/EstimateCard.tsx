import type { Estimate } from '../../constants/estimates'

interface EstimateCardProps {
  readonly value: Estimate
  readonly isSelected: boolean
  readonly onSelect: (value: Estimate) => void
  readonly disabled?: boolean
}

export function EstimateCard({
  value,
  isSelected,
  onSelect,
  disabled = false,
}: EstimateCardProps) {
  return (
    <button
      onClick={() => onSelect(value)}
      disabled={disabled}
      aria-pressed={isSelected}
      className={`w-16 h-24 rounded-xl text-2xl font-bold transition-all border-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
        isSelected
          ? 'bg-indigo-600 text-white border-indigo-700 scale-110 shadow-lg'
          : 'bg-white text-gray-800 border-gray-200 hover:border-indigo-400 hover:shadow-md'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {value}
    </button>
  )
}
