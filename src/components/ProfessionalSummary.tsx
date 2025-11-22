import type { ComponentProps } from 'react'
import ReactMarkdown from 'react-markdown'

interface ProfessionalSummaryProps {
  summary: string
}

// Custom components for ReactMarkdown to handle line breaks (for summary and projects)
const markdownComponents = {
  p: ({ children, ...props }: ComponentProps<'p'>) => <p className="mb-3 last:mb-0" {...props}>{children}</p>,
  br: (props: ComponentProps<'br'>) => <br {...props} />,
}

// Helper function to preprocess text for line breaks (for summary and projects)
const preprocessText = (text: string) => {
  return text.replace(/\n/g, '\n\n') // Ensure double newlines for paragraphs
}

export function ProfessionalSummary({ summary }: ProfessionalSummaryProps) {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-border flex items-center">
        <span className="mr-3 text-lg">🚀</span> Professional Summary
      </h2>
      <div className="text-base leading-relaxed font-light prose prose-sm max-w-none">
        <ReactMarkdown components={markdownComponents}>{preprocessText(summary)}</ReactMarkdown>
      </div>
    </section>
  )
}
