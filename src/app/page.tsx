import type { Metadata } from 'next'
import type { ComponentProps } from 'react'
import { PostgrestError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { ThemeToggle } from '../components/ThemeToggle'
import ReactMarkdown from 'react-markdown'
import { ExperienceSection } from '../components/ExperienceSection'

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

interface EducationItem {
  institution: string
  degree: string
  date: string
}

interface SideProjectItem {
  links: { [key: string]: string }
  title: string
  summary: string
}

interface Resume {
  id: string
  slug: string
  name: string
  summary: string
  experience: ExperienceItem[]
  education: EducationItem[]
  skills: { [key: string]: string[] }
  side_projects?: SideProjectItem | SideProjectItem[]
  photo?: string
  tag_line?: string
  current_location?: string
  created_at: string
  updated_at: string
}

export const metadata: Metadata = {
  title: 'javier-aladid-garcia'
}

export default async function Home() {
  const { data: resume, error }: { data: Resume | null; error: PostgrestError | null } = await supabase
    .from('resumes')
    .select('*')
    .single()

  if (error || !resume) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Error Loading Resume</h2>
          <p className="text-lg mb-4">
            {error ? `Error: ${error.message}` : 'No resume data found.'}
          </p>
          <details className="text-sm text-muted-foreground">
            <summary>Full Error Details (if any)</summary>
            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-w-md mx-auto">
              {error ? JSON.stringify(error, null, 2) : 'No error object available.'}
            </pre>
          </details>
        </div>
      </div>
    )
  }

  const experiences: ExperienceItem[] = resume.experience || []
  const educations: EducationItem[] = resume.education || []
  const skills: { [key: string]: string[] } = resume.skills || {}

  // Handle side_projects - can be a single object or array
  const sideProjects: SideProjectItem[] = resume.side_projects
    ? Array.isArray(resume.side_projects)
      ? resume.side_projects
      : [resume.side_projects]
    : []

  const mainExperience = experiences

  // Custom components for ReactMarkdown to handle line breaks (for summary and projects)
  const markdownComponents = {
    p: ({ children, ...props }: ComponentProps<'p'>) => <p className="mb-3 last:mb-0" {...props}>{children}</p>,
    br: (props: ComponentProps<'br'>) => <br {...props} />,
  }

  // Helper function to preprocess text for line breaks (for summary and projects)
  const preprocessText = (text: string) => {
    return text.replace(/\n/g, '\n\n') // Ensure double newlines for paragraphs
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* Header */}
        <header className="text-center pb-6 sm:pb-8 mb-6 sm:mb-8 border-b-4 border-blue">
          {resume.photo && (
            <div className="flex justify-center mb-6">
              <img
                src={resume.photo}
                alt={`${resume.name} profile picture`}
                className="w-32 h-32 rounded-full object-cover border-4 border-border shadow-lg"
              />
            </div>
          )}
          <h1 className="text-3xl sm:text-5xl font-bold mb-3 text-foreground">{resume.name}</h1>
          {resume.tag_line && (
            <div className="text-lg sm:text-xl font-light text-muted-foreground mb-2">{resume.tag_line}</div>
          )}
          {resume.current_location && (
            <div className="text-sm sm:text-base text-muted-foreground">{resume.current_location}</div>
          )}
        </header>

        {/* Main Content - Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Column - Experience */}
          <div className="w-full lg:flex-2">
            {/* Professional Summary */}
            <section className="mb-12">
              <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-border flex items-center">
                <span className="mr-3 text-lg">🚀</span> Professional Summary
              </h2>
              <div className="text-base leading-relaxed font-light prose prose-sm max-w-none">
                <ReactMarkdown components={markdownComponents}>{preprocessText(resume.summary)}</ReactMarkdown>
              </div>
            </section>

            <ExperienceSection mainExperience={mainExperience} />
          </div>

          {/* Right Column - Skills, Education, Projects */}
          <div className="w-full lg:flex-1 lg:mt-0 mt-8">
            {/* Core Competencies */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-border flex items-center">
                <span className="mr-3 text-lg">🛠️</span> Core Competencies
              </h2>
              <div className="bg-muted p-4 rounded border border-border">
                <div className="space-y-3">
                  {Object.entries(skills).map(([category, categorySkills]) => (
                    categorySkills.length > 0 && (
                      <div key={category} className="pb-3 border-b border-border last:border-b-0 last:pb-0">
                        <span className="font-medium text-foreground mr-2 min-w-[80px] inline-block">{category}:</span>
                        <span className="text-muted-foreground">{categorySkills.join(', ')}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </section>

            {/* Side Projects */}
            {sideProjects.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-border flex items-center">
                  <span className="mr-3 text-lg">🔗</span> Side Projects
                </h2>
                {sideProjects.map((project: SideProjectItem, idx: number) => (
                  <div key={idx} className="mb-4">
                    <div className="text-base font-medium text-foreground mb-2">{project.title}</div>
                    <div className="mb-2 prose prose-sm max-w-none font-light">
                      <ReactMarkdown components={markdownComponents}>{preprocessText(project.summary)}</ReactMarkdown>
                    </div>
                    {project.links && Object.keys(project.links).length > 0 && (
                      <div className="flex gap-4 mt-2">
                        {Object.entries(project.links).map(([label, url], lIdx) => (
                          <span key={lIdx} className="block">
                            <span className="print:hidden">
                              <a
                                href={url as string}
                                className="text-blue hover:underline text-sm font-medium"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {label}
                              </a>
                            </span>
                            <span className="hidden print:inline text-sm text-muted-foreground">
                              {label}: {url as string}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </section>
            )}

            {/* Education & Certifications */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-border flex items-center">
                <span className="mr-3 text-lg">🎓</span> Education & Certifications
              </h2>
              <div className="space-y-4">
                {educations.map((edu, idx) => (
                  <div key={idx} className="mb-4">
                    <div className="font-medium text-foreground text-base mb-1">{edu.degree}</div>
                    <div className="text-sm italic text-muted-foreground">{edu.institution} ({edu.date})</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
