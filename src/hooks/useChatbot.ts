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
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [isConversationEnded, setIsConversationEnded] = useState(false)
  const [chatId, setChatId] = useState<string | null>(null)
  const [isHighlighted, setIsHighlighted] = useState(false)
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null)
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
      setRateLimitMessage(`Message is too long (max ${maxMessageLength} characters).`)
      return
    }

    const now = Date.now()
    if (now - lastMessageTime < MIN_MESSAGE_DELAY) {
      return
    }
    setLastMessageTime(now)
    setRateLimitMessage(null)

    let currentChatId = chatId
    if (!currentChatId) {
      currentChatId = crypto.randomUUID()
      setChatId(currentChatId)
    }

    const currentAssistantCount = messages.filter((m) => m.role === 'assistant').length
    if (currentAssistantCount >= maxExchanges) {
      const closingMessage: Message = {
        role: 'assistant',
        content: 'It was nice chatting with you, I have to go now. Talk to you soon!',
      }
      setMessages((prev) => [...prev, closingMessage])
      setIsConversationEnded(true)
      setTimeout(() => {
        setMessages([])
        setIsConversationEnded(false)
        setChatId(null)
      }, 5000)
      return
    }

    const userMessage: Message = { role: 'user', content: text }
    const conversationMessages = [...messages, userMessage]
    setMessages(conversationMessages)
    setInput('')
    setIsLoading(true)

    try {
      // Send only user/assistant history — never a system prompt or bio.
      const history = messages.map((m) => ({ role: m.role, content: m.content }))
      const result = await sendChatMessage({
        message: text,
        history,
        sessionId: currentChatId,
      })

      if (!result.ok) {
        if (result.error === 'rate_limited') {
          setRateLimitMessage(
            result.message ||
              'Please slow down and try again later.'
          )
          if (result.retryAfter && result.retryAfter > 3600) {
            setIsConversationEnded(true)
          }
        }
        const errorMessage: Message = {
          role: 'assistant',
          content: result.message,
        }
        setMessages((prev) => [...prev, errorMessage])
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
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, there was an error processing your message. Please try again.',
      }
      setMessages((prev) => [...prev, errorMessage])
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
    rateLimitMessage,
    setIsOpen,
    setInput,
    sendMessage,
    sendSuggestedQuestion,
    handleKeyPress,
  }
}
