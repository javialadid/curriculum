'use server'

import { chatbotRepository } from '@/lib/repositories'
import Groq from 'groq-sdk'

export interface ChatbotData {
  bio: string
  prompt: string
}

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function fetchChatbotData(): Promise<ChatbotData | null> {
  return chatbotRepository.getChatbotData()
}

// Security constants - configurable via env
const MAX_MESSAGE_LENGTH = parseInt(process.env.CHATBOT_MAX_MESSAGE_LENGTH || '1000', 10)
const MAX_CONVERSATION_LENGTH = parseInt(process.env.CHATBOT_MAX_CONVERSATION_LENGTH || '10000', 10)

// Exported for testing
export async function sanitizeMessage(content: string): Promise<string> {
  if (!content || typeof content !== 'string') {
    return ''
  }

  // Security: Aggressive sanitization for malicious content
  let sanitizedContent = content

  // Remove HTML tags completely (including content between tags for script/style)
  sanitizedContent = sanitizedContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  sanitizedContent = sanitizedContent.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
  sanitizedContent = sanitizedContent.replace(/<[^>]*>/g, '') // Remove remaining HTML tags

  // Remove javascript: URLs completely
  sanitizedContent = sanitizedContent.replace(/javascript:[^)]*\)/gi, '')

  // Remove event handlers completely
  sanitizedContent = sanitizedContent.replace(/on\w+=[^)]*\)/gi, '')

  return sanitizedContent.trim()
}

export async function sendChatMessage(
  systemMessage: string,
  messages: Message[],
  model: string,
  chatId?: string
): Promise<string | null> {
  const groqApiKey = process.env.GROQ_API_KEY

  if (!groqApiKey) {
    console.error('GROQ_API_KEY environment variable not set')
    return null
  }

  // Security: Validate and sanitize inputs
  if (!messages || messages.length === 0) {
    console.error('No messages provided')
    return 'Sorry, I need a message to respond to.'
  }

  // Truncate conversation if it exceeds total length limit
  let truncatedMessages = messages
  const totalConversationLength = systemMessage.length + messages.reduce((total, msg) => total + (msg.content?.length || 0), 0)

    if (totalConversationLength > MAX_CONVERSATION_LENGTH) {
      console.log(`Truncating conversation from ${messages.length} messages`)

      // Calculate how much we need to remove
      let currentLength = systemMessage.length
      const messagesToKeep: Message[] = []

      // Start from the end (most recent messages) and work backwards
      for (let i = messages.length - 1; i >= 0; i--) {
        const msg = messages[i]
        const msgLength = msg.content?.length || 0

        if (currentLength + msgLength <= MAX_CONVERSATION_LENGTH) {
          messagesToKeep.unshift(msg) // Add to beginning to maintain order
          currentLength += msgLength
        } else {
          break // Stop when we can't add more messages
        }
      }

      // Ensure we keep at least the most recent user message
      if (messagesToKeep.length === 0 || messagesToKeep[messagesToKeep.length - 1].role !== 'user') {
        // If no user message in kept messages, keep at least the last user message
        const lastUserMessage = messages.slice().reverse().find(msg => msg.role === 'user')
        if (lastUserMessage && !messagesToKeep.includes(lastUserMessage)) {
          messagesToKeep.push(lastUserMessage)
        }
      }

      truncatedMessages = messagesToKeep
    }

  // Security: Validate and sanitize each message
  const validationResults = await Promise.all(truncatedMessages.map(async (msg, index) => {
    const validationErrors: string[] = []

    if (!msg.content || typeof msg.content !== 'string') {
      validationErrors.push('Invalid message format (missing or non-string content)')
    }

    // Security: Check message length
    if (msg.content && msg.content.length > MAX_MESSAGE_LENGTH) {
      validationErrors.push(`Message too long (${msg.content.length} > ${MAX_MESSAGE_LENGTH} characters)`)
    }

    // Security: Basic HTML/script tag removal
    const sanitizedContent = await sanitizeMessage(msg.content || '')

    if (!sanitizedContent && msg.content) {
      validationErrors.push('Message empty after sanitization (likely contained only malicious content)')
    }

    return {
      index,
      originalMessage: {
        role: msg.role,
        contentLength: msg.content?.length || 0,
        contentPreview: msg.content ? msg.content.substring(0, 50) + (msg.content.length > 50 ? '...' : '') : ''
      },
      validationErrors,
      sanitizedMessage: validationErrors.length === 0 ? {
        role: msg.role,
        content: sanitizedContent
      } : null
    }
  }))

  const failedValidations = validationResults.filter(result => result.validationErrors.length > 0)
  const sanitizedMessages = validationResults
    .filter(result => result.sanitizedMessage !== null)
    .map(result => result.sanitizedMessage!) as Message[]

  if (failedValidations.length > 0) {
    console.error(`Message validation failed for ${failedValidations.length} out of ${truncatedMessages.length} messages`)
    return 'Sorry, there was an issue with your message. Please try again.'
  }

  // Security: Validate system message (allow larger size for resume context)
  if (!systemMessage || typeof systemMessage !== 'string' || systemMessage.length > 50000) {
    console.error('Invalid system message')
    return 'Sorry, there was a configuration error. Please try again later.'
  }

  const fullMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: systemMessage },
    ...sanitizedMessages
  ]

  try {
    const groq = new Groq({ apiKey: groqApiKey })

    const completion = await groq.chat.completions.create({
      messages: fullMessages,
      model,
    })

    const responseContent = completion.choices[0]?.message?.content

    if (!responseContent) {
      console.error('GROQ API returned empty response')
      return 'Sorry, I couldn\'t generate a response.'
    }

    return responseContent
  } catch (error) {
    console.error('Error calling GROQ API:', error)
    return 'Sorry, there was an error processing your message. Please try again.'
  }
}
