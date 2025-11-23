import { Send } from 'lucide-react'

interface MessageInputProps {
  input: string
  onInputChange: (value: string) => void
  onSendMessage: () => void
  onKeyPress: (e: React.KeyboardEvent) => void
  isLoading: boolean
  isDisabled: boolean
  isConversationEnded: boolean
}

export function MessageInput({
  input,
  onInputChange,
  onSendMessage,
  onKeyPress,
  isLoading,
  isDisabled,
  isConversationEnded
}: MessageInputProps) {
  return (
    <div className="p-2 sm:p-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex space-x-1 sm:space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder={isConversationEnded ? "Conversation ended. Starting new session..." : "Type your message..."}
          className="flex-1 px-2 sm:px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          disabled={isLoading || isDisabled || isConversationEnded}
        />
        <button
          onClick={onSendMessage}
          disabled={isLoading || !input.trim() || isDisabled || isConversationEnded}
          className="px-2 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors text-xs sm:text-base whitespace-nowrap min-w-0 flex-shrink-0 flex items-center justify-center"
        >
          <Send className="w-4 h-4 sm:hidden" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  )
}
