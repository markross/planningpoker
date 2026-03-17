function numericVotes(estimates: readonly string[]): readonly number[] {
  return estimates
    .filter((e) => e !== '?')
    .map(Number)
    .filter((n) => !isNaN(n))
}

export function calculateAverage(estimates: readonly string[]): number | null {
  const nums = numericVotes(estimates)
  if (nums.length === 0) return null
  return nums.reduce((sum, n) => sum + n, 0) / nums.length
}

export function calculateSpread(
  estimates: readonly string[],
): { readonly min: number; readonly max: number } | null {
  const nums = numericVotes(estimates)
  if (nums.length === 0) return null
  return {
    min: Math.min(...nums),
    max: Math.max(...nums),
  }
}

export function hasConsensus(estimates: readonly string[]): boolean {
  const nums = numericVotes(estimates)
  if (nums.length === 0) return false
  return nums.every((n) => n === nums[0])
}
