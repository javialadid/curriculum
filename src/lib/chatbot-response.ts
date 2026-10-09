import 'server-only'

const SHORTENED_NOTE = ' (reply shortened)'

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

function findLastSentenceEnd(text: string): number {
  for (let i = text.length - 1; i >= 0; i--) {
    const ch = text[i]
    if (ch === '.' || ch === '!' || ch === '?') {
      return i
    }
  }
  return -1
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
