'use client'

import { useChatbot } from '@/hooks/useChatbot'
import type { ChatbotProps } from '@/types/chatbot'
import { ChatbotToggleButton } from './chatbot/ChatbotToggleButton'
import { ChatWindow } from './chatbot/ChatWindow'

export default function Chatbot({ resume }: ChatbotProps) {
  const {
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
    setIsOpen,
    setInput,
    sendMessage,
    handleKeyPress,
  } = useChatbot({ resume })

  if (!isActive || !dataLoaded) {
    console.log('🚫 Chatbot: [CLIENT] Not rendering chatbot button', {
      isActive,
      dataLoaded,
      reason: !isActive ? 'GROQ_API_KEY not present' : 'Chatbot data failed to load'
    })
    return null // Don't render if GROQ_API_KEY is not present or chatbot data failed to load
  }

  return (
    <div className="fixed bottom-4 right-[max(0rem,calc((100vw-64rem)/2))] z-50">
      <ChatbotToggleButton
        isOpen={isOpen}
        isHighlighted={isHighlighted}
        onClick={() => setIsOpen(!isOpen)}
      />

      {isOpen && (
        <ChatWindow
          resume={resume}
          firstName={firstName}
          messages={messages}
          input={input}
          isLoading={isLoading}
          isConversationEnded={isConversationEnded}
          messagesEndRef={messagesEndRef}
          onInputChange={setInput}
          onSendMessage={sendMessage}
          onKeyPress={handleKeyPress}
          chatbotData={chatbotData}
        />
      )}
    </div>
  )
}
