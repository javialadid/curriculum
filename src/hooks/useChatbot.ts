import { useState, useEffect, useRef } from 'react'
import { fetchChatbotData, sendChatMessage } from '@/lib/chatbot-actions'
import type { Message, ChatbotData, Resume } from '@/types/chatbot'

interface UseChatbotProps {
  resume?: Resume
}

export function useChatbot({ resume }: UseChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatbotData, setChatbotData] = useState<ChatbotData | null>(null)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [isConversationEnded, setIsConversationEnded] = useState(false)
  const [chatId, setChatId] = useState<string | null>(null)
  const [isHighlighted, setIsHighlighted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const groqModel = process.env.NEXT_PUBLIC_GROQ_MODELNAME || 'llama-3.3-70b-versatile'
  const maxExchanges = parseInt(process.env.NEXT_PUBLIC_CHATBOT_MAX_EXCHANGES || '20', 10)
  const firstName = resume?.name.split(' ')[0] || 'Assistant'

  // Check if chatbot is active (always true now, as keys are private)
  const isActive = true

  useEffect(() => {
    if (isActive && !dataLoaded) {
      loadChatbotData()
    }
  }, [isActive, dataLoaded])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Highlight button every 15 seconds for 1 second (only when chat is closed)
  useEffect(() => {
    if (isOpen) {
      // Clear any existing highlight when chat opens
      setIsHighlighted(false)
      return
    }

    const interval = setInterval(() => {
      setIsHighlighted(true)
      setTimeout(() => {
        setIsHighlighted(false)
      }, 1000) // Highlight for 1 second
    }, 15000) // Every 15 seconds

    return () => clearInterval(interval)
  }, [isOpen])

  const loadChatbotData = async () => {
    console.log('🤖 Chatbot: [CLIENT] Requesting chatbot data from server...')
    try {
      const data = await fetchChatbotData()
      if (data) {
        console.log('✅ Chatbot: [CLIENT] Successfully received chatbot data from server')
        setChatbotData(data)
        setDataLoaded(true)
      } else {
        console.log('❌ Chatbot: [CLIENT] Server returned no data - check server logs for detailed error analysis')
        setDataLoaded(false)
      }
    } catch (error) {
      console.error('💥 Chatbot: [CLIENT] Failed to fetch data from server:', error)
      setDataLoaded(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!input.trim() || !chatbotData || isConversationEnded) {
      console.warn('⚠️ Chatbot: [CLIENT] Cannot send message - missing input, chatbot data, or conversation ended')
      return
    }

    let currentChatId = chatId
    if (!currentChatId) {
      currentChatId = crypto.randomUUID()
      setChatId(currentChatId)
      console.log('🆕 Chatbot: [CLIENT] New chat started with ID:', currentChatId)
    }

    const currentAssistantCount = messages.filter(m => m.role === 'assistant').length
    if (currentAssistantCount >= maxExchanges) {
      const closingMessage: Message = {
        role: 'assistant',
        content: 'It was nice chatting with you, I have to go now. Talk to you soon!'
      }
      setMessages(prev => [...prev, closingMessage])
      setIsConversationEnded(true)
      // Reset conversation after a delay
      setTimeout(() => {
        setMessages([])
        setIsConversationEnded(false)
        setChatId(null)
      }, 5000)
      return
    }

    const userMessage: Message = { role: 'user', content: input }
    const conversationMessages = [...messages, userMessage]
    setMessages(conversationMessages)
    setInput('')
    setIsLoading(true)

    console.log('📤 Chatbot: [CLIENT] Sending message via server action...', {
      messageLength: input.length,
      conversationLength: conversationMessages.length,
      chatId: currentChatId
    })

    try {
      const resumeContext = resume ? `\n\nFull Resume Data:\n${JSON.stringify({ ...resume, name: undefined, slug: undefined }, null, 2)}` : ''
      const systemMessage = (!chatbotData.prompt || chatbotData.prompt.trim() === '')
        ? `You are a helpful AI assistant that answers questions about the user's professional background based on the following bio and resume data. Be conversational and provide specific, relevant information.\n\nBio: ${chatbotData.bio}${resumeContext}`
        : `${chatbotData.prompt}\n\nBio: ${chatbotData.bio}${resumeContext}`
      const responseContent = await sendChatMessage(systemMessage, conversationMessages, groqModel, currentChatId)

      const assistantMessage: Message = {
        role: 'assistant',
        content: responseContent || 'Sorry, I couldn\'t generate a response.'
      }

      console.log('✅ Chatbot: [CLIENT] Received response from server action', {
        responseLength: responseContent?.length || 0,
        hasResponse: !!responseContent,
        chatId: currentChatId
      })

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('💥 Chatbot: [CLIENT] Server action failed (chatId: ' + currentChatId + '):', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, there was an error processing your message. Please try again.'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      console.log('🔄 Chatbot: [CLIENT] Message processing completed')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return {
    // State
    isOpen,
    messages,
    input,
    isLoading,
    chatbotData,
    dataLoaded,
    isConversationEnded,
    isHighlighted,
    messagesEndRef,
    firstName,
    isActive,

    // Actions
    setIsOpen,
    setInput,
    sendMessage,
    handleKeyPress,
  }
}
