const DAILY_LIMIT_ANON = 10

function getStorageKey(): string {
  const today = new Date().toISOString().split('T')[0]
  return `ge-chat-count-${today}`
}

export function checkClientRateLimit(): { allowed: boolean; remaining: number } {
  if (typeof window === 'undefined') return { allowed: true, remaining: DAILY_LIMIT_ANON }

  const key = getStorageKey()
  const count = parseInt(localStorage.getItem(key) || '0', 10)
  const remaining = DAILY_LIMIT_ANON - count

  return { allowed: remaining > 0, remaining: Math.max(0, remaining) }
}

export function incrementClientCount(): void {
  if (typeof window === 'undefined') return

  const key = getStorageKey()
  const count = parseInt(localStorage.getItem(key) || '0', 10)
  localStorage.setItem(key, String(count + 1))
}

// Server-side in-memory rate limiting by IP
const ipCounts = new Map<string, { count: number; date: string }>()

export function checkServerRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const today = new Date().toISOString().split('T')[0]
  const entry = ipCounts.get(ip)

  if (!entry || entry.date !== today) {
    ipCounts.set(ip, { count: 0, date: today })
    return { allowed: true, remaining: DAILY_LIMIT_ANON }
  }

  const remaining = DAILY_LIMIT_ANON - entry.count
  return { allowed: remaining > 0, remaining: Math.max(0, remaining) }
}

export function incrementServerCount(ip: string): void {
  const today = new Date().toISOString().split('T')[0]
  const entry = ipCounts.get(ip)

  if (!entry || entry.date !== today) {
    ipCounts.set(ip, { count: 1, date: today })
  } else {
    entry.count++
  }
}
