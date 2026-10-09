import 'server-only'

const SHORTENED_NOTE = ' (reply shortened)'

const COMMON_ABBREVIATIONS = new Set([
  'e.g.',
  'i.e.',
  'etc.',
  'vs.',
  'mr.',
  'mrs.',
  'ms.',
  'dr.',
  'jr.',
  'sr.',
  'inc.',
  'ltd.',
  'approx.',
  'u.s.',
  'u.k.',
])

/**
 * When the model hits the token cap (`finish_reason === 'length'`), avoid
 * showing a mid-sentence cut-off: keep through the last complete sentence
 * and append a short note.
 */
export function finalizeAssistantContent(
  content: string,
  finishReason: string | null | undefined
): string {
  const trimmed = content.trim()
  if (!trimmed) {
    return trimmed
  }

  if (finishReason !== 'length') {
    return trimmed
  }

  const sentenceEnd = findLastSentenceEnd(trimmed)
  if (sentenceEnd > 0) {
    return trimmed.slice(0, sentenceEnd + 1).trimEnd() + SHORTENED_NOTE
  }

  return trimmed + SHORTENED_NOTE
}

/**
 * Last `.` / `!` / `?` that ends a sentence: must be followed by whitespace
 * or the end of the text. Skips common abbreviations (e.g., i.e.).
 * Dots inside tokens like "Next.js" are ignored because they are not
 * followed by whitespace.
 */
export function findLastSentenceEnd(text: string): number {
  for (let i = text.length - 1; i >= 0; i--) {
    const ch = text[i]
    if (ch !== '.' && ch !== '!' && ch !== '?') continue

    const next = text[i + 1]
    if (next !== undefined && !/\s/.test(next)) continue

    if (ch === '.' && isCommonAbbreviationAt(text, i)) continue

    return i
  }
  return -1
}

function isCommonAbbreviationAt(text: string, dotIndex: number): boolean {
  let start = dotIndex
  while (start > 0 && /[A-Za-z.]/.test(text[start - 1]!)) {
    start -= 1
  }
  const token = text.slice(start, dotIndex + 1).toLowerCase()
  if (!COMMON_ABBREVIATIONS.has(token)) {
    return false
  }

  // "etc." at the real end of the text, before a newline, or before a
  // capitalised new sentence, is a sentence end — not a mid-clause abbreviation.
  if (token === 'etc.') {
    const after = text.slice(dotIndex + 1)
    if (after.trim() === '') {
      return false
    }
    if (/^\s*\n/.test(after)) {
      return false
    }
    if (/^\s+[A-Z]/.test(after)) {
      return false
    }
  }

  return true
}

/**
 * Prefer message.content only. Reasoning (when include_reasoning is true)
 * lives on message.reasoning and must never be shown to the user.
 */
export function extractAssistantText(message: {
  content?: string | null
  reasoning?: string | null
}): string {
  return typeof message.content === 'string' ? message.content : ''
}
