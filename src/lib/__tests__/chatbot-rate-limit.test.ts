import {
  MemoryRateLimiter,
  UpstashRateLimiter,
  checkChatbotRateLimits,
} from '../chatbot-rate-limit'

describe('MemoryRateLimiter', () => {
  it('allows requests under the limit within a window', async () => {
    const now = 1_000_000
    const limiter = new MemoryRateLimiter(() => now)

    expect((await limiter.check('a', 2, 60)).allowed).toBe(true)
    expect((await limiter.check('a', 2, 60)).allowed).toBe(true)
    const blocked = await limiter.check('a', 2, 60)
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfter).toBeGreaterThan(0)
  })

  it('resets after the window expires', async () => {
    let now = 1_000_000
    const limiter = new MemoryRateLimiter(() => now)

    await limiter.check('b', 1, 60)
    expect((await limiter.check('b', 1, 60)).allowed).toBe(false)

    now += 60_000
    expect((await limiter.check('b', 1, 60)).allowed).toBe(true)
  })

  it('tracks keys independently', async () => {
    const limiter = new MemoryRateLimiter(() => 1_000_000)

    expect((await limiter.check('ip:1', 1, 60)).allowed).toBe(true)
    expect((await limiter.check('ip:1', 1, 60)).allowed).toBe(false)
    expect((await limiter.check('ip:2', 1, 60)).allowed).toBe(true)
  })

  it('evicts expired keys when size passes the threshold', async () => {
    let now = 1_000_000
    const limiter = new MemoryRateLimiter(() => now, 3)

    await limiter.check('k1', 5, 60)
    await limiter.check('k2', 5, 60)
    await limiter.check('k3', 5, 60)
    expect(limiter.size()).toBe(3)

    now += 60_000
    // Access triggers eviction once size >= threshold and entries are expired.
    await limiter.check('k4', 5, 60)
    expect(limiter.getEntry('k1')).toBeUndefined()
    expect(limiter.getEntry('k2')).toBeUndefined()
    expect(limiter.getEntry('k3')).toBeUndefined()
    expect(limiter.getEntry('k4')).toBeDefined()
  })
})

describe('checkChatbotRateLimits day window', () => {
  it('returns rate_limited when the per-day limit is exceeded', async () => {
    const limiter = new MemoryRateLimiter()
    const base = {
      ip: '203.0.113.50',
      sessionId: 'sess-day',
      perMinute: 100,
      perDay: 2,
      maxExchanges: 100,
      limiter,
    }

    expect((await checkChatbotRateLimits(base)).allowed).toBe(true)
    expect((await checkChatbotRateLimits(base)).allowed).toBe(true)
    const blocked = await checkChatbotRateLimits(base)
    expect(blocked.allowed).toBe(false)
    expect(blocked.reason).toBe('day')
    expect(blocked.retryAfter).toBeGreaterThan(0)
  })
})

describe('UpstashRateLimiter', () => {
  it('uses pipelined INCR/EXPIRE/TTL via fetch and enforces the limit', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ result: 1 }, { result: 1 }, { result: 60 }],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ result: 2 }, { result: 0 }, { result: 45 }],
      })

    const limiter = new UpstashRateLimiter(
      'https://example.upstash.io',
      'token',
      fetchImpl as unknown as typeof fetch
    )

    expect((await limiter.check('ip:1:m', 1, 60)).allowed).toBe(true)
    const blocked = await limiter.check('ip:1:m', 1, 60)
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfter).toBe(45)

    expect(fetchImpl).toHaveBeenCalledTimes(2)
    const firstCall = fetchImpl.mock.calls[0]
    expect(firstCall[0]).toBe('https://example.upstash.io/pipeline')
    expect(JSON.parse(firstCall[1].body)).toEqual([
      ['INCR', 'chatbot:rl:ip:1:m'],
      ['EXPIRE', 'chatbot:rl:ip:1:m', 60, 'NX'],
      ['TTL', 'chatbot:rl:ip:1:m'],
    ])
  })

  it('fails closed when Upstash returns a non-OK status', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({ ok: false, status: 500 })
    const limiter = new UpstashRateLimiter(
      'https://example.upstash.io',
      'token',
      fetchImpl as unknown as typeof fetch
    )

    const result = await limiter.check('ip:1:m', 5, 60)
    expect(result.allowed).toBe(false)
    expect(result.retryAfter).toBe(60)
  })
})
