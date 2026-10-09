import { MemoryRateLimiter } from '../chatbot-rate-limit'

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
})
