'use client'

import { useState } from 'react'
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

export function ExperienceSection({ mainExperience }: ExperienceSectionProps) {
  const [expandedTech, setExpandedTech] = useState<number | null>(null)

  // Helper function to preprocess text for line breaks
  const preprocessText = (text: string) => {
    return text.replace(/\n/g, '\n\n') // Ensure double newlines for paragraphs
  }

  return (
    <>
      {/* Professional Experience */}
      <section>
        <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-border print:text-black flex items-center print:mb-2 print:text-sm">
          <span className="mr-3 text-lg print:hidden">💼</span> Experience
        </h2>
        <div className="space-y-8 print:space-y-4">
          {mainExperience.map((exp, idx) => (
            <div key={idx} className="mb-8 print-compact-exp print-keep-together">
              <div className="flex justify-between items-start mb-2 flex-wrap print:mb-1">
                <div>
                  <div className="text-lg font-bold text-blue print:text-xs print:font-semibold">{exp.title}</div>
                  <div className="text-lg font-medium text-foreground print:text-xs">{exp.company}</div>
                </div>
                <div className="text-sm italic text-muted-foreground whitespace-nowrap print:text-xs print:not-italic">
                  {exp.location} | {exp.startDate} – {exp.endDate}
                </div>
              </div>
              <ul className="list-none pl-0 mt-3 print:mt-1 print:list-disc print:pl-3 print:marker:text-blue">
                {exp.highlights && exp.highlights.length > 0 && (
                  exp.highlights.map((highlight, hIdx) => (
                    <li key={hIdx} className="relative pl-5 mb-2 text-base leading-relaxed font-light print:pl-0 print:text-xs print:mb-1">
                      <span className="absolute left-0 text-blue font-bold print:hidden">—</span>
                      <span className="prose prose-sm max-w-none">
                        <ReactMarkdown components={{
                          p: ({ children, ...props }: ComponentProps<'span'>) => <span {...props}>{children}</span>
                        }}>{preprocessText(highlight)}</ReactMarkdown>
                      </span>
                    </li>
                  ))
                )}
                {exp.description && (
                  <li className="relative pl-5 mb-2 text-base leading-relaxed font-light print:pl-0 print:text-xs print:mb-1">
                    <span className="absolute left-0 text-blue-600 font-bold print:hidden">—</span>
                    <span className="prose prose-sm max-w-none">
                      <ReactMarkdown components={{
                        p: ({ children, ...props }: ComponentProps<'span'>) => <span {...props}>{children}</span>
                      }}>{preprocessText(exp.description)}</ReactMarkdown>
                    </span>
                  </li>
                )}
              </ul>
              {exp.technologies && exp.technologies.length > 0 && (
                <div className="mt-3 print:hidden">
                  <button
                    onClick={() => setExpandedTech(expandedTech === idx ? null : idx)}
                    className="text-sm text-blue hover:text-blue/80 flex items-center gap-1 cursor-pointer"
                    title="View technologies used"
                  >
                    <span className="print:hidden">🛠️</span>
                    <span className="underline underline-offset-2">Technologies</span>
                    <span className="ml-1 text-xs">
                      {expandedTech === idx ? '▲' : '▼'}
                    </span>
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
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
