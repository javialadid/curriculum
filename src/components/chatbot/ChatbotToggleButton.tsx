import Image from 'next/image'

interface ChatbotToggleButtonProps {
  isOpen: boolean
  isHighlighted: boolean
  onClick: () => void
  photo?: string
}

export function ChatbotToggleButton({ isOpen, isHighlighted, onClick, photo }: ChatbotToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 text-white rounded-full px-3 py-2 lg:px-5 lg:py-3 shadow-lg transition-all duration-300 transform ${
        isHighlighted
          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-xl shadow-blue-400/30 scale-105'
          : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
      }`}
      aria-label="Toggle chatbot"
    >
      {isOpen ? (
        <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
      ) : (
        photo && (
          <Image
            src={photo}
            alt="Profile picture"
            width={56}
            height={56}
            className="w-14 h-14 rounded-full object-cover border-2 border-white/20"
          />
        )
      )}
      <span className="font-small text-xs">AI chat</span>
    </button>
  )
}
