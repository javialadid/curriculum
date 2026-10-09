import '@testing-library/jest-dom'

// Mock fetch for groq-sdk
global.fetch = jest.fn()

// server-only throws outside the Next server runtime
jest.mock('server-only', () => ({}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock Next.js cache
jest.mock('next/cache', () => ({
  unstable_cache: jest.fn((fn) => fn),
  unstable_noStore: jest.fn(),
}))

// Mock Next.js headers (server actions)
jest.mock('next/headers', () => ({
  headers: jest.fn(async () => {
    const map = new Map([
      ['host', 'localhost:3000'],
      ['origin', 'http://localhost:3000'],
      ['x-forwarded-for', '127.0.0.1'],
    ])
    return {
      get: (key) => map.get(key.toLowerCase()) ?? null,
    }
  }),
}))

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.SUPABASE_ANON_KEY = 'test-anon-key'
process.env.GROQ_API_KEY = 'test-groq-key'
