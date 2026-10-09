import type { ComponentProps } from 'react'
import ReactMarkdown from 'react-markdown'
import { MarkdownLink } from '@/components/markdown'
import type { Message } from '@/types/chatbot'
import { CHATBOT_SUGGESTED_QUESTIONS } from '@/types/chatbot'

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  onSuggestedQuestion?: (question: string) => void
}

const assistantMarkdownComponents = {
  p: ({ children, ...props }: ComponentProps<'p'>) => (
    <p className="mb-2 last:mb-0" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: ComponentProps<'ul'>) => (
    <ul className="list-disc pl-4 mb-2 last:mb-0 space-y-1" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: ComponentProps<'ol'>) => (
    <ol className="list-decimal pl-4 mb-2 last:mb-0 space-y-1" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: ComponentProps<'li'>) => (
    <li {...props}>{children}</li>
  ),
  strong: ({ children, ...props }: ComponentProps<'strong'>) => (
    <strong className="font-semibold" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }: ComponentProps<'em'>) => (
    <em {...props}>{children}</em>
  ),
  a: ({ href, children }: ComponentProps<'a'>) => (
    <MarkdownLink href={href} className="underline">
      {children}
    </MarkdownLink>
  ),
  br: (props: ComponentProps<'br'>) => <br {...props} />,
}

export function MessageList({
  messages,
  isLoading,
  messagesEndRef,
  onSuggestedQuestion,
}: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 space-y-3">
          <p className="text-sm">Hi! I&apos;m an AI assistant. What would you like to know?</p>
          {onSuggestedQuestion && (
            <div className="flex flex-col gap-2">
              {CHATBOT_SUGGESTED_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => onSuggestedQuestion(question)}
                  className="text-left text-sm px-3 py-2 rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-xs px-4 py-2 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
            }`}
          >
            {message.role === 'assistant' ? (
              <div className="text-sm break-words">
                <ReactMarkdown components={assistantMarkdownComponents}>
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            )}
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}
