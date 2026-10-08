import type { ComponentProps } from 'react'
import ReactMarkdown from 'react-markdown'

interface ExperienceItem {
  company: string
  location: string
  title: string
  startDate: string
  endDate: string
  current: boolean
  description: string
  links?: string[]
  highlights?: string[]
  technologies?: string[]
}

interface ExperienceSectionProps {
  mainExperience: ExperienceItem[]
}

const preprocessText = (text: string) => text.replace(/\n/g, '\n\n')

export function ExperienceSection({ mainExperience }: ExperienceSectionProps) {
  return (
    <section aria-labelledby="experience-heading">
      <h2
        id="experience-heading"
        className="text-xl font-semibold mb-6 pb-2 border-b border-border print:text-black flex items-center print:mb-2 print:text-sm"
      >
        <span className="mr-3 text-lg print:hidden" aria-hidden="true">
          💼
        </span>
        Experience
      </h2>
      <div className="space-y-8 print:space-y-0">
        {mainExperience.map((exp, idx) => (
          <article key={idx} className="mb-8 print-compact-exp print-keep-together">
            <div className="flex justify-between items-start mb-2 flex-wrap gap-x-4 print:mb-0.5">
              <div>
                <h3 className="text-lg font-bold text-blue print:text-xs print:font-bold print:text-black">
                  {exp.title}
                </h3>
                <p className="text-lg font-medium text-foreground print:text-xs print:font-bold">
                  {exp.company}
                </p>
              </div>
              <p className="text-sm italic text-muted-foreground whitespace-nowrap print:text-xs print:not-italic">
                {exp.location} | {exp.startDate} – {exp.endDate}
              </p>
            </div>
            <ul className="list-none pl-0 mt-3 print:mt-0.5 print:list-disc print:pl-4">
              {exp.highlights &&
                exp.highlights.length > 0 &&
                exp.highlights.map((highlight, hIdx) => (
                  <li
                    key={hIdx}
                    className="relative pl-5 mb-2 text-base leading-relaxed font-light print:pl-0 print:text-xs print:mb-1"
                  >
                    <span className="absolute left-0 text-blue font-bold print:hidden" aria-hidden="true">
                      —
                    </span>
                    <span className="prose prose-sm max-w-none">
                      <ReactMarkdown
                        components={{
                          p: ({ children, ...props }: ComponentProps<'span'>) => (
                            <span {...props}>{children}</span>
                          ),
                        }}
                      >
                        {preprocessText(highlight)}
                      </ReactMarkdown>
                    </span>
                  </li>
                ))}
              {exp.description && (
                <li className="relative pl-5 mb-2 text-base leading-relaxed font-light print:pl-0 print:text-xs print:mb-1">
                  <span className="absolute left-0 text-blue font-bold print:hidden" aria-hidden="true">
                    —
                  </span>
                  <span className="prose prose-sm max-w-none">
                    <ReactMarkdown
                      components={{
                        p: ({ children, ...props }: ComponentProps<'span'>) => (
                          <span {...props}>{children}</span>
                        ),
                      }}
                    >
                      {preprocessText(exp.description)}
                    </ReactMarkdown>
                  </span>
                </li>
              )}
            </ul>
            {exp.technologies && exp.technologies.length > 0 && (
              <p className="mt-3 text-sm text-muted-foreground print:mt-1 print:text-xs">
                <span className="font-medium text-foreground print:font-bold">Technologies: </span>
                {exp.technologies.join(', ')}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
