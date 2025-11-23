import { useEffect, useRef } from 'react'
import Image from 'next/image'
import type { Message, Resume, ChatbotData } from '@/types/chatbot'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'

interface ChatWindowProps {
  resume?: Resume
  firstName: string
  messages: Message[]
  input: string
  isLoading: boolean
  isConversationEnded: boolean
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  onInputChange: (value: string) => void
  onSendMessage: () => void
  onKeyPress: (e: React.KeyboardEvent) => void
  chatbotData: ChatbotData | null
}

export function ChatWindow({
  resume,
  firstName,
  messages,
  input,
  isLoading,
  isConversationEnded,
  messagesEndRef,
  onInputChange,
  onSendMessage,
  onKeyPress,
  chatbotData
}: ChatWindowProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when chat opens
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
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

      <MessageList
        messages={messages}
        isLoading={isLoading}
        messagesEndRef={messagesEndRef}
      />

      <MessageInput
        input={input}
        onInputChange={onInputChange}
        onSendMessage={onSendMessage}
        onKeyPress={onKeyPress}
        isLoading={isLoading}
        isDisabled={!chatbotData}
        isConversationEnded={isConversationEnded}
        inputRef={inputRef}
      />
    </div>
  )
}
