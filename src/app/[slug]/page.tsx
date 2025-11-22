import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { ThemeToggle } from '../../components/ThemeToggle'
import { ExperienceSection } from '../../components/ExperienceSection'
import { ResumeHeader } from '../../components/ResumeHeader'
import { ProfessionalSummary } from '../../components/ProfessionalSummary'
import { SkillsSection } from '../../components/SkillsSection'
import { SideProjects } from '../../components/SideProjects'
import { EducationSection } from '../../components/EducationSection'

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

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  try {
    const { data: resumes } = await supabase
      .from('resumes')
      .select('name, slug')
      .eq('slug', slug)

    if (resumes && resumes.length > 0) {
      const resume = resumes[0]
      return {
        title: `${resume.name} - Resume`,
        description: `Professional resume for ${resume.name}`
      }
    }
  } catch (error) {
    // Ignore errors and fall back to default
  }

  return {
    title: 'Resume'
  }
}

export default async function ResumePage({ params }: PageProps) {
  const { slug } = await params

  const { data: resumes, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('slug', slug)

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Error Loading Data</h2>
        </div>
      </div>
    )
  }

  if (!resumes || resumes.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">No Data</h2>
        </div>
      </div>
    )
  }

  const resume = resumes[0]

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

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <ResumeHeader
          name={resume.name}
          photo={resume.photo}
          tagLine={resume.tag_line}
          currentLocation={resume.current_location}
        />

        {/* Main Content - Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Column - Experience */}
          <div className="w-full lg:flex-2">
            <ProfessionalSummary summary={resume.summary} />

            <ExperienceSection mainExperience={mainExperience} />
          </div>

          {/* Right Column - Skills, Education, Projects */}
          <div className="w-full lg:flex-1 lg:mt-0 mt-8">
            <SkillsSection skills={skills} />

            <SideProjects projects={sideProjects} />

            <EducationSection education={educations} />
          </div>
        </div>
      </div>
    </div>
  )
}
