export type ClientChatRole = 'user' | 'assistant'

export interface ClientChatMessage {
  role: ClientChatRole
  content: string
}

export type SendChatErrorCode =
  | 'rate_limited'
  | 'message_too_long'
  | 'invalid'
  | 'unavailable'
  | 'origin_rejected'

export type SendChatResult =
  | { ok: true; content: string }
  | {
      ok: false
      error: SendChatErrorCode
      retryAfter?: number
      message: string
    }

export interface SendChatMessageInput {
  message: string
  history?: unknown
  sessionId?: string
  /** Ignored if present — system prompts are built server-side only. */
  systemMessage?: unknown
  system?: unknown
  prompt?: unknown
}
