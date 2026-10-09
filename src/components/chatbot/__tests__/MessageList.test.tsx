import { render, screen } from '@testing-library/react'
import { MessageList } from '../MessageList'

describe('MessageList', () => {
  const messagesEndRef = { current: null }

  it('renders markdown formatting for assistant messages', () => {
    render(
      <MessageList
        messages={[
          {
            role: 'assistant',
            content: 'Skills include **TypeScript** and *React*.\n\n- Testing\n- APIs',
          },
        ]}
        isLoading={false}
        messagesEndRef={messagesEndRef}
      />
    )

    const bold = screen.getByText('TypeScript')
    expect(bold.tagName).toBe('STRONG')
    expect(screen.queryByText(/\*\*TypeScript\*\*/)).not.toBeInTheDocument()

    const italic = screen.getByText('React')
    expect(italic.tagName).toBe('EM')

    expect(screen.getByText('Testing').closest('li')).toBeInTheDocument()
    expect(screen.getByText('APIs').closest('li')).toBeInTheDocument()
  })

  it('does not render markdown for user messages', () => {
    render(
      <MessageList
        messages={[{ role: 'user', content: 'Show me **bold** text' }]}
        isLoading={false}
        messagesEndRef={messagesEndRef}
      />
    )

    expect(screen.getByText('Show me **bold** text')).toBeInTheDocument()
    expect(screen.queryByText('bold')).not.toBeInTheDocument()
  })

  it('does not inject raw HTML from assistant content', () => {
    const { container } = render(
      <MessageList
        messages={[
          {
            role: 'assistant',
            content: 'Hello <img src=x onerror=alert(1)> world',
          },
        ]}
        isLoading={false}
        messagesEndRef={messagesEndRef}
      />
    )

    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByText(/Hello/)).toBeInTheDocument()
  })
})
