import { render, screen } from '@testing-library/react'
import Chatbot from '../Chatbot'


// Mock the useChatbot hook using ES modules
jest.mock('../../hooks/useChatbot', () => ({
  useChatbot: jest.fn()
}))

// Import after mock to get the mocked version
import { useChatbot } from '../../hooks/useChatbot'

// Mocked hook for testing
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
    updated_at: '2024-01-01T00:00:00Z'
  }

  it('should render chatbot button when active and data loaded', () => {
    // Mock the hook to return active chatbot
    mockUseChatbot.mockReturnValue({
      isOpen: false,
      messages: [],
      input: '',
      isLoading: false,
      chatbotData: { bio: 'Test bio', prompt: 'Test prompt' },
      dataLoaded: true,
      isConversationEnded: false,
      isHighlighted: false,
      messagesEndRef: { current: null },
      firstName: 'John',
      isActive: true,
      setIsOpen: jest.fn(),
      setInput: jest.fn(),
      sendMessage: jest.fn(),
      handleKeyPress: jest.fn()
    })

    render(<Chatbot resume={mockResume} />)

    expect(screen.getByLabelText('Toggle chatbot')).toBeInTheDocument()
  })

  it('should not render when chatbot is not active', () => {
    // Mock the hook to return inactive chatbot
    mockUseChatbot.mockReturnValue({
      isOpen: false,
      messages: [],
      input: '',
      isLoading: false,
      chatbotData: null,
      dataLoaded: true,
      isConversationEnded: false,
      isHighlighted: false,
      messagesEndRef: { current: null },
      firstName: 'John',
      isActive: false, // Not active due to missing API key
      setIsOpen: jest.fn(),
      setInput: jest.fn(),
      sendMessage: jest.fn(),
      handleKeyPress: jest.fn()
    })

    const { container } = render(<Chatbot resume={mockResume} />)
    expect(container.firstChild).toBeNull()
  })

  it('should display chat window when open', () => {
    mockUseChatbot.mockReturnValue({
      isOpen: true, // Chat is open
      messages: [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' }
      ],
      input: 'How are you?',
      isLoading: false,
      chatbotData: { bio: 'Test bio', prompt: 'Test prompt' },
      dataLoaded: true,
      isConversationEnded: false,
      isHighlighted: false,
      messagesEndRef: { current: null },
      firstName: 'John',
      isActive: true,
      setIsOpen: jest.fn(),
      setInput: jest.fn(),
      sendMessage: jest.fn(),
      handleKeyPress: jest.fn()
    })

    render(<Chatbot resume={mockResume} />)

    // Verify chat window is open and shows messages
    expect(screen.getByText('AI John')).toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('Hi there!')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument()
  })
})
