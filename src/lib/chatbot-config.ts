import 'server-only'
import {
  DEFAULT_MAX_ASSISTANT_HISTORY_CHARS,
  DEFAULT_MAX_CONVERSATION_LENGTH,
  DEFAULT_MAX_EXCHANGES,
  DEFAULT_MAX_HISTORY_MESSAGES,
  DEFAULT_MAX_MESSAGE_LENGTH,
  DEFAULT_MAX_OUTPUT_TOKENS,
  DEFAULT_RATE_LIMIT_PER_DAY,
  DEFAULT_RATE_LIMIT_PER_MINUTE,
} from '@/lib/chatbot-limits'

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw === '') {
    return fallback
  }
  const parsed = Number(raw)
  // Require a plain positive integer string — reject '1.5e3', '12abc', floats.
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback
  }
  if (!/^\d+$/.test(raw.trim())) {
    return fallback
  }
  return parsed
}

export function getChatbotLimits() {
  return {
    maxMessageLength: parsePositiveInt(
      process.env.CHATBOT_MAX_MESSAGE_LENGTH,
      DEFAULT_MAX_MESSAGE_LENGTH
    ),
    maxConversationLength: parsePositiveInt(
      process.env.CHATBOT_MAX_CONVERSATION_LENGTH,
      DEFAULT_MAX_CONVERSATION_LENGTH
    ),
    maxHistoryMessages: parsePositiveInt(
      process.env.CHATBOT_MAX_HISTORY_MESSAGES,
      DEFAULT_MAX_HISTORY_MESSAGES
    ),
    maxOutputTokens: parsePositiveInt(
      process.env.CHATBOT_MAX_OUTPUT_TOKENS,
      DEFAULT_MAX_OUTPUT_TOKENS
    ),
    maxExchanges: parsePositiveInt(
      process.env.NEXT_PUBLIC_CHATBOT_MAX_EXCHANGES,
      DEFAULT_MAX_EXCHANGES
    ),
    rateLimitPerMinute: parsePositiveInt(
      process.env.CHATBOT_RATE_LIMIT_PER_MINUTE,
      DEFAULT_RATE_LIMIT_PER_MINUTE
    ),
    rateLimitPerDay: parsePositiveInt(
      process.env.CHATBOT_RATE_LIMIT_PER_DAY,
      DEFAULT_RATE_LIMIT_PER_DAY
    ),
    maxAssistantHistoryChars: parsePositiveInt(
      process.env.CHATBOT_MAX_ASSISTANT_HISTORY_CHARS,
      DEFAULT_MAX_ASSISTANT_HISTORY_CHARS
    ),
  }
}
