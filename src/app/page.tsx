import type { Metadata } from 'next'
import { fetchResume } from '@/hooks/useResume'
import { ResumeDisplay } from '@/components/resume/ResumeDisplay'

export async function generateMetadata(): Promise<Metadata> {
  const { resume } = await fetchResume()

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

export default async function Home() {
  const { resume, error } = await fetchResume()

  if (error || !resume) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">
            {error ? 'Error Loading Data' : 'No Data'}
          </h2>
        </div>
      </div>
    )
  }

  return <ResumeDisplay resume={resume} />
}
