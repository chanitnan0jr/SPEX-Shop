const BASE_API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'

/**
 * Normalizes an image source for React Native.
 * Handles:
 * - Protocol-relative URLs (starts with //)
 * - Backend relative paths (starts with /)
 * - Absolute URLs (starts with http)
 * - Required assets (numbers)
 */
export const getImageSource = (val: string | number | null | undefined, fallback: any) => {
  if (!val) return fallback
  if (typeof val === 'number') return val
  if (typeof val === 'string' && val.trim() !== '') {
    const trimmed = val.trim()
    if (trimmed.startsWith('http')) return { uri: trimmed }
    if (trimmed.startsWith('//')) return { uri: `https:${trimmed}` }
    if (trimmed.startsWith('/')) {
      return { uri: `${BASE_API_URL.replace(/\/$/, '')}${trimmed}` }
    }
    // If it's a domain without protocol (like specphone.com/...)
    if (trimmed.includes('.') && !trimmed.includes(' ')) {
      return { uri: `https://${trimmed}` }
    }
  }
  return fallback
}
