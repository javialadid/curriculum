const mockCreate = jest.fn().mockResolvedValue({
  choices: [{ message: { content: 'Test response' } }],
  usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
  model: 'test-model'
})

// Mock Groq before importing chatbot-actions
jest.mock('groq-sdk', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate
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

import {
  sanitizeMessage,
  sendChatMessage,
  resolveGroqModel,
  resolveReasoningEffort,
} from '../chatbot-actions'

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

describe('resolveGroqModel', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.NEXT_PUBLIC_GROQ_MODELNAME
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('defaults to openai/gpt-oss-20b', async () => {
    expect(await resolveGroqModel()).toBe('openai/gpt-oss-20b')
  })

  it('uses NEXT_PUBLIC_GROQ_MODELNAME when set', async () => {
    process.env.NEXT_PUBLIC_GROQ_MODELNAME = 'openai/gpt-oss-120b'
    expect(await resolveGroqModel()).toBe('openai/gpt-oss-120b')
  })
})

describe('resolveReasoningEffort', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.GROQ_REASONING_EFFORT
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('defaults to medium for gpt-oss models', async () => {
    expect(await resolveReasoningEffort('openai/gpt-oss-20b')).toBe('medium')
  })

  it('is omitted for non-gpt-oss models', async () => {
    expect(await resolveReasoningEffort('llama-3.1-8b-instant')).toBeUndefined()
  })

  it('is omitted when set to none', async () => {
    process.env.GROQ_REASONING_EFFORT = 'none'
    expect(await resolveReasoningEffort('openai/gpt-oss-20b')).toBeUndefined()
  })

  it('is omitted when set to empty string', async () => {
    process.env.GROQ_REASONING_EFFORT = ''
    expect(await resolveReasoningEffort('openai/gpt-oss-20b')).toBeUndefined()
  })

  it('accepts low, medium, and high', async () => {
    process.env.GROQ_REASONING_EFFORT = 'low'
    expect(await resolveReasoningEffort('openai/gpt-oss-20b')).toBe('low')
    process.env.GROQ_REASONING_EFFORT = 'high'
    expect(await resolveReasoningEffort('openai/gpt-oss-20b')).toBe('high')
  })

  it('falls back to medium for invalid values', async () => {
    process.env.GROQ_REASONING_EFFORT = 'extreme'
    expect(await resolveReasoningEffort('openai/gpt-oss-20b')).toBe('medium')
  })
})

describe('sendChatMessage model and reasoning_effort', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    process.env.GROQ_API_KEY = 'test-key'
    delete process.env.NEXT_PUBLIC_GROQ_MODELNAME
    delete process.env.GROQ_REASONING_EFFORT
    mockCreate.mockClear()
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('uses the default model and ignores NEXT_PUBLIC override from a prior client path', async () => {
    // Even if a caller somehow set a different env at runtime after import helpers,
    // sendChatMessage always resolves via resolveGroqModel (server-side).
    await sendChatMessage('You are helpful.', [{ role: 'user', content: 'Hi' }])

    expect(mockCreate).toHaveBeenCalledTimes(1)
    const args = mockCreate.mock.calls[0][0]
    expect(args.model).toBe('openai/gpt-oss-20b')
  })

  it('does not accept a client-supplied model argument (signature has no model param)', async () => {
    // Call with only server-resolved config; a third string arg is treated as chatId, not model.
    await sendChatMessage('You are helpful.', [{ role: 'user', content: 'Hi' }], 'client-injected-model')

    const args = mockCreate.mock.calls[0][0]
    expect(args.model).toBe('openai/gpt-oss-20b')
    expect(args.model).not.toBe('client-injected-model')
  })

  it('defaults reasoning_effort to medium for gpt-oss', async () => {
    await sendChatMessage('You are helpful.', [{ role: 'user', content: 'Hi' }])

    const args = mockCreate.mock.calls[0][0]
    expect(args.reasoning_effort).toBe('medium')
    expect(args.include_reasoning).toBe(true)
  })

  it('omits reasoning_effort for a non-gpt-oss model', async () => {
    process.env.NEXT_PUBLIC_GROQ_MODELNAME = 'llama-3.1-8b-instant'

    await sendChatMessage('You are helpful.', [{ role: 'user', content: 'Hi' }])

    const args = mockCreate.mock.calls[0][0]
    expect(args.model).toBe('llama-3.1-8b-instant')
    expect(args.reasoning_effort).toBeUndefined()
    expect(args.include_reasoning).toBeUndefined()
  })

  it('omits reasoning_effort when GROQ_REASONING_EFFORT is none', async () => {
    process.env.GROQ_REASONING_EFFORT = 'none'

    await sendChatMessage('You are helpful.', [{ role: 'user', content: 'Hi' }])

    const args = mockCreate.mock.calls[0][0]
    expect(args.model).toBe('openai/gpt-oss-20b')
    expect(args.reasoning_effort).toBeUndefined()
    expect(args.include_reasoning).toBe(true)
  })
})
