'use client'

import { useState } from 'react'
import type { ComponentProps } from 'react'
import ReactMarkdown from 'react-markdown'
import { MarkdownLink } from './markdown'

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

export function ExperienceSection({ mainExperience }: ExperienceSectionProps) {
  const [expandedTech, setExpandedTech] = useState<number | null>(null)

  const preprocessText = (text: string) => {
    return text.replace(/\n/g, '\n\n')
  }

  return (
    <section aria-labelledby="experience-heading">
      <h2
        id="experience-heading"
        className="text-xl font-semibold mb-6 pb-2 border-b border-border flex items-center print:mb-2"
      >
        <span className="mr-3 text-lg print:hidden" aria-hidden="true">
          💼
        </span>
        Experience
      </h2>
      <div className="space-y-8 print:space-y-0">
        {mainExperience.map((exp, idx) => (
          <article key={idx} className="mb-8 print-compact-exp print-keep-together">
            <div className="print-job-header">
              <div className="flex justify-between items-start mb-2 flex-wrap print:mb-0.5 print:flex-col print:items-start">
                <div>
                  <h3 className="text-lg font-bold text-blue">{exp.title}</h3>
                  <p className="text-lg font-medium text-foreground">{exp.company}</p>
                </div>
                <p className="text-sm italic text-muted-foreground whitespace-nowrap print:not-italic">
                  {exp.location} | {exp.startDate} – {exp.endDate}
                </p>
              </div>
            </div>
            <ul className="list-none pl-0 mt-3 print:mt-1 print:list-disc print:pl-4 print:marker:text-blue">
              {exp.highlights &&
                exp.highlights.length > 0 &&
                exp.highlights.map((highlight, hIdx) => (
                  <li
                    key={hIdx}
                    className="relative pl-5 mb-2 text-base leading-relaxed font-light print:static print:pl-0 print:mb-0.5"
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
                          a: ({ href, children }: ComponentProps<'a'>) => (
                            <MarkdownLink href={href} className="text-blue hover:underline">
                              {children}
                            </MarkdownLink>
                          ),
                        }}
                      >
                        {preprocessText(highlight)}
                      </ReactMarkdown>
                    </span>
                  </li>
                ))}
              {exp.description && (
                <li className="relative pl-5 mb-2 text-base leading-relaxed font-light print:static print:pl-0 print:mb-0.5">
                  <span className="absolute left-0 text-blue-600 font-bold print:hidden" aria-hidden="true">
                    —
                  </span>
                  <span className="prose prose-sm max-w-none">
                    <ReactMarkdown
                      components={{
                        p: ({ children, ...props }: ComponentProps<'span'>) => (
                          <span {...props}>{children}</span>
                        ),
                        a: ({ href, children }: ComponentProps<'a'>) => (
                          <MarkdownLink href={href} className="text-blue hover:underline">
                            {children}
                          </MarkdownLink>
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
              <>
                <div className="mt-3 print:hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedTech(expandedTech === idx ? null : idx)}
                    className="text-sm text-blue hover:text-blue/80 flex items-center gap-1 cursor-pointer"
                    title="View technologies used"
                  >
                    <span aria-hidden="true">🛠️</span>
                    <span className="underline underline-offset-2">Technologies</span>
                    <span className="ml-1 text-xs">{expandedTech === idx ? '▲' : '▼'}</span>
                  </button>
                  {expandedTech === idx && (
                    <div className="mt-2 p-3 bg-muted/50 rounded border border-border">
                      <div className="flex flex-wrap gap-2">
                        {exp.technologies.map((tech, techIdx) => (
                          <span
                            key={techIdx}
                            className="bg-blue/10 text-blue px-2 py-1 rounded text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <p className="hidden print:block print-tech-line">
                  <span className="font-semibold text-foreground">Technologies: </span>
                  {exp.technologies.join(', ')}
                </p>
              </>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
