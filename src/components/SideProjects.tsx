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

const markdownComponents = {
  p: ({ children, ...props }: ComponentProps<'p'>) => (
    <p className="mb-3 last:mb-0" {...props}>
      {children}
    </p>
  ),
  br: (props: ComponentProps<'br'>) => <br {...props} />,
}

const preprocessText = (text: string) => text.replace(/\n/g, '\n\n')

function displayUrl(url: string) {
  return url.replace(/^https?:\/\//i, '').replace(/\/$/, '')
}

export function SideProjects({ projects }: SideProjectsProps) {
  if (projects.length === 0) return null

  return (
    <section className="mb-8 print:mb-4 print-keep-together" aria-labelledby="projects-heading">
      <h2
        id="projects-heading"
        className="text-xl font-semibold mb-6 pb-2 border-b border-border flex items-center print:mb-2"
      >
        <span className="mr-3 text-lg print:hidden" aria-hidden="true">
          🔗
        </span>
        Side Projects
      </h2>
      {projects.map((project: SideProjectItem, idx: number) => (
        <article key={idx} className="mb-4 print:mb-2">
          <h3 className="text-base font-medium text-foreground mb-2 print:mb-1 print:font-semibold">
            {project.title}
          </h3>
          <div className="mb-2 prose prose-sm max-w-none font-light print:mb-1">
            <ReactMarkdown components={markdownComponents}>
              {preprocessText(project.summary)}
            </ReactMarkdown>
          </div>
          {project.links && Object.keys(project.links).length > 0 && (
            <div className="flex flex-wrap gap-4 mt-2 print:mt-1 print:gap-1">
              {Object.entries(project.links).map(([label, url], lIdx) => (
                <span key={lIdx} className="block">
                  <a
                    href={url as string}
                    className="text-blue hover:underline text-sm font-medium print:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="print:hidden">{label}</span>
                    <span className="hidden print:inline">
                      <span className="font-semibold text-foreground">{label}: </span>
                      {displayUrl(url as string)}
                    </span>
                  </a>
                </span>
              ))}
            </div>
          )}
        </article>
      ))}
    </section>
  )
}
