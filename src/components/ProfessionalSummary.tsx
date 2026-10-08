import type { ComponentProps } from 'react'
import ReactMarkdown from 'react-markdown'

interface ProfessionalSummaryProps {
  summary: string
}

const markdownComponents = {
  p: ({ children, ...props }: ComponentProps<'p'>) => (
    <p className="mb-3 last:mb-0" {...props}>
      {children}
    </p>
  ),
  br: (props: ComponentProps<'br'>) => <br {...props} />,
}

const preprocessText = (text: string) => text.replace(/\n/g, '\n\n')

export function ProfessionalSummary({ summary }: ProfessionalSummaryProps) {
  return (
    <section className="mb-12 print:mb-4 print-keep-together" aria-labelledby="summary-heading">
      <h2
        id="summary-heading"
        className="text-xl font-semibold mb-6 pb-2 border-b border-border flex items-center print:mb-2"
      >
        <span className="mr-3 text-lg print:hidden" aria-hidden="true">
          🚀
        </span>
        Summary
      </h2>
      <div className="text-base leading-relaxed font-light prose prose-sm max-w-none">
        <ReactMarkdown components={markdownComponents}>{preprocessText(summary)}</ReactMarkdown>
      </div>
    </section>
  )
}
