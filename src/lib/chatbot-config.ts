import 'server-only'
import {
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
  const parsed = parseInt(raw, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
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
  }
}
