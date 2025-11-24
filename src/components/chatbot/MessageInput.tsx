import { Send } from 'lucide-react'

interface MessageInputProps {
  input: string
  onInputChange: (value: string) => void
  onSendMessage: () => void
  onKeyPress: (e: React.KeyboardEvent) => void
  isLoading: boolean
  isDisabled: boolean
  isConversationEnded: boolean
  inputRef?: React.RefObject<HTMLInputElement | null>
}

// Security: Message length limits
const MAX_MESSAGE_LENGTH = 500

export function MessageInput({
  input,
  onInputChange,
  onSendMessage,
  onKeyPress,
  isLoading,
  isDisabled,
  isConversationEnded,
  inputRef
}: MessageInputProps) {
  const isInputTooLong = input.length > MAX_MESSAGE_LENGTH
  const isSendDisabled = isLoading || !input.trim() || isDisabled || isConversationEnded || isInputTooLong

  return (
    <div className="p-2 sm:p-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex space-x-1 sm:space-x-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            // Security: Limit message length to prevent abuse
            const value = e.target.value
            if (value.length <= MAX_MESSAGE_LENGTH) {
              onInputChange(value)
            }
          }}
          onKeyPress={onKeyPress}
          placeholder={isConversationEnded ? "Conversation ended. Starting new session..." : "Type your message..."}
          className={`flex-1 px-2 sm:px-3 py-2 border rounded-md focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${
            isInputTooLong
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
          }`}
          disabled={isLoading || isDisabled || isConversationEnded}
          maxLength={MAX_MESSAGE_LENGTH}
        />
        <button
          onClick={onSendMessage}
          disabled={isSendDisabled}
          className="px-2 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors text-xs sm:text-base whitespace-nowrap min-w-0 flex-shrink-0 flex items-center justify-center"
        >
          <Send className="w-4 h-4 sm:hidden" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  )
}
