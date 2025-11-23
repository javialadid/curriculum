import type { Metadata } from 'next'
import { fetchResume } from '@/hooks/useResume'
import { ResumeDisplay } from '@/components/resume/ResumeDisplay'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const { resume } = await fetchResume({ slug })

  if (resume) {
    return {
      title: `${resume.name} - Resume`,
      description: `Professional resume for ${resume.name}`
    }
  }

  return {
    title: 'Resume'
  }
}

export default async function ResumePage({ params }: PageProps) {
  const { slug } = await params
  const { resume, error } = await fetchResume({ slug })

  if (error || !resume) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">
            {error ? 'Error Loading Data' : 'Resume Not Found'}
          </h2>
        </div>
      </div>
    )
  }

  return <ResumeDisplay resume={resume} />
}
