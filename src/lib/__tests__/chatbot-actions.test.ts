// Mock Supabase before importing
jest.mock('groq-sdk', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Test response' } }],
          usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
          model: 'test-model'
        })
      }
    }
  }))
}))

jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        limit: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      }))
    }))
  }
}))

import { sanitizeMessage } from '../chatbot-actions'

describe('sanitizeMessage', () => {
  it('should remove HTML tags', async () => {
    const input = '<script>alert("xss")</script>Hello world'
    const expected = 'Hello world'
    expect(await sanitizeMessage(input)).toBe(expected)
  })

  it('should remove JavaScript URLs completely', async () => {
    const input = 'javascript:alert("xss")'
    const expected = ''
    expect(await sanitizeMessage(input)).toBe(expected)
  })

  it('should remove event handlers completely', async () => {
    const input = 'onclick=alert("xss")'
    const expected = ''
    expect(await sanitizeMessage(input)).toBe(expected)
  })

  it('should handle complex malicious input', async () => {
    const input = '<img src="x" onerror="alert(1)">test<script>evil()</script>'
    const expected = 'test'
    expect(await sanitizeMessage(input)).toBe(expected)
  })

  it('should preserve normal text', async () => {
    const input = 'Hello, this is a normal message!'
    const expected = 'Hello, this is a normal message!'
    expect(await sanitizeMessage(input)).toBe(expected)
  })

  it('should trim whitespace', async () => {
    const input = '  spaced text  '
    const expected = 'spaced text'
    expect(await sanitizeMessage(input)).toBe(expected)
  })

  it('should handle empty strings', async () => {
    expect(await sanitizeMessage('')).toBe('')
    expect(await sanitizeMessage('   ')).toBe('')
  })

  it('should handle null and undefined', async () => {
    expect(await sanitizeMessage(null as unknown as string)).toBe('')
    expect(await sanitizeMessage(undefined as unknown as string)).toBe('')
  })

  it('should handle numbers and other types', async () => {
    expect(await sanitizeMessage(123 as unknown as string)).toBe('')
    expect(await sanitizeMessage({} as unknown as string)).toBe('')
  })

  it('should remove multiple types of attacks', async () => {
    const input = '<b>Bold</b> text with javascript:alert() and onclick=evil()'
    const expected = 'Bold text with  and'
    expect(await sanitizeMessage(input)).toBe(expected)
  })
})
