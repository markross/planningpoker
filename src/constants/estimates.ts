export const ESTIMATES = ['1', '2', '3', '5', '8', '13', '21', '?'] as const

export type Estimate = (typeof ESTIMATES)[number]
