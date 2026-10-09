import { useEffect, useRef } from 'react'
import Image from 'next/image'
import type { Message, Resume } from '@/types/chatbot'
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
  maxMessageLength: number
  rateLimitMessage: string | null
  onInputChange: (value: string) => void
  onSendMessage: () => void
  onSuggestedQuestion: (question: string) => void
  onKeyPress: (e: React.KeyboardEvent) => void
}

export function ChatWindow({
  resume,
  firstName,
  messages,
  input,
  isLoading,
  isConversationEnded,
  messagesEndRef,
  maxMessageLength,
  rateLimitMessage,
  onInputChange,
  onSendMessage,
  onSuggestedQuestion,
  onKeyPress,
}: ChatWindowProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <div className="fixed z-50 bottom-20 left-1/2 -translate-x-1/2 w-[80vw] max-w-96 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col md:absolute md:bottom-16 md:right-0 md:left-auto md:w-96 md:translate-x-0">
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
          <p className="text-sm opacity-90">AI assistant · Ask about the CV</p>
        </div>
      </div>

      <MessageList
        messages={messages}
        isLoading={isLoading}
        messagesEndRef={messagesEndRef}
        onSuggestedQuestion={onSuggestedQuestion}
      />

      {rateLimitMessage && (
        <p className="px-4 text-xs text-amber-700 dark:text-amber-300" role="status">
          {rateLimitMessage}
        </p>
      )}

      <MessageInput
        input={input}
        onInputChange={onInputChange}
        onSendMessage={onSendMessage}
        onKeyPress={onKeyPress}
        isLoading={isLoading}
        isDisabled={false}
        isConversationEnded={isConversationEnded}
        maxMessageLength={maxMessageLength}
        inputRef={inputRef}
      />
    </div>
  )
}
