import type { ComponentProps } from 'react'
import ReactMarkdown from 'react-markdown'

interface SideProjectItem {
  links: { [key: string]: string }
  title: string
  summary: string
}

interface SideProjectsProps {
  projects: SideProjectItem[]
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

export function SideProjects({ projects }: SideProjectsProps) {
  if (projects.length === 0) return null

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-border flex items-center">
        <span className="mr-3 text-lg">🔗</span> Side Projects
      </h2>
      {projects.map((project: SideProjectItem, idx: number) => (
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
  )
}
