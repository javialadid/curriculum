import 'server-only'

export interface RateLimitResult {
  allowed: boolean
  /** Seconds until the caller may retry (best-effort). */
  retryAfter?: number
}

export interface RateLimiter {
  /**
   * Consume one unit against `key` within a fixed window.
   * Returns whether the request is allowed under `limit`.
   */
  check(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult>
}

const MEMORY_EVICT_THRESHOLD = 200

/** In-memory fixed-window counters. Best-effort on serverless (per-instance). */
export class MemoryRateLimiter implements RateLimiter {
  private readonly windows = new Map<string, { count: number; resetAt: number }>()

  constructor(
    private readonly now: () => number = () => Date.now(),
    private readonly evictThreshold = MEMORY_EVICT_THRESHOLD
  ) {}

  async check(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
    const now = this.now()
    this.evictExpiredIfNeeded(now)

    const windowMs = windowSeconds * 1000
    let entry = this.windows.get(key)

    if (!entry || now >= entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs }
      this.windows.set(key, entry)
    }

    if (entry.count >= limit) {
      const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000))
      return { allowed: false, retryAfter }
    }

    entry.count += 1
    return { allowed: true }
  }

  /** Sweep expired entries when the map grows past the threshold. */
  private evictExpiredIfNeeded(now: number): void {
    if (this.windows.size < this.evictThreshold) {
      return
    }
    for (const [entryKey, entry] of this.windows) {
      if (now >= entry.resetAt) {
        this.windows.delete(entryKey)
      }
    }
  }

  /** Test helper: clear all counters. */
  clear(): void {
    this.windows.clear()
  }

  /** Test helper: current map size. */
  size(): number {
    return this.windows.size
  }

  /** Test helper: inspect a key's state. */
  getEntry(key: string): { count: number; resetAt: number } | undefined {
    return this.windows.get(key)
  }
}

/**
 * Upstash Redis REST fixed-window limiter via plain fetch (INCR + EXPIRE).
 * No @upstash/redis dependency.
 */
export class UpstashRateLimiter implements RateLimiter {
  constructor(
    private readonly url: string,
    private readonly token: string,
    private readonly fetchImpl: typeof fetch = fetch
  ) {}

  async check(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
    const redisKey = `chatbot:rl:${key}`
    const response = await this.fetchImpl(`${this.url}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', redisKey],
        ['EXPIRE', redisKey, windowSeconds, 'NX'],
        ['TTL', redisKey],
      ]),
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('Upstash rate limit request failed:', response.status)
      // Fail closed with a short retry rather than skipping limits.
      return { allowed: false, retryAfter: 60 }
    }

    const data = (await response.json()) as Array<{ result?: number | string }>
    const count = Number(data[0]?.result ?? 0)
    const ttlRaw = Number(data[2]?.result ?? windowSeconds)
    const ttl = ttlRaw > 0 ? ttlRaw : windowSeconds

    if (count > limit) {
      return { allowed: false, retryAfter: Math.max(1, ttl) }
    }

    return { allowed: true }
  }
}

let sharedLimiter: RateLimiter | null = null
let memoryFallback: MemoryRateLimiter | null = null

/** Reset cached limiter (tests). */
export function resetRateLimiterForTests(): void {
  sharedLimiter = null
  memoryFallback = null
}

/** Inject a limiter for tests. Pass null to clear. */
export function setRateLimiterForTests(limiter: RateLimiter | null): void {
  sharedLimiter = limiter
}

export function createRateLimiter(): RateLimiter {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (url && token) {
    return new UpstashRateLimiter(url, token)
  }

  return new MemoryRateLimiter()
}

export function getRateLimiter(): RateLimiter {
  if (!sharedLimiter) {
    sharedLimiter = createRateLimiter()
  }
  return sharedLimiter
}

/** Always-available in-memory limiter for tests / fallbacks. */
export function getMemoryRateLimiter(): MemoryRateLimiter {
  if (!memoryFallback) {
    memoryFallback = new MemoryRateLimiter()
  }
  return memoryFallback
}

/**
 * Rate limits:
 * - per-IP minute and day windows (shared across sessions from that IP)
 * - separate per-session message cap keyed by IP+sessionId
 */
export async function checkChatbotRateLimits(options: {
  ip: string
  sessionId: string
  perMinute: number
  perDay: number
  maxExchanges: number
  limiter?: RateLimiter
}): Promise<RateLimitResult & { reason?: 'minute' | 'day' | 'session' }> {
  const limiter = options.limiter ?? getRateLimiter()
  const { ip, sessionId, perMinute, perDay, maxExchanges } = options

  const minute = await limiter.check(`ip:${ip}:m`, perMinute, 60)
  if (!minute.allowed) {
    return { ...minute, reason: 'minute' }
  }

  const day = await limiter.check(`ip:${ip}:d`, perDay, 86400)
  if (!day.allowed) {
    return { ...day, reason: 'day' }
  }

  // Session message cap keyed by IP + session so clients cannot reset by minting IDs alone.
  const session = await limiter.check(`session:${ip}:${sessionId}`, maxExchanges, 86400)
  if (!session.allowed) {
    return { ...session, reason: 'session' }
  }

  return { allowed: true }
}
