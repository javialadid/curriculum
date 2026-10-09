import 'server-only'
import type { ClientChatMessage } from '@/lib/chatbot-actions-types'

/**
 * Cheap belt-and-suspenders origin check. Next.js server actions already
 * validate Origin against the host; this rejects obviously mismatched Origin
 * headers when both Origin and Host/x-forwarded-host are present.
 *
 * Missing Origin is allowed: non-browser clients often omit it. Those callers
 * are still covered by per-IP rate limits and session caps.
 */
export function checkOriginAllowed(headerList: Headers): boolean {
  const origin = headerList.get('origin')
  if (!origin) {
    return true
  }

  let originHost: string
  try {
    originHost = new URL(origin).host
  } catch {
    return false
  }

  const host =
    headerList.get('x-forwarded-host')?.split(',')[0]?.trim() ||
    headerList.get('host')?.trim()

  if (!host) {
    return true
  }

  return originHost.toLowerCase() === host.toLowerCase()
}

/**
 * Resolve client IP for rate limiting.
 * On Vercel, `x-forwarded-for` is set by the platform (do not invent a custom
 * trusted-proxy layer here).
 */
export function getClientIp(headerList: Headers): string {
  const forwarded = headerList.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  const realIp = headerList.get('x-real-ip')?.trim()
  if (realIp) return realIp
  return 'unknown'
}

/** Keep only user/assistant messages with string content; drop system and extras. */
export function sanitizeClientHistory(
  history: unknown,
  maxMessages: number
): ClientChatMessage[] {
  if (!Array.isArray(history)) {
    return []
  }

  const cleaned: ClientChatMessage[] = []
  for (const item of history) {
    if (!item || typeof item !== 'object') continue
    const record = item as Record<string, unknown>
    const role = record.role
    const content = record.content
    if (role !== 'user' && role !== 'assistant') continue
    if (typeof content !== 'string') continue
    cleaned.push({ role, content })
  }

  if (cleaned.length <= maxMessages) {
    return cleaned
  }
  return cleaned.slice(-maxMessages)
}
