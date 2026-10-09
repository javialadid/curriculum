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
    // History for the model is prior successful turns only (no status/error text).
    const historyForModel = messages.map((m) => ({ role: m.role, content: m.content }))
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const result = await sendChatMessage({
        message: text,
        history: historyForModel,
        sessionId: currentChatId,
      })

      if (!result.ok) {
        setStatusMessage(result.message)
        if (result.error === 'rate_limited' && result.retryAfter && result.retryAfter > 3600) {
          setIsConversationEnded(true)
        }
        // Roll back the optimistic user message so it is not resent as orphaned history.
        setMessages((prev) =>
          prev.length > 0 && prev[prev.length - 1]?.role === 'user' ? prev.slice(0, -1) : prev
        )
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
      setStatusMessage('Sorry, there was an error processing your message. Please try again.')
      setMessages((prev) =>
        prev.length > 0 && prev[prev.length - 1]?.role === 'user' ? prev.slice(0, -1) : prev
      )
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
