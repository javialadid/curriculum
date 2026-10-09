import { getChatbotLimits } from '../chatbot-config'
import {
  DEFAULT_MAX_MESSAGE_LENGTH,
  DEFAULT_MAX_OUTPUT_TOKENS,
} from '../chatbot-limits'

describe('getChatbotLimits parsePositiveInt', () => {
  const keys = [
    'CHATBOT_MAX_MESSAGE_LENGTH',
    'CHATBOT_MAX_OUTPUT_TOKENS',
  ] as const

  afterEach(() => {
    for (const key of keys) {
      delete process.env[key]
    }
  })

  it('accepts plain positive integers', () => {
    process.env.CHATBOT_MAX_MESSAGE_LENGTH = '250'
    process.env.CHATBOT_MAX_OUTPUT_TOKENS = '900'
    const limits = getChatbotLimits()
    expect(limits.maxMessageLength).toBe(250)
    expect(limits.maxOutputTokens).toBe(900)
  })

  it("falls back for scientific notation like '1.5e3'", () => {
    process.env.CHATBOT_MAX_MESSAGE_LENGTH = '1.5e3'
    expect(getChatbotLimits().maxMessageLength).toBe(DEFAULT_MAX_MESSAGE_LENGTH)
  })

  it("falls back for trailing non-digits like '12abc'", () => {
    process.env.CHATBOT_MAX_OUTPUT_TOKENS = '12abc'
    expect(getChatbotLimits().maxOutputTokens).toBe(DEFAULT_MAX_OUTPUT_TOKENS)
  })

  it('falls back for floats, zero, and negatives', () => {
    process.env.CHATBOT_MAX_MESSAGE_LENGTH = '1.5'
    expect(getChatbotLimits().maxMessageLength).toBe(DEFAULT_MAX_MESSAGE_LENGTH)

    process.env.CHATBOT_MAX_MESSAGE_LENGTH = '0'
    expect(getChatbotLimits().maxMessageLength).toBe(DEFAULT_MAX_MESSAGE_LENGTH)

    process.env.CHATBOT_MAX_MESSAGE_LENGTH = '-3'
    expect(getChatbotLimits().maxMessageLength).toBe(DEFAULT_MAX_MESSAGE_LENGTH)
  })
})
