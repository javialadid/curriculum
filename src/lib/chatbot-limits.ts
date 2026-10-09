/**
 * Shared chatbot limits. Safe for client and server.
 * Server enforcement uses the same defaults via chatbot-config (server-only).
 */

export const DEFAULT_MAX_MESSAGE_LENGTH = 400
/** Budget for history + new message only (system prompt is excluded). */
export const DEFAULT_MAX_CONVERSATION_LENGTH = 10000
export const DEFAULT_MAX_HISTORY_MESSAGES = 6
export const DEFAULT_MAX_OUTPUT_TOKENS = 1500
/** Silent truncate for long assistant history items (not a hard reject). */
export const DEFAULT_MAX_ASSISTANT_HISTORY_CHARS = 1500
export const DEFAULT_MAX_EXCHANGES = 15
export const DEFAULT_RATE_LIMIT_PER_MINUTE = 5
export const DEFAULT_RATE_LIMIT_PER_DAY = 30

/** Client-visible max message length (mirrors server default). */
export function getClientMaxMessageLength(): number {
  const raw = process.env.NEXT_PUBLIC_CHATBOT_MAX_MESSAGE_LENGTH
  if (raw === undefined || raw === '') {
    return DEFAULT_MAX_MESSAGE_LENGTH
  }
  const parsed = parseInt(raw, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_MESSAGE_LENGTH
}

/** Client-visible max exchanges hint (server still enforces). */
export function getClientMaxExchanges(): number {
  const raw = process.env.NEXT_PUBLIC_CHATBOT_MAX_EXCHANGES
  if (raw === undefined || raw === '') {
    return DEFAULT_MAX_EXCHANGES
  }
  const parsed = parseInt(raw, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_EXCHANGES
}
