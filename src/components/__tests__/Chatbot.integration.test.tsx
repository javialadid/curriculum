import { render, screen } from '@testing-library/react'
import Chatbot from '../Chatbot'

jest.mock('../../hooks/useChatbot', () => ({
  useChatbot: jest.fn(),
}))

import { useChatbot } from '../../hooks/useChatbot'

const mockUseChatbot = jest.mocked(useChatbot)

describe('Chatbot Integration Test', () => {
  const mockResume = {
    id: '1',
    slug: 'test-resume',
    name: 'John Doe',
    summary: 'Software Developer',
    experience: [],
    education: [],
    skills: {},
    side_projects: [],
    photo: 'https://example.com/photo.jpg',
    tag_line: 'Building great software',
    current_location: 'San Francisco, CA',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  const baseHook = {
    isOpen: false,
    messages: [] as { role: 'user' | 'assistant'; content: string }[],
    input: '',
    isLoading: false,
    dataLoaded: true,
    isConversationEnded: false,
    isHighlighted: false,
    messagesEndRef: { current: null },
    firstName: 'John',
    isActive: true,
    maxMessageLength: 400,
    rateLimitMessage: null as string | null,
    setIsOpen: jest.fn(),
    setInput: jest.fn(),
    sendMessage: jest.fn(),
    sendSuggestedQuestion: jest.fn(),
    handleKeyPress: jest.fn(),
  }

  it('should render chatbot button when active and data loaded', () => {
    mockUseChatbot.mockReturnValue({ ...baseHook })

    render(<Chatbot resume={mockResume} />)

    expect(screen.getByLabelText('Toggle chatbot')).toBeInTheDocument()
  })

  it('should not render when chatbot is not active', () => {
    mockUseChatbot.mockReturnValue({
      ...baseHook,
      isActive: false,
    })

    const { container } = render(<Chatbot resume={mockResume} />)
    expect(container.firstChild).toBeNull()
  })

  it('should display chat window when open with AI disclosure', () => {
    mockUseChatbot.mockReturnValue({
      ...baseHook,
      isOpen: true,
      messages: [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
      ],
      input: 'How are you?',
    })

    render(<Chatbot resume={mockResume} />)

    expect(screen.getByText('AI John')).toBeInTheDocument()
    expect(screen.getByText(/AI assistant/i)).toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('Hi there!')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument()
  })
})
