'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { fetchChatbotData, sendChatMessage } from '@/lib/chatbot-actions'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatbotData {
  bio: string
  prompt: string
}

interface ExperienceItem {
  company: string
  location: string
  title: string
  startDate: string
  endDate: string
  current: boolean
  description: string
  links?: string[]
  highlights?: string[]
  technologies?: string[]
}

interface EducationItem {
  institution: string
  degree: string
  date: string
}

interface SideProjectItem {
  links: { [key: string]: string }
  title: string
  summary: string
}

interface Resume {
  id: string
  slug: string
  name: string
  summary: string
  experience: ExperienceItem[]
  education: EducationItem[]
  skills: { [key: string]: string[] }
  side_projects?: SideProjectItem | SideProjectItem[]
  photo?: string
  tag_line?: string
  current_location?: string
  created_at: string
  updated_at: string
}

interface ChatbotProps {
  resume?: Resume
}

export default function Chatbot({ resume }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatbotData, setChatbotData] = useState<ChatbotData | null>(null)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [isConversationEnded, setIsConversationEnded] = useState(false)
  const [chatId, setChatId] = useState<string | null>(null)
  const [isHighlighted, setIsHighlighted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
      const resumeContext = resume ? `\n\nFull Resume Data:\n${JSON.stringify(resume, null, 2)}` : ''
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

  if (!isActive || !dataLoaded) {
    console.log('🚫 Chatbot: [CLIENT] Not rendering chatbot button', {
      isActive,
      dataLoaded,
      reason: !isActive ? 'GROQ_API_KEY not present' : 'Chatbot data failed to load'
    })
    return null // Don't render if GROQ_API_KEY is not present or chatbot data failed to load
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chatbot Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`text-white rounded-full p-4 lg:p-6 shadow-lg transition-all duration-300 transform ${
          isHighlighted
            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-xl shadow-blue-400/30 scale-105'
            : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
        }`}
        aria-label="Toggle chatbot"
      >
        <svg
          className={`w-6 h-6 lg:w-8 lg:h-8 transition-transform ${isOpen ? 'rotate-45' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed z-50 bottom-20 left-1/2 -translate-x-1/2 w-[80vw] max-w-96 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col md:absolute md:bottom-16 md:right-0 md:left-auto md:w-96 md:translate-x-0">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center">
            {resume?.photo && (
              <Image
                src={resume.photo}
                alt="Avatar"
                width={60}
                height={60}
                className="w-15 h-15 rounded-full mr-3 border-2 border-white"
              />
            )}
            <div>
              <h3 className="font-semibold">AI {firstName}</h3>
              <p className="text-sm opacity-90">Ask me anything!</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400">
                <p className="text-sm">Hi! I&apos;m here to help. What would you like to know?</p>
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isConversationEnded ? "Conversation ended. Starting new session..." : "Type your message..."}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={isLoading || !chatbotData || isConversationEnded}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim() || !chatbotData || isConversationEnded}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
