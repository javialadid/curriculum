import { useState, useEffect, useRef } from 'react'
import { isChatbotAvailable, sendChatMessage } from '@/lib/chatbot-actions'
import {
  getClientMaxExchanges,
  getClientMaxMessageLength,
} from '@/lib/chatbot-limits'
import type { Message, Resume } from '@/types/chatbot'
import { sendGAEvent } from '@/lib/utils'

interface UseChatbotProps {
  resume?: Resume
}

export function useChatbot({ resume }: UseChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  /** Model-bound transcript only (user + successful assistant replies). */
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [isConversationEnded, setIsConversationEnded] = useState(false)
  const [chatId, setChatId] = useState<string | null>(null)
  const [isHighlighted, setIsHighlighted] = useState(false)
  /** UI-only status (rate limits, errors) — never sent to the model. */
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const maxExchanges = getClientMaxExchanges()
  const maxMessageLength = getClientMaxMessageLength()
  const firstName = resume?.name.split(' ')[0] || 'Assistant'

  const MIN_MESSAGE_DELAY = 1000
  const [lastMessageTime, setLastMessageTime] = useState<number>(0)

  const isActive = true

  useEffect(() => {
    if (isActive && !dataLoaded) {
      void loadAvailability()
    }
  }, [isActive, dataLoaded])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      setIsHighlighted(false)
      return
    }

    const interval = setInterval(() => {
      setIsHighlighted(true)
      setTimeout(() => {
        setIsHighlighted(false)
      }, 1000)
    }, 15000)

    return () => clearInterval(interval)
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      sendGAEvent('chatbot_open')
    }
  }, [isOpen])

  const loadAvailability = async () => {
    try {
      const available = await isChatbotAvailable()
      setDataLoaded(available)
    } catch (error) {
      console.error('Chatbot availability check failed:', error)
      setDataLoaded(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim()
    if (!text || isConversationEnded) {
      return
    }

    if (text.length > maxMessageLength) {
      setStatusMessage(`Message is too long (max ${maxMessageLength} characters).`)
      return
    }

    const now = Date.now()
    if (now - lastMessageTime < MIN_MESSAGE_DELAY) {
      return
    }
    setLastMessageTime(now)
    setStatusMessage(null)

    let currentChatId = chatId
    if (!currentChatId) {
      currentChatId = crypto.randomUUID()
      setChatId(currentChatId)
    }

    const currentAssistantCount = messages.filter((m) => m.role === 'assistant').length
    if (currentAssistantCount >= maxExchanges) {
      setStatusMessage(
        "You've reached the message limit for this chat. Feel free to get in touch directly."
      )
      setIsConversationEnded(true)
      setTimeout(() => {
        setMessages([])
        setIsConversationEnded(false)
        setChatId(null)
        setStatusMessage(null)
      }, 5000)
      return
    }

    const userMessage: Message = { role: 'user', content: text }
    // Prior successful turns only — failed/rate-limited user questions are marked
    // and filtered out so they are never resent to the model.
    const historyForModel = messages
      .filter((m) => !m.excludeFromHistory)
      .map((m) => ({ role: m.role, content: m.content }))
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    const markLastUserExcluded = () => {
      setMessages((prev) => {
        const copy = [...prev]
        for (let i = copy.length - 1; i >= 0; i--) {
          if (copy[i].role === 'user') {
            copy[i] = { ...copy[i], excludeFromHistory: true }
            break
          }
        }
        return copy
      })
    }

    try {
      const result = await sendChatMessage({
        message: text,
        history: historyForModel,
        sessionId: currentChatId,
      })

      if (!result.ok) {
        // Keep the user's question visible; status banner shows the error below it.
        // Mark the turn so later sends omit it from model history.
        markLastUserExcluded()
        setStatusMessage(result.message)
        if (result.error === 'rate_limited' && result.retryAfter && result.retryAfter > 3600) {
          setIsConversationEnded(true)
        }
        return
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: result.content,
      }

      setMessages((prev) => [...prev, assistantMessage])
      sendGAEvent('chatbot_message_sent')
    } catch (error) {
      console.error('Chatbot server action failed:', error)
      // Keep the user's question visible; show the error as a UI-only status.
      markLastUserExcluded()
      setStatusMessage('Sorry, there was an error processing your message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void sendMessage()
    }
  }

  const sendSuggestedQuestion = (question: string) => {
    void sendMessage(question)
  }

  return {
    isOpen,
    messages,
    input,
    isLoading,
    dataLoaded,
    isConversationEnded,
    isHighlighted,
    messagesEndRef,
    firstName,
    isActive,
    maxMessageLength,
    rateLimitMessage: statusMessage,
    setIsOpen,
    setInput,
    sendMessage,
    sendSuggestedQuestion,
    handleKeyPress,
  }
}
