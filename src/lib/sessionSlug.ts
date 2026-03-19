const SLUG_MIN = 3
const SLUG_MAX = 50
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function validateSessionSlug(value: string): string | null {
  if (value.length < SLUG_MIN) return `Must be at least ${SLUG_MIN} characters`
  if (value.length > SLUG_MAX) return `Must be at most ${SLUG_MAX} characters`
  if (!SLUG_PATTERN.test(value))
    return 'Only lowercase letters, numbers, and hyphens (no leading/trailing/consecutive hyphens)'
  return null
}

export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
}
