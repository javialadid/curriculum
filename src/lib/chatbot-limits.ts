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

/** Truncate at the last whitespace within maxChars; hard-cut if no whitespace found. */
export function truncateAtWordBoundary(text: string, maxChars: number): string {
  if (text.length <= maxChars) {
    return text
  }
  const sliced = text.slice(0, maxChars)
  let lastWs = -1
  for (let i = sliced.length - 1; i >= 0; i--) {
    if (/\s/.test(sliced[i]!)) {
      lastWs = i
      break
    }
  }
  if (lastWs > 0) {
    return sliced.slice(0, lastWs).trimEnd()
  }
  return sliced
}

/**
 * Parse a plain positive integer env value. Rejects scientific notation,
 * trailing junk, floats, zero, and negatives (same rules as server config).
 */
export function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw === '') {
    return fallback
  }
  const parsed = Number(raw)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback
  }
  if (!/^\d+$/.test(raw.trim())) {
    return fallback
  }
  return parsed
}

/** Client-visible max message length (mirrors server default). */
export function getClientMaxMessageLength(): number {
  return parsePositiveInt(
    process.env.NEXT_PUBLIC_CHATBOT_MAX_MESSAGE_LENGTH,
    DEFAULT_MAX_MESSAGE_LENGTH
  )
}

/** Client-visible max exchanges hint (server still enforces). */
export function getClientMaxExchanges(): number {
  return parsePositiveInt(
    process.env.NEXT_PUBLIC_CHATBOT_MAX_EXCHANGES,
    DEFAULT_MAX_EXCHANGES
  )
}
