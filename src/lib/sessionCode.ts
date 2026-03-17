export const SESSION_CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

const CODE_LENGTH = 6

export function generateSessionCode(): string {
  const chars = Array.from({ length: CODE_LENGTH }, () => {
    const index = Math.floor(Math.random() * SESSION_CODE_CHARS.length)
    return SESSION_CODE_CHARS[index]
  })
  return chars.join('')
}
