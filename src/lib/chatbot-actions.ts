'use server'

import { headers } from 'next/headers'
import Groq from 'groq-sdk'
import { chatbotRepository, resumeRepository } from '@/lib/repositories'
import { getChatbotLimits } from '@/lib/chatbot-config'
import { checkChatbotRateLimits, getRateLimiter } from '@/lib/chatbot-rate-limit'
import {
  buildChatbotSystemMessage,
  buildResumeContext,
} from '@/lib/chatbot-system-prompt'
import {
  checkOriginAllowed,
  getClientIp,
  sanitizeClientHistory,
} from '@/lib/chatbot-request'
import {
  extractAssistantText,
  finalizeAssistantContent,
} from '@/lib/chatbot-response'
import type {
  ClientChatMessage,
  SendChatMessageInput,
  SendChatResult,
} from '@/lib/chatbot-actions-types'

/** Truncate at the last whitespace within maxChars; hard-cut if no space found. */
export function truncateAtWordBoundary(text: string, maxChars: number): string {
  if (text.length <= maxChars) {
    return text
  }
  const sliced = text.slice(0, maxChars)
  const lastSpace = sliced.lastIndexOf(' ')
  if (lastSpace > 0) {
    return sliced.slice(0, lastSpace).trimEnd()
  }
  return sliced
}

export type {
  ClientChatMessage,
  ClientChatRole,
  SendChatErrorCode,
  SendChatMessageInput,
  SendChatResult,
} from '@/lib/chatbot-actions-types'

const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-20b'
const VALID_REASONING_EFFORTS = new Set(['low', 'medium', 'high'])

function rateLimitedResult(retryAfter?: number, message?: string): SendChatResult {
  return {
    ok: false,
    error: 'rate_limited',
    retryAfter,
    message:
      message ||
      'You are sending messages too quickly. Please slow down and try again in a moment.',
  }
}

/** Lightweight readiness check — never returns bio or prompt text. */
export async function isChatbotAvailable(): Promise<boolean> {
  if (!process.env.GROQ_API_KEY) {
    return false
  }
  const data = await chatbotRepository.getChatbotData()
  return data !== null
}

// Exported for testing
export async function sanitizeMessage(content: string): Promise<string> {
  if (!content || typeof content !== 'string') {
    return ''
  }

  let sanitizedContent = content

  sanitizedContent = sanitizedContent.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ''
  )
  sanitizedContent = sanitizedContent.replace(
    /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
    ''
  )
  sanitizedContent = sanitizedContent.replace(/<[^>]*>/g, '')
  sanitizedContent = sanitizedContent.replace(/javascript:[^)]*\)/gi, '')
  sanitizedContent = sanitizedContent.replace(/on\w+=[^)]*\)/gi, '')

  return sanitizedContent.trim()
}

/** Resolve model from env; client-supplied values are ignored. Exported for tests. */
export async function resolveGroqModel(): Promise<string> {
  return process.env.NEXT_PUBLIC_GROQ_MODELNAME || DEFAULT_GROQ_MODEL
}

/**
 * Resolve reasoning_effort for gpt-oss models only.
 * Defaults to medium when unset. Returns undefined to omit the param
 * (non-gpt-oss, or GROQ_REASONING_EFFORT set to none/empty).
 * Invalid values fall back to medium. Exported for tests.
 */
export async function resolveReasoningEffort(
  model: string
): Promise<'low' | 'medium' | 'high' | undefined> {
  if (!model.startsWith('openai/gpt-oss')) {
    return undefined
  }

  const raw = process.env.GROQ_REASONING_EFFORT
  if (raw !== undefined && (raw.trim() === '' || raw.trim().toLowerCase() === 'none')) {
    return undefined
  }

  if (raw === undefined) {
    return 'medium'
  }

  const normalized = raw.trim().toLowerCase()
  if (VALID_REASONING_EFFORTS.has(normalized)) {
    return normalized as 'low' | 'medium' | 'high'
  }

  return 'medium'
}

/**
 * Trim history + new message to the conversation budget.
 * The system prompt is excluded — it has its own size and must not wipe history.
 */
function truncateByConversationLength(
  messages: ClientChatMessage[],
  maxLength: number
): ClientChatMessage[] {
  const total = messages.reduce((sum, msg) => sum + (msg.content?.length || 0), 0)

  if (total <= maxLength) {
    return messages
  }

  let currentLength = 0
  const kept: ClientChatMessage[] = []

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i]
    const msgLength = msg.content?.length || 0
    if (currentLength + msgLength <= maxLength) {
      kept.unshift(msg)
      currentLength += msgLength
    } else {
      break
    }
  }

  if (kept.length === 0 || kept[kept.length - 1].role !== 'user') {
    const lastUser = [...messages].reverse().find((msg) => msg.role === 'user')
    if (lastUser && !kept.includes(lastUser)) {
      kept.push(lastUser)
    }
  }

  return kept
}

/**
 * Send a chat message. The client may only supply the new user message,
 * a short user/assistant history, and a session id. System prompts and
 * bio/CV data are loaded and assembled exclusively on the server.
 */
export async function sendChatMessage(
  input: SendChatMessageInput
): Promise<SendChatResult> {
  const limits = getChatbotLimits()
  const headerList = await headers()

  // Validate origin / shape / length before consuming rate-limit quota.
  if (!checkOriginAllowed(headerList)) {
    return {
      ok: false,
      error: 'origin_rejected',
      message: 'Sorry, this request could not be verified. Please refresh and try again.',
    }
  }

  const rawMessage = typeof input.message === 'string' ? input.message : ''
  if (!rawMessage.trim()) {
    return {
      ok: false,
      error: 'invalid',
      message: 'Sorry, I need a message to respond to.',
    }
  }

  if (rawMessage.length > limits.maxMessageLength) {
    return {
      ok: false,
      error: 'message_too_long',
      message: `Message is too long (max ${limits.maxMessageLength} characters).`,
    }
  }

  const historyPreview = sanitizeClientHistory(input.history, limits.maxHistoryMessages)
  // Length cap applies to user turns only; long assistant history is truncated later.
  for (const msg of historyPreview) {
    if (msg.role === 'user' && msg.content.length > limits.maxMessageLength) {
      return {
        ok: false,
        error: 'message_too_long',
        message: `Message is too long (max ${limits.maxMessageLength} characters).`,
      }
    }
  }

  const ip = getClientIp(headerList)
  const sessionId =
    typeof input.sessionId === 'string' && input.sessionId.trim().length > 0
      ? input.sessionId.trim().slice(0, 128)
      : 'anonymous'

  const rate = await checkChatbotRateLimits({
    ip,
    sessionId,
    perMinute: limits.rateLimitPerMinute,
    perDay: limits.rateLimitPerDay,
    maxExchanges: limits.maxExchanges,
    limiter: getRateLimiter(),
  })

  if (!rate.allowed) {
    const sessionMsg =
      rate.reason === 'session'
        ? "You've reached the message limit for this chat. Feel free to get in touch directly."
        : undefined
    return rateLimitedResult(rate.retryAfter, sessionMsg)
  }

  const sanitizedUserMessage = await sanitizeMessage(rawMessage)
  if (!sanitizedUserMessage) {
    return {
      ok: false,
      error: 'invalid',
      message: 'Sorry, there was an issue with your message. Please try again.',
    }
  }

  const historySanitized: ClientChatMessage[] = []
  for (const msg of historyPreview) {
    let content = msg.content
    if (msg.role === 'assistant' && content.length > limits.maxAssistantHistoryChars) {
      content = truncateAtWordBoundary(content, limits.maxAssistantHistoryChars)
    }
    const cleaned = await sanitizeMessage(content)
    if (!cleaned && msg.content) {
      return {
        ok: false,
        error: 'invalid',
        message: 'Sorry, there was an issue with your message. Please try again.',
      }
    }
    if (cleaned) {
      historySanitized.push({ role: msg.role, content: cleaned })
    }
  }

  const chatbotData = await chatbotRepository.getChatbotData()
  if (!chatbotData) {
    return {
      ok: false,
      error: 'unavailable',
      message: 'Sorry, the assistant is temporarily unavailable. Please try again later.',
    }
  }

  const { resume } = await resumeRepository.getResume()
  const resumeContext = buildResumeContext(resume)
  // Client-supplied systemMessage / prompt / system fields are intentionally ignored.
  const systemMessage = buildChatbotSystemMessage(
    chatbotData.bio,
    chatbotData.prompt,
    resumeContext
  )

  const conversation = truncateByConversationLength(
    [...historySanitized, { role: 'user', content: sanitizedUserMessage }],
    limits.maxConversationLength
  )

  const groqApiKey = process.env.GROQ_API_KEY
  if (!groqApiKey) {
    console.error('GROQ_API_KEY environment variable not set')
    return {
      ok: false,
      error: 'unavailable',
      message: 'Sorry, the assistant is temporarily unavailable. Please try again later.',
    }
  }

  const model = await resolveGroqModel()
  const fullMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: systemMessage },
    ...conversation,
  ]

  try {
    const groq = new Groq({ apiKey: groqApiKey })
    const reasoningEffort = await resolveReasoningEffort(model)

    const completion = await groq.chat.completions.create({
      messages: fullMessages,
      model,
      max_tokens: limits.maxOutputTokens,
      ...(model.startsWith('openai/gpt-oss')
        ? {
            // Keep chain-of-thought on message.reasoning, not in content.
            include_reasoning: true,
            ...(reasoningEffort !== undefined ? { reasoning_effort: reasoningEffort } : {}),
          }
        : {}),
    })

    const choice = completion.choices[0]
    const rawContent = extractAssistantText(choice?.message ?? {})
    // Never surface message.reasoning — only content is user-facing.
    if (!rawContent.trim()) {
      console.error('GROQ API returned empty response')
      return {
        ok: false,
        error: 'unavailable',
        message: "Sorry, I couldn't generate a response.",
      }
    }

    const responseContent = finalizeAssistantContent(rawContent, choice?.finish_reason)

    return { ok: true, content: responseContent }
  } catch (error) {
    console.error('Error calling GROQ API:', error)
    return {
      ok: false,
      error: 'unavailable',
      message: 'Sorry, there was an error processing your message. Please try again.',
    }
  }
}
