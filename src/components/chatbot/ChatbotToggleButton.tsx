interface ChatbotToggleButtonProps {
  isOpen: boolean
  isHighlighted: boolean
  onClick: () => void
}

export function ChatbotToggleButton({ isOpen, isHighlighted, onClick }: ChatbotToggleButtonProps) {
  return (
    <button
      onClick={onClick}
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
  )
}
